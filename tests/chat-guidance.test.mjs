import test from 'node:test';import assert from 'node:assert/strict';
import {chatGuidance} from '../dist/public/chat-guidance.js';
import {chatFlow,assertRoundAdvance,assertReviewReply} from '../dist/lib/chat-flow.mjs';
const base={game:'liars',mode:'nexus',humanColor:1,turn:1,version:3,status:'playing',phase:'round_over'};
test('ラウンド後は返答反映まで次へ進めず、反映後は欄を隠す',()=>{
 assert.equal(chatGuidance(base,false).kind,'required');
 for(const move of ['next','next:confirm','{"action":"next"}',{action:'next'}])assert.throws(()=>assertRoundAdvance(base,move),/先に/);
 assert.throws(()=>assertReviewReply(base,{comment:'  '}),/空/);
 const reviewed={...base,chatReplyVersion:3};assertRoundAdvance(reviewed,{action:'next'});assert.equal(chatGuidance(reviewed,false).kind,'hidden');
 assert.throws(()=>assertRoundAdvance({...reviewed,version:4},'next'),/先に/);
});
test('通常のユーザー手番は非表示、AIの手番のみ必須表示',()=>{
 for(const game of ['liars','reversi','wordscale'])assert.equal(chatGuidance({...base,game,phase:'bidding'},false).kind,'hidden');
 assert.equal(chatGuidance({...base,phase:'bidding',turn:2},true).kind,'required');
 assert.equal(chatGuidance({...base,phase:'ready'},false).kind,'hidden');
});
test('複数ゲームの結果確認と練習モード、終了後の振り返り',()=>{
 for(const phase of ['round_over','hand_over','review'])assert.equal(chatFlow({...base,phase}).reviewRequired,true);
 const practice={...base,mode:'practice'};assertRoundAdvance(practice,'next');assert.equal(chatGuidance(practice,false).kind,'hidden');
 const ended={...base,status:'finished'};assert.equal(chatGuidance(ended,false).kind,'required');assert.equal(chatGuidance({...ended,chatReplyVersion:3},false).kind,'hidden');
 assert.equal(chatGuidance({...base,status:'abandoned'},false).kind,'hidden');
});
