import {chatFlow} from '../lib/chat-flow.mjs?v=0a1f66bfb06f';
export function chatGuidance(s,needsAction){
 if(!chatFlow(s).replyRequired)return {kind:'hidden'};
 if(needsAction)return {kind:'required',title:'次は、AIに状況文を送ってください',message:'状況文をコピーしてAIのチャットへ送信し、返答JSONをここに貼り付けて反映してください。AIの操作を反映すると先へ進めます。',copyLabel:'AIの手番：状況文をコピー'};
 if(s.status==='finished')return {kind:'required',title:'最後の結果をAIに伝えてください',message:'結果をコピーしてAIへ送り、感想の入った返答JSONを貼り付けて反映してください。',copyLabel:'対局結果をコピー'};
 return {kind:'required',title:'次へ進む前に、AIの返答を反映してください',message:'今回の結果をコピーしてAIへ送り、振り返りの入った返答JSONを貼り付けて反映してください。その後、盤面の「次へ」ボタンで進めます。',copyLabel:'今回の結果をコピー'};
}
