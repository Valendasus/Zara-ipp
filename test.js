const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const os=require('node:os');const path=require('node:path');
test('Полный цикл CRUD и обработка ошибок',async()=>{
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'api-contacts-'));process.env.DATA_FILE=path.join(dir,'contacts.json');await fs.writeFile(process.env.DATA_FILE,'[]');
const {createServer}=require('./server');const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/api/contacts`;
try{let r=await fetch(base);assert.equal(r.status,200);assert.deepEqual(await r.json(),[]);
r=await fetch(base,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Тест',phone:'+7999'})});assert.equal(r.status,201);const x=await r.json();assert.equal(x.id,1);
r=await fetch(base+'/1');assert.equal((await r.json()).name,'Тест');
r=await fetch(base+'/1',{method:'PUT',body:JSON.stringify({name:'Новый',phone:'+7888'})});assert.equal(r.status,200);assert.equal((await r.json()).name,'Новый');
r=await fetch(base+'/1',{method:'PATCH',body:JSON.stringify({email:'test@example.com'})});assert.equal((await r.json()).email,'test@example.com');
r=await fetch(base,{method:'POST',body:JSON.stringify({name:''})});assert.equal(r.status,400);
r=await fetch(base+'/999');assert.equal(r.status,404);
r=await fetch(base+'/1',{method:'DELETE'});assert.equal(r.status,204);
r=await fetch(base);assert.deepEqual(await r.json(),[]);
}finally{await new Promise(r=>server.close(r));delete process.env.DATA_FILE;await fs.rm(dir,{recursive:true,force:true});}
});
