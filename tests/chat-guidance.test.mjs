import test from 'node:test';import assert from 'node:assert/strict';
import {chatGuidance} from '../dist/public/chat-guidance.js';
test('ライアーズのラウンド終了時は次へが主操作、コピーは任意',()=>{const g=chatGuidance({game:'liars',phase:'round_over',status:'playing'},false);assert.equal(g.kind,'optional');assert.equal(g.target,'ld-confirm');assert.match(g.title,/次のラウンドへ/);assert.match(g.copyLabel,/任意/);});
test('AIの手番では送信が必要。終了後は次のラウンドへ誘導しない',()=>{assert.equal(chatGuidance({game:'liars',phase:'bidding',status:'playing'},true).kind,'required');const ended=chatGuidance({game:'liars',phase:'round_over',status:'finished'},false);assert.equal(ended.target,undefined);assert.match(ended.title,/終了/);assert.equal(chatGuidance({game:'reversi',status:'playing'},false).kind,'optional');});
