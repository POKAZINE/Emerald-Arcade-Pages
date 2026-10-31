const reviewPhases=new Set(['round_over','hand_over','review']);
export function chatFlow(s){
 const actionRequired=s.status==='playing'&&s.turn===(s.game==='lastcard'?2:3-s.humanColor)&&!['round_over','hand_over'].includes(s.phase);
 const review=s.status==='playing'&&reviewPhases.has(s.phase);
 const replyPending=s.mode==='nexus'&&s.chatReplyVersion!==s.version;
 return {actionRequired,reviewRequired:replyPending&&review,replyRequired:s.mode==='nexus'&&(actionRequired||replyPending&&(review||s.status==='finished'))};
}
export function assertRoundAdvance(s,move){
 if(!chatFlow(s).reviewRequired)return;
 let action=move;
 if(typeof action==='string'){try{action=JSON.parse(action);}catch{action=action.split(':')[0];}}
 if((typeof action==='object'?action?.action:action)==='next')throw Error('先に今回の結果をAIへ送り、返答JSONを貼り付けて反映してください。');
}
export function assertReviewReply(s,reply){
 if((chatFlow(s).reviewRequired||s.status==='finished'&&chatFlow(s).replyRequired)&&!reply.comment.trim())throw Error('ラウンドの振り返りが空です。AIの台詞が入った返答JSONを貼り付けてください。');
}
