export function liarsChatGuidance(s,needsAction){
 const style='commentはあなたらしい口調で、ゲームの雰囲気に合う短い1〜2文にしてください。口調や感情表現は自由で、挑発・ブラフは必須ではありません。';
 const noMove='moveはnull。ユーザーの代わりに操作せず、nextを選ばないでください。';
 if(s.status==='abandoned')return {scene:'abandoned',conversation:style+'対局は中止されています。必要なら遊んだ時間への短い一言を返し、勝敗を作らないでください。',operation:noMove};
 if(s.status==='finished')return {scene:'match_end',conversation:style+'最新状況の確定した最終結果・最終チップと、公開された印象的な場面を振り返ってください。ラウンド単独の勝者と総合勝敗を区別し、次のラウンドの開始は案内しないでください。',operation:noMove};
 if(s.phase==='round_over')return {scene:'round_end',conversation:style+'今回の確定した結果とチップの変化に反応してください。このラウンドで公開済みの出目は振り返れます。次のラウンドの開始はユーザーに任せ、急かさないでください。',operation:noMove};
 if(s.phase==='ready')return {scene:'opening',conversation:style+'開始前の挨拶や意気込みを話してください。まだダイスは振られていません。出目や勝敗を作らず、開始操作はユーザーに任せてください。',operation:noMove};
 if(needsAction)return {scene:'ai_turn',conversation:style+'今返すJSONの操作は、まだ盤面に反映されていません。commentは選択時の台詞にしてください。例：「ダウト！」はよいですが、「ダウト成功、私の勝ち！」のように成功・勝敗・公開前の出目・精算結果を先取りしないでください。今回の操作結果は次の状況文を受け取ってから振り返ります。自分の秘密の出目や内訳、そこから逆算できる理由は話さないでください。',operation:'最新状況のlegal_actions.actionsが、あなたが今選べるactionの一覧です。ルール説明より現在の一覧と制約を優先し、一覧にないactionを作らず、1つだけ選んでください。bidは宣言と賭け合計を同時に指定する操作で、raiseという別actionはありません。bidを選ぶ場合、faceは1〜6の整数、countはlegal_actions.minCountByFace[face-1]以上かつmaxCount以下の整数。totalは追加額ではなく参加料込みの賭け合計で、legal_actions.currentBet以上・maxTotal以下の整数です。上乗せなしならtotal=currentBet。上乗せする場合はminRaiseTotal以上で、currentBetからの増分をraiseStep刻みにします。ただし上限maxTotalへのオールインは端数でも可能。allInがtrueなら上乗せできません。doubt・foldもactionsにある場合だけ選べます。moveには{"action":"bid","face":目,"count":個数,"total":賭け合計}、{"action":"doubt"}、{"action":"fold"}のいずれかを、現在許可されている場合に限り指定してください。'};
 return {scene:'user_turn',conversation:style+'ユーザーの手番です。公開されている宣言・賭け・直前の操作への短い反応や会話を楽しんでください。「あなたの番です」とだけ返す必要はありません。ユーザーの操作を急かしたり、秘密の出目や未報告の表情を知っているように話したりしないでください。',operation:noMove};
}
