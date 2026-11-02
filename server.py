"""Loopback-only demo. No upload, cloud inference, persistent document storage, or actions."""
import json
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
from core import assist, local_model_hint

ROOT=Path(__file__).parent
HOST='127.0.0.1'
PORT=8767
ORIGIN=f'http://{HOST}:{PORT}'
class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args): pass  # no request/document logs
    def respond(self,status,body,kind='application/json; charset=utf-8'):
        body=body.encode() if isinstance(body,str) else body
        self.send_response(status)
        self.send_header('Content-Type',kind)
        self.send_header('Content-Length',str(len(body)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'none'")
        self.end_headers(); self.wfile.write(body)
    def allowed(self):
        return self.headers.get('Host')==f'{HOST}:{PORT}' and self.headers.get('Origin') in (None,ORIGIN)
    def do_GET(self):
        if not self.allowed(): return self.respond(403,'{}')
        assets={'/':('index.html','text/html; charset=utf-8'),'/app.js':('app.js','text/javascript; charset=utf-8'),'/style.css':('style.css','text/css; charset=utf-8')}
        if self.path not in assets:return self.respond(404,'{}')
        name,kind=assets[self.path];self.respond(200,(ROOT/name).read_bytes(),kind)
    def do_POST(self):
        if not self.allowed():return self.respond(403,'{}')
        if self.path not in ('/api/assist','/api/model-hint'):return self.respond(404,'{}')
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=512 or self.headers.get('Content-Type')!='application/json':raise ValueError()
            d=json.loads(self.rfile.read(size))
            if type(d) is not dict or set(d)!={'case','lang'}:raise ValueError()
            result=assist(d['case'],d['lang'])
            if self.path=='/api/model-hint': result['model_hint']=local_model_hint(d['case'])
        except (ValueError,KeyError,TypeError):return self.respond(400,json.dumps({'error':'Choose a supported fictional sample and language.'}))
        self.respond(200,json.dumps(result,ensure_ascii=False))
if __name__=='__main__':
    print(f'Fictional sample demo: {ORIGIN}; no uploads, no submission, local model optional',flush=True)
    ThreadingHTTPServer((HOST,PORT),Handler).serve_forever()
