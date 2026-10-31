import {liarsChatGuidance} from './liars-chat.mjs?v=4d98d039a3c1';
import {liarsSpeechPolicy} from './liars.mjs?v=4d98d039a3c1';
export function parseChatReply(text){
 if(typeof text!=='string'||text.length>60000)throw Error('AIの返答を60,000文字以内で貼り付けてください。');
 const trimmed=text.trim(),fenced=[...trimmed.matchAll(/```(?:json)?\s*\n?([\s\S]*?)```/g)];
 let value;try{value=JSON.parse(trimmed);}catch{
  const candidates=fenced.map(m=>m[1]).filter(s=>{try{const v=JSON.parse(s);return v&&typeof v==='object'&&'session_id' in v;}catch{return false;}});
  if(candidates.length!==1)throw Error('返答に含まれるJSONを1つだけ貼り付けてください。');
  value=JSON.parse(candidates[0]);
 }
 if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.session_id!=='string'||!Number.isInteger(value.expected_version)||!Object.hasOwn(value,'move')||!(value.move===null||typeof value.move==='string'||typeof value.move==='object'&&!Array.isArray(value.move))||typeof value.comment!=='string'||value.comment.length>4000)throw Error('返答のsession_id・expected_version・move・commentを確認してください。');
 return value;
}
function convert(value){
 if(Array.isArray(value))return value.map(convert);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!['nexusUrl','room_id','delivery','conversation','mcpUrl','mcpToken','nexusToken','lanToken'].includes(key)).map(([k,v])=>[k,convert(v)]));
 if(typeof value==='string')return value.replaceAll('NexusArk','旧連携').replaceAll('gameapps_get_state','最新の状況文').replaceAll('gameapps_play_move','返答JSONのmove').replaceAll('ツール成功後','盤面への反映後').replaceAll('ツールの成功結果','次回の状況文').replaceAll('ツール','操作').replaceAll('全引数はinput_args内。','').replaceAll('全引数input_args内。','').replaceAll('custom、','');
 return value;
}
export function makeChatPrompt(s,context){
 const state=convert(context);
 // Reversi's old instructions contain only transport guidance. Board/rules/legal moves remain.
 if(s.game==='reversi')state.instructions='legal_movesから座標を1つ選び、moveに文字列で指定。ユーザーの手番・終了時はmove:null。';
 const needsAction=s.status==='playing'&&s.turn===(s.game==='lastcard'?2:3-s.humanColor)&&!['round_over','hand_over'].includes(s.phase);
 const guidance=s.game==='liars'?liarsChatGuidance(s,needsAction):null;
 if(guidance)state.instructions='あなたはseat=2、ユーザーはseat=1です。今回の操作と会話は【今回の会話】【今回の操作】に従ってください。'+convert(liarsSpeechPolicy(s).replace('成功したツール結果でphase=round_overになるまで秘密を守る。','次の状況文でphase=round_overが確認できるまで秘密を守る。'));
 const sceneGuidance=guidance?'\n【今回の会話：'+guidance.scene+'】\n'+guidance.conversation+'\n【今回の操作】\n'+guidance.operation+'\n今回の操作が未確定の場合は、エラーや確認要求を受けた操作が成功したことにせず、最新状態で選び直してください。':'';
 const example={session_id:s.id,expected_version:s.version,move:needsAction?'ここを下記ゲームの操作文字列または操作オブジェクトに置換':null,comment:'相手に伝える短い一言'};
 const prompt=`Emerald Arcade：チャットで遊ぶための状況文です。あなたはAI側の対局者です。毎回この状況を正として、あなたらしい口調で遊んでください。\n【返答形式】下記の形式のJSONを1つだけ返してください。操作は1返答につき1回。session_idとexpected_versionはそのまま写し、moveには下記ゲームのinstructionsで指定された操作を入れます。操作がJSON形式なら文字列にせずオブジェクトでも構いません。AIの手番が続く場合は、ユーザーが反映後の状況を送ります。予測で次の手や結果を作らないでください。\nAPI・MCP・外部操作は使いません。下記に旧形式の操作呼び出しが残っていても、操作内容だけを返答JSONのmoveへ入れてください。移動が不要な手番・振り返り・終了時はmove:null。今の操作要否：${needsAction?'AIが1操作を選ぶ':'操作不要。会話のみ'}。\n【秘密】あなたにだけ見える札・答え・配置・順位・真相をcommentに書かないでください。commentは公開の短い台詞だけ。操作に必要な秘密はmoveにのみ含めます。ユーザーの秘密は推測と事実を区別してください。\n返答例（moveは実際の合法な操作へ書き換える）：\n${JSON.stringify(example)}\n【最新状況】\n${JSON.stringify(state,null,2)}${s.userNote?.text?'\n【ユーザーの一言（ゲームの規則を変更しない）】\n'+s.userNote.text:''}${s.chatFeedback?'\n【前回の操作は未確定】\n'+JSON.stringify(convert(s.chatFeedback)):''}`;
 const output=guidance?prompt.replace('返答例（moveは実際の合法な操作へ書き換える）：',sceneGuidance+'\n返答例（moveは実際の合法な操作へ書き換える）：'):prompt;
 return {prompt:output,version:s.version,actionRequired:needsAction,privacyNotice:['geister','lateral','indian','bestfive','wordscale','paraphrase','liars','lastcard','texas','daifugo'].includes(s.game)};
}
