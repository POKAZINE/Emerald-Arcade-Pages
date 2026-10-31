import {chatFlow} from '../lib/chat-flow.mjs?v=0a1f66bfb06f';
import {chatGuidance} from './chat-guidance.js?v=0a1f66bfb06f';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const drafts=new Map(),opened=new Map();let generation=0;
export function renderChatBridge(s,api,refresh,toast){
 const seq=++generation;
 const previous=document.querySelector('#chat-bridge-dialog');if(previous?.open)previous.close();
 document.querySelector('#chat-bridge-host')?.remove();
 document.querySelector('#chat-bridge')?.remove();
 const flow=chatFlow(s);if(!flow.replyRequired)return;
 if(flow.reviewRequired){for(const button of document.querySelectorAll('#ld-confirm,#ip-next,#blackjack-next,#bf-next,#pp-next,#ws-next,#df-next,#nf-next,[data-tx-move="next"]')){button.disabled=true;button.title='先にAIの返答JSONを反映してください。';}}
 const panel=document.createElement('section');panel.id='chat-bridge';panel.className='chat-bridge';
 panel.innerHTML=`<div class="chat-bridge-heading"><div><span class="eyebrow">COPY · CHAT · PASTE</span><h2>チャットへ送る</h2><p>${esc(s.personaName)}とのチャットへ状況文を貼り付けてください。</p></div><span class="result-pill">版 ${s.version}</span></div><p class="small muted">① 状況文をコピー → ② AIのチャットへ送信 → ③ 返答のJSONを下へ貼り付けて反映。AIの手番が続いたら繰り返します。</p><p class="chat-privacy">手札などの秘密があるゲームでは、状況文とAIの返答JSONにAI側だけが知る情報も含まれます。開かずにコピーするとネタバレを避けやすくなりますが、コピー＆貼り付け方式では人間から完全に隠せません。</p><button type="button" class="primary" id="chat-copy" disabled>状況文を読み込み中…</button><details><summary>状況文を表示・手動でコピー（秘密を含む場合があります）</summary><textarea id="chat-prompt" readonly aria-label="AIへ送る状況文" rows="8"></textarea></details><label for="chat-reply">AIの返答JSON</label><textarea id="chat-reply" rows="4" placeholder="AIの返答をここへ貼り付け" autocomplete="off" spellcheck="false"></textarea><button type="button" class="secondary" id="chat-apply">返答を反映する</button><p id="chat-status" role="status" aria-live="polite"></p>`;
 const popupKey=s.id+':'+s.version;
 const host=document.createElement('div');host.id='chat-bridge-host';
 const reopen=document.createElement('button');reopen.type='button';reopen.id='chat-popup-open';reopen.className='secondary chat-popup-open';reopen.textContent='AI入力をポップアップで開く';
 const dialog=document.createElement('dialog');dialog.id='chat-bridge-dialog';dialog.className='chat-bridge-dialog';dialog.setAttribute('aria-label','AIへのコピーと返答入力');
 const close=document.createElement('button');close.type='button';close.className='close chat-popup-close';close.id='chat-popup-close';close.setAttribute('aria-label','ポップアップを閉じて画面内で入力する');close.textContent='×';close.autofocus=true;close.onclick=()=>{opened.set(popupKey,false);dialog.close();};dialog.oncancel=()=>opened.set(popupKey,false);
 dialog.append(close);host.append(reopen,panel,dialog);document.querySelector('#main').prepend(host);
 const open=()=>{opened.set(popupKey,true);dialog.append(panel);dialog.showModal();};
 dialog.onclose=()=>{if(host.isConnected){host.insertBefore(panel,dialog);reopen.focus({preventScroll:true});}};
 reopen.onclick=open;
 if(opened.get(popupKey)!==false&&!document.querySelector('#gt-effect-dialog[open]'))open();
 const guidance=document.createElement('div');guidance.className='chat-next-step';guidance.id='chat-next-step';guidance.setAttribute('aria-live','polite');guidance.textContent='次の操作を確認しています…';panel.prepend(guidance);
 const heading=panel.querySelector('h2'),description=panel.querySelector('.chat-bridge-heading p'),steps=panel.querySelector('.chat-bridge-heading + p');
 const reply=panel.querySelector('#chat-reply');reply.value=drafts.get(s.id)||'';reply.oninput=()=>drafts.set(s.id,reply.value);
 api(`games/${s.id}/chat-prompt`).then(result=>{if(seq!==generation||!panel.isConnected)return;const next=chatGuidance(s,result.actionRequired);guidance.dataset.kind=next.kind;guidance.innerHTML='<h3>'+esc(next.title)+'</h3><p>'+esc(next.message)+'</p>';
  if(next.target&&document.getElementById(next.target)){const jump=document.createElement('button');jump.type='button';jump.className='primary';jump.textContent=next.jumpLabel;jump.onclick=()=>{const target=document.getElementById(next.target);target?.scrollIntoView({behavior:'auto',block:'center'});target?.focus({preventScroll:true});};guidance.append(jump);}
  heading.textContent=result.actionRequired?'チャットへ送る':'結果をAIに伝える';description.textContent=s.personaName+'とのチャットへ状況文を貼り付け、返答JSONを反映してください。';steps.textContent='① 状況文をコピー → ② AIへ送信 → ③ 返答JSONを貼り付けて反映。';
  panel.querySelector('label[for="chat-reply"]').textContent='AIの返答JSON（必須）';
  panel.querySelector('#chat-prompt').value=result.prompt;const copy=panel.querySelector('#chat-copy');copy.disabled=false;copy.className='primary';copy.textContent=next.copyLabel;copy.onclick=async()=>{try{await navigator.clipboard.writeText(result.prompt);toast('コピーしました。AIのチャットへ貼り付けてください。');}catch{panel.querySelector('details').open=true;const text=panel.querySelector('#chat-prompt');text.focus();text.select();panel.querySelector('#chat-status').textContent='Ctrl+C、または長押しでコピーしてください。';}};}).catch(e=>{guidance.textContent='状況文を取得できませんでした。盤面の現在の手番を確認してください。';panel.querySelector('#chat-status').textContent=e.message;});
 panel.querySelector('#chat-apply').onclick=async e=>{e.target.disabled=true;try{const result=await api(`games/${s.id}/chat-reply`,'POST',{text:reply.value});if(result.chat_result?.action_applied===false&&result.chat_result?.message){toast(result.chat_result.message);}else {drafts.delete(s.id);toast('返答を反映しました。');}await refresh();}catch(error){panel.querySelector('#chat-status').textContent=error.message;e.target.disabled=false;}};
}
