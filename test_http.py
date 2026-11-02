import http.client
import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from server import Handler, HOST, PORT, ORIGIN

class HTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer((HOST,PORT),Handler)
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
    @classmethod
    def tearDownClass(cls):cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def request(self,method,path,body=None,headers=None):
        c=http.client.HTTPConnection(HOST,PORT,timeout=2);c.request(method,path,body,headers or {});r=c.getresponse();d=r.read();h=dict(r.getheaders());c.close();return r.status,d,h
    def test_home_and_security_headers(self):
        s,b,h=self.request('GET','/');self.assertEqual(s,200);self.assertEqual(h['Cache-Control'],'no-store');self.assertIn("form-action 'none'",h['Content-Security-Policy'])
    def test_real_post(self):
        s,b,h=self.request('POST','/api/assist',json.dumps({'case':'conflict','lang':'vi'}),{'Content-Type':'application/json','Origin':ORIGIN})
        self.assertEqual(s,200);self.assertEqual(json.loads(b)['status'],'NEEDS_DESK_CONFIRMATION')
    def test_host_rebinding_block(self):self.assertEqual(self.request('GET','/',headers={'Host':'evil.invalid'})[0],403)
    def test_cross_origin_block(self):self.assertEqual(self.request('POST','/api/assist','{}',{'Origin':'https://evil.invalid'})[0],403)
    def test_upload_route_absent(self):self.assertEqual(self.request('POST','/upload','private photo')[0],404)
    def test_no_filesystem_path(self):self.assertEqual(self.request('GET','/../../etc/passwd')[0],404)
    def test_arbitrary_document_rejected(self):self.assertEqual(self.request('POST','/api/assist','{"case":"renewal","lang":"ja","text":"private"}',{'Content-Type':'application/json'})[0],400)
    def test_oversize_rejected(self):self.assertEqual(self.request('POST','/api/assist','x'*513,{'Content-Type':'application/json'})[0],400)
    def test_invalid_json(self):self.assertEqual(self.request('POST','/api/assist','{',{'Content-Type':'application/json'})[0],400)

if __name__=='__main__':unittest.main()
