import {store,config,createGame,moveGame,view,rawGameContext,executeTool,patchDelivery,personaActionRequired,makeChatPrompt,parseChatReply,geisterIdentities,cfValidateColors,practiceMove} from './engine.mjs?v=0a1f66bfb06f';
import {chatFlow,assertRoundAdvance,assertReviewReply} from '../lib/chat-flow.mjs?v=0a1f66bfb06f';
import {registerPersona} from '../lib/personas.mjs?v=0a1f66bfb06f';
const settings=()=>Object.fromEntries(['title','subtitle','theme','sound','reducedMotion','volume','showExpressions','connectFourColors'].map(k=>[k,config[k]]));
let queue=Promise.resolve();
async function dispatch(route,method,b){
 if(route==='client')return {local:true,authenticated:true,browserOnly:true};
 if(route==='settings'){
  if(method==='POST'){for(const key of Object.keys(b))if(!['theme','sound','reducedMotion','volume','showExpressions'].includes(key))throw Error('この設定は変更できません。');if(b.theme!==undefined&&!['light','dark','system'].includes(b.theme))throw Error('テーマを確認してください。');if(b.volume!==undefined&&(!Number.isFinite(b.volume)||b.volume<0||b.volume>1))throw Error('音量は0〜1で指定してください。');for(const key of ['sound','reducedMotion','showExpressions'])if(b[key]!==undefined&&typeof b[key]!=='boolean')throw Error('設定を確認してください。');Object.assign(config,b);store.saveSettings(config);}return settings();
 }
 if(route==='personas'&&method==='POST'){
  const result=registerPersona(config.personas||[],b.name);config.personas=result.profiles;store.saveSettings(config);return {persona:result.persona,created:result.created};
 }
 if(route==='connection')return {rooms:config.personas||[],lastRoomId:config.lastPersona?.roomId||(config.personas||[])[0]?.room_id||''};
 if(route==='records/export')return store.exportData();
 if(route==='games'){if(method==='POST'){const created=createGame(b);return practiceResult(created.id);}return store.all().map(view);}
 const match=route.match(/^games\/([\w-]+)(?:\/(history|move|end|chat-prompt|chat-reply|identities|appearance|notify-result))?$/);if(!match)throw Error('この操作は公開版では使用しません。');
 const [,id,action]=match,s=store.get(id);
 if(!action)return view(s);
 if(action==='history')return store.history(id).map(view);
 if(action==='chat-prompt'){if(s.mode!=='nexus')throw Error('チャット対局で使用してください。');return makeChatPrompt(s,rawGameContext(s));}
 if(method!=='POST')throw Error('操作形式が異なります。');
 if(action==='move'){assertRoundAdvance(s,b.move??b.index);moveGame(id,b.move??b.index,'human',b.version,b.note);return practiceResult(id);}
 if(action==='end'){if(s.status!=='playing')throw Error('対局は終了しています。');s.status='abandoned';s.endedAt=new Date().toISOString();store.update(s);return view(s);}
 if(action==='identities'){if(s.game!=='geister'||b.version!==s.version)throw Error('最新の対局を確認してください。');return {identities:geisterIdentities(s)};}
 if(action==='appearance'){if(s.game!=='connectfour'||s.status!=='playing'||s.turn!==s.humanColor||b.version!==s.version)throw Error('あなたの手番に変更してください。');cfValidateColors(b.userColor,b.personaColor);s.pieceColors={[s.humanColor]:b.userColor,[3-s.humanColor]:b.personaColor};store.update(s);config.connectFourColors={user:b.userColor,persona:b.personaColor};store.saveSettings(config);return view(s);}
 if(action==='notify-result')return view(s);
 if(action==='chat-reply'){
  if(s.mode!=='nexus')throw Error('チャット対局で使用してください。');const reply=parseChatReply(b.text);
  if(reply.session_id!==id||reply.expected_version!==s.version)throw Error('別の対局、または古い返答です。最新状況をコピーしてください。');
  if(s.chatReplyVersion===s.version)throw Error('この版への返答は反映済みです。');
  assertReviewReply(s,reply);
  let result;if(reply.move===null){if(personaActionRequired(s))throw Error('AIの手番です。moveが必要です。');result={action_applied:false};}
  else{if(!personaActionRequired(s))throw Error('今はAIの手番ではありません。');result=executeTool('gameapps_play_move',{session_id:id,room_id:s.roomId,expected_version:s.version,move:typeof reply.move==='string'?reply.move:JSON.stringify(reply.move)});}
  const latest=store.get(id);
  if(result.action_applied!==false||reply.move===null){latest.chatReplyVersion=chatFlow(s).reviewRequired&&latest.phase===s.phase?latest.version:s.version;latest.chatFeedback=null;store.update(latest);patchDelivery(id,{status:'sent',message:personaActionRequired(latest)?'AIの手番が続きます。最新状況をもう一度コピーしてください。':'返答を反映しました。'},reply.comment);}
  else{latest.chatFeedback={message:result.message,detail:result};store.update(latest);}
  return {...view(store.get(id)),chat_result:result};
 }
}
function practiceResult(id){let s=store.get(id),count=0;while(s.mode==='practice'&&s.status==='playing'&&s.turn!==s.humanColor){if(++count>100)throw Error('操作が長く続いています。ページを開き直してください。');moveGame(id,practiceMove(s),'persona',s.version);s=store.get(id);}return view(s);}
export function browserApi(route,method='GET',data={}){
 const run=async()=>{await store.reload();Object.assign(config,store.settings());let result;try{result=await dispatch(route,method,data);await store.flush();return structuredClone(result);}catch(error){await store.flush();throw error;}};
 const locked=()=>globalThis.navigator?.locks?navigator.locks.request('emerald-arcade-personal',run):run();
 const result=queue.then(locked);queue=result.catch(()=>{});return result;
}
