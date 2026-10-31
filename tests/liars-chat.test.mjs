import test from 'node:test';
import assert from 'node:assert/strict';
import {initialLiars,applyLiars,liarsContext} from '../dist/lib/liars.mjs';
import {makeChatPrompt,parseChatReply} from '../dist/lib/chat-bridge.mjs';
import {liarsChatGuidance} from '../dist/lib/liars-chat.mjs';
const initial=()=>({id:'chat-guidance-test',roomId:'test',mode:'nexus',status:'playing',version:0,conversation:[],delivery:{status:'idle'},...initialLiars(false,'persona')});
const prompt=s=>makeChatPrompt(s,liarsContext(s));
const context=p=>JSON.parse(p.split('【最新状況】\n')[1]);
test('開始・双方の手番・ラウンド終了・対局終了を実際のゲーム進行で区別する',()=>{
 let s=initial();let p=prompt(s);assert.equal(p.actionRequired,false);assert.match(p.prompt,/今回の会話：opening/);assert.match(p.prompt,/まだダイスは振られていません/);assert.match(p.prompt,/moveはnull/);
 s=applyLiars(s,{action:'next'},'human',()=>2);p=prompt(s);assert.equal(p.actionRequired,true);assert.match(p.prompt,/今回の会話：ai_turn/);assert.match(p.prompt,/選択時の台詞/);assert.match(p.prompt,/結果を先取りしない/);assert.match(p.prompt,/挑発・ブラフは必須ではありません/);
 s=applyLiars(s,{action:'bid',face:2,count:1,total:10},'persona');p=prompt(s);assert.equal(p.actionRequired,false);assert.match(p.prompt,/今回の会話：user_turn/);assert.match(p.prompt,/ユーザーの操作を急かし/);
 s=applyLiars(s,{action:'fold'},'human');p=prompt(s);assert.match(p.prompt,/今回の会話：round_end/);assert.match(p.prompt,/公開済みの出目は振り返れます/);assert.match(p.prompt,/次のラウンドの開始はユーザーに任せ/);
 p=prompt({...s,status:'finished'});assert.match(p.prompt,/今回の会話：match_end/);assert.match(p.prompt,/総合勝敗を区別/);assert.match(p.prompt,/次のラウンドの開始は案内しない/);
 assert.equal(liarsChatGuidance({...s,status:'abandoned'},false).scene,'abandoned');
});
test('現在の合法操作・数量・レイズの制約を指定し、返答形式と秘密の投影を維持する',()=>{
 let s=applyLiars(initial(),{action:'next'},'human',()=>6);s.dice[1]=[1,1,1,1,1];
 const p=prompt(s),c=context(p.prompt);assert.deepEqual(c.own_dice,[6,6,6,6,6]);assert.equal(c.opponent_dice,null);assert.deepEqual(c.legal_actions.actions,['bid']);assert.match(p.prompt,/legal_actions\.actions/);assert.match(p.prompt,/minCountByFace\[face-1\]/);assert.match(p.prompt,/totalは追加額ではなく/);assert.match(p.prompt,/raiseStep/);assert.doesNotMatch(c.instructions,/成功した操作結果で会話/);assert.match(c.instructions,/秘密を守る/);
 const reply={session_id:s.id,expected_version:s.version,move:{action:'bid',face:6,count:1,total:100},comment:'ここは強気でいくね。'};assert.deepEqual(parseChatReply(JSON.stringify(reply)),reply);
 s=applyLiars(s,reply.move,'persona');s=applyLiars(s,{action:'bid',face:1,count:2,total:100},'human');const allIn=prompt(s);assert.equal(context(allIn.prompt).legal_actions.allIn,true);assert.match(allIn.prompt,/allInがtrueなら上乗せできません/);assert.throws(()=>applyLiars(s,{action:'bid',face:1,count:3,total:110},'persona'));assert.doesNotThrow(()=>applyLiars(s,{action:'bid',face:1,count:3,total:100},'persona'));
});
test('他ゲームには試行用のライアーズ指示を追加しない',()=>{const p=makeChatPrompt({id:'r',game:'reversi',status:'playing',humanColor:1,turn:2,version:0},{legal_moves:['D3']});assert.doesNotMatch(p.prompt,/今回の会話：|minCountByFace/);assert.match(p.prompt,/D3/);});
