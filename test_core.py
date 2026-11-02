import json
import unittest
from core import assist, redact, local_model_hint, validate_model_selection, MODEL, LOCAL_API

class FakeResponse:
    def __init__(self, content): self.content=content
    def __enter__(self):return self
    def __exit__(self,*args):pass
    def read(self,limit):return self.content[:limit]

class CoreTests(unittest.TestCase):
    def test_all_nine_paths_grounded(self):
        for case in ('renewal','conflict','injection'):
            for lang in ('ja','en','vi'):
                with self.subTest(case=case,lang=lang):
                    d=assist(case,lang)
                    self.assertTrue(d['next_step']);self.assertFalse(d['can_submit'])
                    for c in d['citations']:self.assertIn(c['quote'],d['source_text'])
    def test_pii_is_removed_from_projection(self):
        s=json.dumps(assist('renewal','ja'),ensure_ascii=False)
        self.assertNotIn('山田見本',s);self.assertNotIn('123456789012',s)
    def test_full_width_id(self):self.assertNotIn('１２３４５６７８９０１２',redact('個人番号：１２３４５６７８９０１２'))
    def test_conflict_keeps_both_dates(self):
        d=assist('conflict','en');self.assertEqual(len(d['citations']),2);self.assertIn('NEEDS',d['status'])
    def test_document_url_does_not_become_contact(self):
        d=assist('injection','ja');self.assertEqual(d['external_links'],[]);self.assertEqual(d['citations'],[])
        self.assertEqual(d['status'],'STOPPED_UNTRUSTED_INSTRUCTION')
    def test_invalid_samples(self):
        for case,lang in [('random','ja'),('renewal','xx'),('../../etc/passwd','en')]:
            with self.assertRaises(ValueError):assist(case,lang)
    def test_model_cannot_generate_new_action(self):
        for raw in ['{}','{"explanation_id":"upload"}','{"explanation_id":"ask_desk","url":"https://evil.invalid"}','[]','null','garbage']:
            with self.subTest(raw=raw),self.assertRaises((ValueError,TypeError)):validate_model_selection(raw)
    def test_no_model_calls_for_ambiguous_or_attack(self):
        def forbidden(*a,**k):raise AssertionError('must not call')
        for case in ('conflict','injection'):self.assertEqual(local_model_hint(case,forbidden)['status'],'NOT_CALLED_UNSAFE_OR_AMBIGUOUS')
    def test_missing_runtime_fails_closed(self):
        def failed(*a,**k):raise ConnectionRefusedError()
        self.assertEqual(local_model_hint('renewal',failed)['explanation_id'],'ask_desk')
    def test_local_payload_minimized_and_no_credentials(self):
        def stub(req,**kwargs):
            self.assertEqual(req.full_url,LOCAL_API);p=req.data.decode()
            self.assertNotIn('山田',p);self.assertNotIn('2026',p);self.assertNotIn('123456',p)
            self.assertNotIn('Authorization',req.headers)
            return FakeResponse(json.dumps({'model':MODEL,'message':{'content':'{"explanation_id":"prepare_documents"}'}}).encode())
        self.assertEqual(local_model_hint('renewal',stub)['status'],'LOCAL_RESPONSE_SCHEMA_VERIFIED')
    def test_wrong_model_identity_rejected(self):
        def stub(*a,**k):return FakeResponse(b'{"model":"other","message":{"content":"{}"}}')
        self.assertEqual(local_model_hint('renewal',stub)['explanation_id'],'ask_desk')
    def test_response_size_cap(self):
        def stub(*a,**k):return FakeResponse(b'x'*9000)
        self.assertEqual(local_model_hint('renewal',stub)['status'],'LOCAL_MODEL_UNAVAILABLE_OR_INVALID')

if __name__=='__main__':unittest.main()
