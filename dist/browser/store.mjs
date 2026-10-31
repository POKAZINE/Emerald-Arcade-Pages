const copy=value=>structuredClone(value);
const done=tx=>new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('記録を保存できませんでした。'));tx.onerror=()=>{};});
const value=req=>new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
export class BrowserStore{
 static async open(){
  if(!globalThis.indexedDB)throw Error('このブラウザでは記録を保存できません。通常のブラウザで開き直してください。');
  const request=indexedDB.open('emerald-arcade-personal-v1',1);
  request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('settings');db.createObjectStore('games',{keyPath:'id'});db.createObjectStore('turns',{keyPath:['id','version']});};
  const store=new BrowserStore(await value(request));await store.reload();return store;
 }
 constructor(db){this.db=db;this.pending=[];this.games=new Map();this.turns=new Map();this.config={};}
 async reload(){await this.flush();const tx=this.db.transaction(['settings','games','turns'],'readonly');const complete=done(tx);const [settings,games,turns]=await Promise.all([value(tx.objectStore('settings').get('current')),value(tx.objectStore('games').getAll()),value(tx.objectStore('turns').getAll())]);await complete;this.config=settings||{};this.games=new Map(games.map(g=>[g.id,g]));this.turns=new Map();for(const t of turns){const rows=this.turns.get(t.id)||[];rows.push(t.body);this.turns.set(t.id,rows);}}
 persist(stores,write){const tx=this.db.transaction(stores,'readwrite');const complete=done(tx);write(tx);this.pending.push(complete);complete.catch(()=>{});}
 async flush(){const batch=this.pending.splice(0);try{await Promise.all(batch);}catch{throw Error('ブラウザに記録を保存できませんでした。空き容量や保存設定を確認して、ページを開き直してください。');}}
 settings(){return copy(this.config);}
 saveSettings(config){this.config=copy(config);this.persist(['settings'],tx=>tx.objectStore('settings').put(this.config,'current'));}
 get(id){if(!this.games.has(id))throw Error('このブラウザには対局がありません。');return copy(this.games.get(id));}
 all(){return copy([...this.games.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));}
 create(s){if(this.games.has(s.id))throw Error('対局IDが重複しています。');this.games.set(s.id,copy(s));this.persist(['games'],tx=>tx.objectStore('games').put(copy(s)));}
 update(s,version=null){this.updateMany([s],version);}
 updateMany(states,version=null){
  if(!states.length||states.some(s=>s.id!==states[0].id))throw Error('同じ対局の状態を指定してください。');
  const s=states.at(-1);if(version!==null&&this.get(s.id).version!==version)throw Error('盤面が更新されています。最新状態を確認してください。');
  this.games.set(s.id,copy(s));const history=new Map((this.turns.get(s.id)||[]).map(t=>[t.version,t]));for(const row of states)if(row.version>0)history.set(row.version,copy(row));this.turns.set(s.id,[...history.values()]);
  this.persist(['games','turns'],tx=>{tx.objectStore('games').put(copy(s));for(const row of states)if(row.version>0)tx.objectStore('turns').put({id:row.id,version:row.version,body:copy(row)});});
 }
 history(id){this.get(id);return copy((this.turns.get(id)||[]).sort((a,b)=>a.version-b.version));}
 exportData(){return {format:'emerald-arcade-personal',version:1,exportedAt:new Date().toISOString(),settings:this.settings(),games:this.all(),turns:[...this.turns.values()].flatMap(copy)};}
}
