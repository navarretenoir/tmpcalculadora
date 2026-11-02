// uso: node cdp.js URL OUTDIR W H DPR 'js1' 'js2' ...   (cada js se evalúa y se toma captura n.png; imprime el valor devuelto)
const {spawn}=require('child_process'),http=require('http'),fs=require('fs');
const [url,out,W,H,DPR,...steps]=process.argv.slice(2),port=9336;
const ch=spawn('google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--remote-debugging-port='+port,'--user-data-dir='+out+'/prof','about:blank'],{stdio:'ignore'});
const get=p=>new Promise((res,rej)=>http.get({port,path:p},r=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>res(JSON.parse(d)))}).on('error',rej));
(async()=>{let t;for(let i=0;i<60;i++){try{t=await get('/json');break}catch(e){await new Promise(r=>setTimeout(r,200))}}
const ws=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);let id=0;const cb={};
const send=(m,p)=>new Promise(r=>{const i=++id;cb[i]=r;ws.send(JSON.stringify({id:i,method:m,params:p||{}}))});
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')console.log('PAGE-EXC',JSON.stringify(m.params.exceptionDetails).slice(0,300));if(cb[m.id])cb[m.id](m.result)};await new Promise(r=>ws.onopen=r);
await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:+W,height:+H,deviceScaleFactor:+DPR,mobile:+W<700});
await send('Page.navigate',{url});await new Promise(r=>setTimeout(r,2500));
let n=0;for(const js of steps){n++;const r=await send('Runtime.evaluate',{expression:js,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)console.log('EXC',JSON.stringify(r.exceptionDetails).slice(0,300));console.log(n,JSON.stringify(r.result&&r.result.value));await new Promise(r=>setTimeout(r,500));const s=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(out+'/'+n+'.png',Buffer.from(s.data,'base64'))}
ch.kill();await new Promise(r=>setTimeout(r,500));try{fs.rmSync(out+'/prof',{recursive:true,force:true})}catch(e){};process.exit(0)})();
