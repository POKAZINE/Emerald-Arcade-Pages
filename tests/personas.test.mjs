import test from 'node:test';
import assert from 'node:assert/strict';
import {registerPersona} from '../dist/lib/personas.mjs';
test('表示名を整え、サービスに依存しない固定IDで登録する',()=>{const r=registerPersona([],'  テストの相手  ',()=> 'fixed');assert.deepEqual(r.persona,{room_id:'persona-fixed',display_name:'テストの相手'});assert.equal(r.created,true);const again=registerPersona(r.profiles,'テストの相手',()=>{throw Error('must reuse');});assert.equal(again.created,false);assert.equal(again.profiles.length,1);assert.equal(again.persona.room_id,r.persona.room_id);});
test('空欄・改行・制御文字・長すぎる名前と登録上限を拒否する',()=>{for(const name of ['','   ','a\nb','a\u0000b','a'.repeat(81),null])assert.throws(()=>registerPersona([],name));assert.throws(()=>registerPersona(Array.from({length:50},(_,i)=>({room_id:String(i),display_name:String(i)})),'new'));});
