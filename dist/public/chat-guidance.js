export function chatGuidance(s,needsAction){
 if(s.status==='finished'||s.status==='abandoned')return {kind:'optional',title:s.status==='finished'?'対局は終了しました':'対局は中止されています',message:'コピーは任意です。結果をAIに伝えて感想を聞くことも、そのままゲーム選択へ戻ることもできます。',copyLabel:'結果をAIに伝える（任意）'};
 if(needsAction)return {kind:'required',title:'次は、AIに状況文を送ってください',message:'状況文をコピーしてAIのチャットへ送信し、返答JSONをここに貼り付けて反映してください。AIの操作を反映すると先へ進めます。',copyLabel:'AIの手番：状況文をコピー'};
 if(s.game==='liars'&&s.phase==='round_over')return {kind:'optional',title:'次は「次のラウンドへ」を押せます',message:'今回のラウンドは終了しています。コピー・返答の貼り付けは任意です。続けるときは盤面の「次のラウンドへ」を押してください。結果をAIに伝えて感想を聞いてから進むこともできます。',copyLabel:'今回の結果をAIに伝える（任意）',target:'ld-confirm',jumpLabel:'次のラウンドの操作へ ↓'};
 if(['round_over','hand_over','review'].includes(s.phase))return {kind:'optional',title:'次は、盤面の操作で進められます',message:'コピー・返答の貼り付けは任意です。次のラウンドや次のお題へ進む場合は、盤面の次へ進むボタンを押してください。AIに感想を聞いてから進むこともできます。',copyLabel:'振り返りをAIに送る（任意）'};
 return {kind:'optional',title:'次は、あなたが盤面で操作してください',message:'今はAIの操作は不要です。盤面のボタンで進めてください。会話をしたい場合だけ、状況文をコピーしてAIへ送れます。',copyLabel:'会話用の状況文をコピー（任意）'};
}
