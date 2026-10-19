const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const PORT = Number(process.env.PORT || 3001);
const DATA = process.env.DATA_FILE || path.join(__dirname, 'contacts.json');
const ui = path.join(__dirname, 'public', 'index.html');
function send(res, status, body) {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
}
async function load() { return JSON.parse(await fs.readFile(DATA,'utf8')); }
async function save(contacts) { await fs.writeFile(DATA, JSON.stringify(contacts,null,2)+'\n','utf8'); }
async function body(req) {
  let data = '';
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 10000) { const e = new Error('Слишком большой запрос');e.status = 413;throw e; }
  }
  try { return JSON.parse(data); } catch { const e=new Error('Некорректный JSON');e.status=400;throw e; }
}
function valid(x) {return x && typeof x.name==='string' && x.name.trim() && typeof x.phone==='string' && x.phone.trim() && (x.email===undefined || typeof x.email==='string');}
function createServer(){return http.createServer(async (req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    if(req.method==='GET' && url.pathname==='/') {res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(await fs.readFile(ui));return;}
    if(!url.pathname.startsWith('/api/contacts')) return send(res,404,{error:'Маршрут не найден'});
    const m = url.pathname.match(/^\/api\/contacts(?:\/(\d+))?$/);
    if(!m) return send(res,404,{error:'Маршрут не найден'});
    const id=m[1]?Number(m[1]):null;
    let contacts=await load();
    if(req.method==='GET') {
      if(id===null) return send(res,200,contacts);
      const item=contacts.find(x=>x.id===id);
      return item?send(res,200,item):send(res,404,{error:'Контакт не найден'});
    }
    if(req.method==='POST' && id===null) {
      const x=await body(req);if(!valid(x))return send(res,400,{error:'Нужны непустые name и phone; email должен быть строкой'});
      const contact={id:Math.max(0,...contacts.map(c=>c.id))+1,name:x.name.trim(),phone:x.phone.trim(),email:x.email||''};
      contacts.push(contact);await save(contacts);return send(res,201,contact);
    }
    if((req.method==='PUT'||req.method==='PATCH') && id!==null) {
      const index=contacts.findIndex(x=>x.id===id);if(index<0)return send(res,404,{error:'Контакт не найден'});
      const x=await body(req);
      const updated=req.method==='PATCH'?{...contacts[index],...x}:{...x};
      if(!valid(updated))return send(res,400,{error:'Некорректные данные контакта'});
      contacts[index]={id,name:updated.name.trim(),phone:updated.phone.trim(),email:updated.email||''};
      await save(contacts);return send(res,200,contacts[index]);
    }
    if(req.method==='DELETE' && id!==null){
      const index=contacts.findIndex(x=>x.id===id);if(index<0)return send(res,404,{error:'Контакт не найден'});
      contacts.splice(index,1);await save(contacts);res.writeHead(204);return res.end();
    }
    return send(res,405,{error:'Метод не поддерживается'});
  } catch(e){return send(res,e.status||500,{error:e.status?e.message:'Внутренняя ошибка сервера'});}
});}
if(require.main===module) createServer().listen(PORT,()=>console.log(`Телефонный справочник: http://localhost:${PORT}`));
module.exports={createServer};
