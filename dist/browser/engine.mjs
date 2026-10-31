import {BrowserStore} from './store.mjs?v=4d98d039a3c1';
import {randomUUID} from './crypto.mjs?v=4d98d039a3c1';
import {makeChatPrompt,parseChatReply} from '../lib/chat-bridge.mjs?v=4d98d039a3c1';
import {initialLiars,applyLiars,liarsView,liarsContext,liarsBotMove} from '../lib/liars.mjs?v=4d98d039a3c1';
import {initialNineflags,applyNineflags,nineflagsView,nineflagsContext,nineflagsBotMove} from '../lib/nineflags.mjs?v=4d98d039a3c1';
import {initialQuartet,applyQuartet,quartetView,quartetContext,quartetBotMove} from '../lib/quartet.mjs?v=4d98d039a3c1';
import {APP_NAME} from '../public/branding.js?v=4d98d039a3c1';
import {initialParaphrase,applyParaphrase,paraphraseView,paraphraseContext,paraphraseBotMove} from '../lib/paraphrase.mjs?v=4d98d039a3c1';
import {initialBestfive,applyBestfive,bestfiveView,bestfiveContext,bestfiveBotMove} from '../lib/bestfive.mjs?v=4d98d039a3c1';
import {initialIndian,applyIndian,indianView,indianContext,indianBotMove} from '../lib/indian.mjs?v=4d98d039a3c1';
import {expressionName} from '../public/persona-expression.js?v=4d98d039a3c1';
import {initialGeister,applyGeister,geisterView,geisterContext,geisterBotMove,geisterIdentities} from '../lib/geister.mjs?v=4d98d039a3c1';
import {initialLateral,applyLateral,lateralView,lateralContext,lateralPracticeMove} from '../lib/lateral.mjs?v=4d98d039a3c1';
import {toolDefinitions} from '../lib/mcp-tools.mjs?v=4d98d039a3c1';
import {personaActionRequired,withMcpProgress,unconfirmedOperation,shouldRepairOperation} from '../lib/mcp-progress.mjs?v=4d98d039a3c1';
import {initialLastcard,applyLastcard,lastcardView,lastcardContext,lastcardBotAction} from '../lib/lastcard.mjs?v=4d98d039a3c1';
import {initialWordscale,applyWordscale,wordscaleView,wordscaleContext,wordscaleBotMove} from '../lib/wordscale.mjs?v=4d98d039a3c1';
import {beginNotification,completeNotification} from '../lib/notification-metrics.mjs?v=4d98d039a3c1';
import {initialMancala,applyMancala,mancalaView,mancalaContext,mancalaBotMove} from '../lib/mancala.mjs?v=4d98d039a3c1';
import {connectionURL,normalizeRooms,setupStatus,setupDiagnostic} from '../lib/connection-setup.mjs?v=4d98d039a3c1';
import {initialDaifugo,applyDaifugo,daifugoView,daifugoContext,daifugoBotMove} from '../lib/daifugo.mjs?v=4d98d039a3c1';
import {initialTexas,applyTexas,texasView,texasContext,texasBotMove} from '../lib/texas.mjs?v=4d98d039a3c1';
import {cfValidateColors} from '../public/connectfour-colors.js?v=4d98d039a3c1';
import {initialConnectFour,applyConnectFour,connectFourView,connectFourContext,connectFourBotMove} from '../lib/connectfour.mjs?v=4d98d039a3c1';
import {initialHitBlow,applyHitBlow,hitBlowView,hitBlowContext,hitBlowBotMove,hitBlowDuplicate} from '../lib/hitblow.mjs?v=4d98d039a3c1';
import {initialBlackjack,prepareQuickBlackjack,applyBlackjack,blackjackView,blackjackContext,blackjackBotMove,completePreparedDeal,collectBlackjackNote} from '../lib/blackjack.mjs?v=4d98d039a3c1';
import {initialBoard,applyMove,view as reversiView,coordinate,parseMove,legalMoves,flips} from '../lib/reversi.mjs?v=4d98d039a3c1';
import {initialYacht,applyYacht,yachtView,yachtContext,yachtBotMove} from '../lib/yacht.mjs?v=4d98d039a3c1';
import {yachtScoreReview} from '../lib/yacht-score-review.mjs?v=4d98d039a3c1';
import {normalizeArguments,requireArguments} from '../lib/mcp-arguments.mjs?v=4d98d039a3c1';
import {gameNotification,commentaryInstruction,NOTIFICATION_FORMAT} from '../lib/game-notification.mjs?v=4d98d039a3c1';
import {gameOutcome} from '../lib/game-outcome.mjs?v=4d98d039a3c1';
import {failureMessage,recoveryMessage} from '../lib/connection-recovery.mjs?v=4d98d039a3c1';
const store=await BrowserStore.open();
const defaults={title:APP_NAME,subtitle:'ChatGPT・Claude・Geminiと、コピー＆貼り付けで遊ぼう。',theme:'system',sound:false,reducedMotion:false,showExpressions:true,volume:.45,nexusUrl:'manual-chat'};
const config={...defaults,...store.settings()};
const privateLateral={get(){throw Error('私用問題はこの版では使用しません。');}};
const jobs=new Map();const saveConfig=()=>store.saveSettings(config);const broadcast=()=>{};function schedule(){}
const view=s=>s.game==='liars'?liarsView(s):s.game==='nineflags'?nineflagsView(s):s.game==='quartet'?quartetView(s):s.game==='paraphrase'?paraphraseView(s):s.game==='bestfive'?bestfiveView(s):s.game==='indian'?indianView(s):s.game==='geister'?geisterView(s):s.game==='lateral'?lateralView(s):s.game==='lastcard'?lastcardView(s):s.game==='wordscale'?wordscaleView(s):s.game==='mancala'?mancalaView(s):s.game==='daifugo'?daifugoView(s):s.game==='texas'?texasView(s):s.game==='connectfour'?connectFourView(s):s.game==='hitblow'?hitBlowView(s):s.game==='blackjack'?blackjackView(s):s.game==='yacht'?yachtView(s):reversiView(s);
function gameContext(s){return withMcpProgress(s,rawGameContext(s));}
function rawGameContext(s){if(s.game==='liars')return {...liarsContext(s),outcome:gameOutcome(s)};if(s.game==='nineflags')return {...nineflagsContext(s),outcome:gameOutcome(s)};if(s.game==='quartet')return {...quartetContext(s),outcome:gameOutcome(s)};if(s.game==='paraphrase')return {...paraphraseContext(s),outcome:gameOutcome(s)};if(s.game==='bestfive')return {...bestfiveContext(s),outcome:gameOutcome(s)};if(s.game==='indian')return {...indianContext(s),outcome:gameOutcome(s)};if(s.game==='geister')return {...geisterContext(s),outcome:gameOutcome(s)};if(s.game==='lateral')return {...lateralContext(s),outcome:gameOutcome(s)};if(s.game==='lastcard')return {...lastcardContext(s),outcome:gameOutcome(s)};if(s.game==='wordscale')return wordscaleContext(s);if(s.game==='mancala')return {...mancalaContext(s),outcome:gameOutcome(s)};if(s.game==='daifugo')return {...daifugoContext(s),outcome:gameOutcome(s)};if(s.game==='texas')return {...texasContext(s),outcome:gameOutcome(s)};if(s.game==='connectfour')return {...connectFourContext(s),outcome:gameOutcome(s)};if(s.game==='hitblow')return {...hitBlowContext(s),outcome:gameOutcome(s)};if(s.game==='blackjack')return {...blackjackContext(s),outcome:gameOutcome(s)};if(s.game==='yacht')return {...yachtContext(s,s.lastHumanTurn===undefined?store.history(s.id):[]),outcome:gameOutcome(s)};return {session_id:s.id,game:'reversi',room_id:s.roomId,version:s.version,status:s.status,outcome:gameOutcome(s),turn:s.status!=='playing'?null:s.turn===s.humanColor?'user':'persona',persona_color:s.humanColor===1?'white':'black',board:s.board.reduce((rows,_,i)=>{if(i%8===0)rows.push(s.board.slice(i,i+8).map(v=>'.BW'[v]).join(''));return rows;},[]),legal_moves:s.status==='playing'?legalMoves(s.board,s.turn).map(coordinate):[],last_move:s.lastMove,rules:'8×8のリバーシ。黒が先手。縦横斜めに相手の石を挟んで裏返す。置けなければ自動パス。双方置けなくなれば終了し石の多い側が勝ち。',instructions:s.status==='finished'?gameOutcome(s).message:'あなたは対局者です。Emerald Arcadeはchessカテゴリではなくcustomカテゴリの拡張ツールです。必要なら request_capability(category=custom) で取得してください。NexusArkのMCP中継では、すべての引数を input_args 辞書にまとめて呼び出してください。トップレベルに直接置くと中継で引数が失われます。自分の手番に最新のsession_id、room_id、versionを使い gameapps_play_move({input_args:{session_id:対局ID,room_id:ルームID,expected_version:version,move:合法手}}) を呼びます。操作結果を受けて会話してください。'+(s.testCommentary?'\n'+commentaryInstruction(s):'')};}
function createGame(b){
  if(b.game!==undefined&&!['liars','nineflags','quartet','paraphrase','bestfive','indian','geister','lateral','lastcard','reversi','yacht','blackjack','hitblow','connectfour','texas','daifugo','mancala','wordscale'].includes(b.game))throw Error('ゲームを選んでください。');
  if(b.game==='lastcard'&&((b.playerCount!==undefined&&![2,3].includes(b.playerCount))||(b.stacking!==undefined&&typeof b.stacking!=='boolean')))throw Error('人数とドロー重ねを確認してください。');
  if(b.game==='lastcard'&&((b.multiPlay!==undefined&&typeof b.multiPlay!=='boolean')||(b.firstPlayer!==undefined&&!['random','user','persona','bot'].includes(b.firstPlayer))||(b.firstPlayer==='bot'&&(b.playerCount??2)!==3)))throw Error('まとめ出しと先手設定を確認してください。');
  if(b.game==='mancala'&&b.winCondition!==undefined&&!['score','empty'].includes(b.winCondition))throw Error('マンカラの勝利条件を選んでください。');
  if(b.game==='mancala'&&b.capture!==undefined&&typeof b.capture!=='boolean')throw Error('横取り設定はON/OFFで指定してください。');
  if(b.game==='blackjack'&&b.splitEnabled!==undefined&&typeof b.splitEnabled!=='boolean')throw Error('スプリット設定はON/OFFで指定してください。');
  if(b.game==='blackjack'&&b.playStyle==='quick'&&b.splitEnabled===true)throw Error('スプリットは通常版で選べます。');
  if(b.game==='hitblow'&&b.allowDuplicates!==undefined&&typeof b.allowDuplicates!=='boolean')throw Error('答えの同色設定はON/OFFで指定してください。');
  if(!['practice','nexus'].includes(b.mode))throw Error('対戦モードを選んでください。');
  if(b.mode==='nexus'&&(!b.roomId||typeof b.roomId!=='string'))throw Error('対戦するルームを選んでください。');
  if(b.playStyle!==undefined&&!['quick','standard'].includes(b.playStyle))throw Error('遊ぶ長さを選んでください。');
  if(b.playStyle==='quick'&&!['liars','nineflags','paraphrase','bestfive','indian','daifugo','texas','blackjack','wordscale'].includes(b.game))throw Error('このゲームにはお気軽版はありません。');
  if(b.game==='texas'&&b.playStyle!=='quick'&&b.handLimit!==undefined&&![5,10].includes(b.handLimit))throw Error('通常版は5か10ハンドです。');
  if(b.privatePuzzleId!==undefined&&(b.game!=='lateral'||b.mode!=='nexus'||typeof b.privatePuzzleId!=='string'))throw Error('私用問題はペルソナとの水平思考クイズで選んでください。');
  const privatePuzzle=b.privatePuzzleId?privateLateral.get(b.privatePuzzleId,b.roomId,config.nexusUrl):null;
  const quick=b.playStyle==='quick';
  const color=b.color==='white'?2:b.color==='random'?(Math.random()<0.5?1:2):1;
  let s={id:randomUUID(),game:'reversi',mode:b.mode,roomId:b.mode==='practice'?'practice':b.roomId,personaName:b.mode==='practice'?'練習ボット':String(b.personaName||b.roomId).slice(0,100),nexusUrl:b.mode==='nexus'?config.nexusUrl:null,humanColor:color,board:initialBoard(),turn:1,status:'playing',version:0,createdAt:new Date().toISOString(),lastMove:null,passed:null,result:null,endedAt:null,delivery:{status:'idle'},conversation:[],...(b.game==='liars'?initialLiars(quick,b.firstPlayer??'random'):b.game==='nineflags'?initialNineflags(b.tactics??true,b.firstPlayer??'random',quick):b.game==='quartet'?initialQuartet(b.firstGiver??'random'):b.game==='paraphrase'?initialParaphrase(quick,b.roleMode??'alternate'):b.game==='bestfive'?initialBestfive(quick,b.genre??'daily',b.firstSetter??'random'):b.game==='indian'?initialIndian(quick):b.game==='geister'?initialGeister(b.firstPlayer??'random'):b.game==='lateral'?initialLateral({privatePuzzle,mode:b.mode,genre:b.genre??'any',difficulty:b.difficulty??'any',played:store.all().filter(g=>g.game==='lateral'&&g.status==='finished'&&g.mode===b.mode).map(g=>g.puzzle?.id)}):b.game==='lastcard'?initialLastcard(b.playerCount??2,b.stacking??false,undefined,undefined,{multiPlay:b.multiPlay??false,firstPlayer:b.firstPlayer??'random'}):b.game==='wordscale'?initialWordscale(quick):b.game==='mancala'?initialMancala(b.capture===true,b.winCondition??'score'):b.game==='daifugo'?initialDaifugo(b.rulesConfig,quick):b.game==='texas'?initialTexas(quick?2:b.handLimit??5):b.game==='connectfour'?initialConnectFour():b.game==='yacht'?{game:'yacht',...initialYacht()}:b.game==='blackjack'?initialBlackjack(quick,b.splitEnabled===true):b.game==='hitblow'?initialHitBlow(1,b.allowDuplicates===true):{})};
  if(s.game==='blackjack'&&quick)s=completePreparedDeal(prepareQuickBlackjack(s));
  if(s.game==='connectfour'&&config.connectFourColors){s.pieceColors={[color]:config.connectFourColors.user,[3-color]:config.connectFourColors.persona};}
  store.create(s);if(s.mode==='nexus'){config.lastPersona={roomId:s.roomId};saveConfig();}broadcast(s.id);if(['nineflags','quartet'].includes(s.game)){if(s.turn!==s.humanColor)schedule(s.id);return view(s);}if(['paraphrase','geister','lateral','lastcard','wordscale'].includes(s.game)&&s.turn!==s.humanColor)schedule(s.id);if(s.game==='blackjack'&&quick&&s.status==='finished')schedule(s.id);if(s.game!=='liars'&&s.game!=='paraphrase'&&s.game!=='bestfive'&&s.game!=='indian'&&s.game!=='geister'&&s.game!=='lateral'&&s.game!=='lastcard'&&s.game!=='wordscale'&&s.game!=='daifugo'&&s.game!=='texas'&&s.game!=='blackjack'&&(!['hitblow','connectfour','mancala'].includes(s.game)||s.turn!==s.humanColor))schedule(s.id);return view(s);
}
function moveGame(id,index,actor,expectedVersion,note=''){
  const before=store.get(id);if(['liars','nineflags','quartet','paraphrase','bestfive','indian','geister','lateral','lastcard','wordscale'].includes(before.game)&&actor==='human'&&jobs.has(id))throw Error('相手の返答が終わってから操作してください。');if(!Number.isInteger(expectedVersion)||expectedVersion!==before.version)throw Error('盤面が更新されています。最新の盤面を確認してください。');
  if(typeof note!=='string'||note.length>500)throw Error('一言は500文字以内で入力してください。');
  let after=before.game==='liars'?applyLiars(before,index,actor):before.game==='nineflags'?applyNineflags(before,index,actor):before.game==='quartet'?applyQuartet(before,index,actor):before.game==='paraphrase'?applyParaphrase(before,index,actor):before.game==='bestfive'?applyBestfive(before,index,actor):before.game==='indian'?applyIndian(before,index,actor):before.game==='geister'?applyGeister(before,index,actor):before.game==='lateral'?applyLateral(before,index,actor):before.game==='lastcard'?applyLastcard(before,index,actor):before.game==='wordscale'?applyWordscale(before,index,actor):before.game==='mancala'?applyMancala(before,index,actor):before.game==='daifugo'?applyDaifugo(before,index,actor):before.game==='texas'?applyTexas(before,index,actor):before.game==='connectfour'?applyConnectFour(before,index,actor):before.game==='hitblow'?applyHitBlow(before,index,actor):before.game==='blackjack'?applyBlackjack(before,index,actor):before.game==='yacht'?applyYacht(before,index,actor):applyMove(before,index,actor);
  const humanTurn=actor==='human'&&(after.game!=='yacht'||after.lastMove.action==='score');
  if(note.trim()&&(!humanTurn||after.mode!=='nexus'))throw Error('一言はペルソナ対局の着手・役の確定時に添えられます。');
  if(humanTurn&&!['liars','nineflags','quartet','indian','lastcard','blackjack','hitblow','texas','daifugo','mancala'].includes(after.game))after.userNote={text:note.trim(),version:after.version};
  const snapshots=[after];if(after.game==='blackjack'&&after.phase==='deal'){after=completePreparedDeal(after);snapshots.push(after);}
  if(actor==='human'&&after.game==='blackjack'&&after.mode==='nexus')collectBlackjackNote(after,note);
  if(actor==='human'&&after.game==='blackjack'&&after.phase==='player')after.delivery={status:'idle',message:after.playerHands?'手札'+(after.activeHand+1)+'を操作中です。両組の操作後に、一言とまとめてペルソナへ伝えます。':'配札しました。あなたの手番終了後に、操作と一言をペルソナへ伝えます。'};
  if(actor==='human'&&['liars','indian','texas','daifugo'].includes(after.game)&&after.mode==='nexus'){
    const pending=after.pendingUserNotes||[];if(note.trim())pending.push(note.trim());const notify=after.turn!==after.humanColor||['hand_over','round_over'].includes(after.phase);after.userNote={text:notify?pending.join('\n'):'',version:after.version};after.pendingUserNotes=notify?[]:pending;
  }
  if(actor==='human'&&['nineflags','quartet','lastcard','hitblow','mancala'].includes(after.game)&&after.mode==='nexus'){
    const pending=after.pendingUserNotes||[];if(note.trim())pending.push(note.trim());const notify=after.turn!==after.humanColor||after.status==='finished'||(!before.matchDecided&&after.matchDecided);after.userNote={text:notify?pending.join('\n'):'',version:after.version};after.pendingUserNotes=notify?[]:pending;
  }
  store.updateMany(snapshots,before.version);broadcast(id);
  if(['nineflags','quartet'].includes(after.game)){if(after.mode==='practice'||actor==='human'&&(after.turn!==after.humanColor||after.status==='finished'))schedule(id);return view(after);}
  if(after.game==='paraphrase'||after.game==='bestfive'){if(actor==='human'&&(after.turn===2||after.phase==='review'&&before.phase!=='review'))schedule(id);return view(after);}
  if(after.game==='lateral'){if(actor==='human'&&(after.turn===2||after.status==='finished'))schedule(id);return view(after);}
  if(after.game==='lastcard'){if(after.mode==='practice'||actor==='human'&&(after.turn===2||after.status==='finished'))schedule(id);return view(after);}
  if(after.game==='wordscale'){if(actor==='human'&&(after.turn!==after.humanColor||after.status==='finished'||after.phase==='review'&&before.phase!=='review'))schedule(id);return view(after);}
  const notifyHuman=actor==='human'&&(['liars','indian','texas','daifugo'].includes(after.game)?(after.turn!==after.humanColor||['hand_over','round_over'].includes(after.phase)):['hitblow','mancala'].includes(after.game)?(after.turn!==after.humanColor||after.status==='finished'||(!before.matchDecided&&after.matchDecided)):after.game==='blackjack'?(after.turn!==after.humanColor||after.phase==='round_over'):(after.game!=='yacht'||after.lastMove.action==='score'));
  if(notifyHuman||after.mode==='practice')schedule(id);
  return view(after);
}
function patchDelivery(id,delivery,reply,replyInfo={}){const s=store.get(id);s.delivery={...s.delivery,...delivery};if(reply)s.conversation.push({role:'persona',text:reply,at:new Date().toISOString(),...replyInfo});store.update(s);broadcast(id);}
function executeTool(name,rawArgs){
  const args=normalizeArguments(rawArgs);
  if(name==='gameapps_list_games')return [{id:'liars',name:'ライアーズダイス',players:2},{id:'nineflags',name:'九旗のかけひき',players:2},{id:'quartet',name:'しるしの四重奏',players:2},{id:'paraphrase',name:'ことばの言いかえ',players:2,cooperative:true},{id:'bestfive',name:'ふたりのベスト5',players:2,cooperative:true},{id:'indian',name:'インディアンポーカー',players:2},{id:'geister',name:'おばけのかくしごと',players:2},{id:'lateral',name:'水平思考クイズ',players:2,cooperative:true},{id:'lastcard',name:'ラストカード',players:3},{id:'wordscale',name:'ことばのものさし',players:2,cooperative:true},{id:'reversi',name:'リバーシ',players:2},{id:'yacht',name:'ヨット',players:2},{id:'blackjack',name:'ブラックジャック',players:2},{id:'hitblow',name:'ヒット＆ブロー',players:2},{id:'connectfour',name:'四目並べ',players:2},{id:'texas',name:'テキサスポーカー',players:2},{id:'daifugo',name:'大富豪',players:2},{id:'mancala',name:'マンカラ',players:2}];
  if(name==='gameapps_list_sessions')requireArguments(args,['room_id']);
  if(name==='gameapps_list_sessions')return store.all().filter(s=>s.mode==='nexus'&&s.roomId===args.room_id&&s.status==='playing').map(gameContext);
  requireArguments(args,['session_id','room_id']);
  const s=store.get(String(args.session_id||''));if(s.mode!=='nexus'||s.roomId!==args.room_id)throw Error('このルームの対局ではありません。');
  if(name==='gameapps_get_state')return gameContext(s);
  if(name==='gameapps_play_move')requireArguments(args,['expected_version','move']);
  if(name==='gameapps_play_move'){
    if(args.expected_version!==s.version)throw Error('盤面が更新されています。最新の版番号を確認してください。');
    if(s.turn===s.humanColor)throw Error('まだあなたの手番ではありません。');
    if(s.game==='hitblow'){const confirmation=hitBlowDuplicate(s,args.move);if(confirmation)return unconfirmedOperation(confirmation,gameContext(s));}
    const review=yachtScoreReview(s,args.move);
    if(review)return unconfirmedOperation(review,gameContext(s));
    const move=['liars','nineflags','quartet','paraphrase','bestfive','indian','geister','lateral','lastcard','blackjack','hitblow','connectfour','texas','daifugo','mancala','wordscale'].includes(s.game)?args.move:s.game==='yacht'?args.move.replace(/:confirm$/,''):parseMove(args.move);
    moveGame(s.id,move,'persona',args.expected_version);return {...gameContext(store.get(s.id)),action_applied:true};
  }
  throw Error('不明なツールです。');
}
function practiceMove(s){let selected;const id=s.id;const returnMove=(id,move)=>{selected=move;};(()=>{const latest=s;if(latest.game==='liars'){returnMove(id,liarsBotMove(latest),'persona',latest.version);return;}if(latest.game==='nineflags'){returnMove(id,nineflagsBotMove(latest),'persona',latest.version);return;}if(latest.game==='quartet'){returnMove(id,quartetBotMove(latest),'persona',latest.version);return;}if(latest.game==='paraphrase'){returnMove(id,paraphraseBotMove(latest),'persona',latest.version);return;}if(latest.game==='bestfive'){returnMove(id,bestfiveBotMove(latest),'persona',latest.version);return;}if(latest.game==='indian'){returnMove(id,indianBotMove(latest),'persona',latest.version);return;}if(latest.game==='geister'){returnMove(id,geisterBotMove(latest),'persona',latest.version);return;}if(latest.game==='lateral'){returnMove(id,lateralPracticeMove(latest),'persona',latest.version);return;}if(latest.game==='lastcard'){returnMove(id,JSON.stringify(lastcardBotAction(latest)),'persona',latest.version);return;}if(latest.game==='wordscale'){returnMove(id,wordscaleBotMove(latest),'persona',latest.version);return;}if(latest.game==='mancala'){returnMove(id,mancalaBotMove(latest),'persona',latest.version);return;}if(latest.game==='daifugo'){returnMove(id,daifugoBotMove(latest),'persona',latest.version);return;}if(latest.game==='texas'){returnMove(id,texasBotMove(latest),'persona',latest.version);return;}if(latest.game==='connectfour'){returnMove(id,connectFourBotMove(latest),'persona',latest.version);return;}if(latest.game==='hitblow'){returnMove(id,hitBlowBotMove(latest),'persona',latest.version);return;}if(latest.game==='blackjack'){returnMove(id,blackjackBotMove(latest),'persona',latest.version);return;}if(latest.game==='yacht'){returnMove(id,yachtBotMove(latest),'persona',latest.version);return;}const choices=legalMoves(latest.board,latest.turn);choices.sort((a,b)=>{const value=i=>([0,7,56,63].includes(i)?100:0)+flips(latest.board,i,latest.turn).length;return value(b)-value(a);});returnMove(id,choices[0],'persona',latest.version);})();return selected;}

export {store,config,createGame,moveGame,view,rawGameContext,executeTool,patchDelivery,personaActionRequired,makeChatPrompt,parseChatReply,geisterIdentities,cfValidateColors,practiceMove};
