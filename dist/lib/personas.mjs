export function registerPersona(profiles,name,makeId=()=>crypto.randomUUID()){
 if(typeof name!=='string')throw Error('ペルソナ名を入力してください。');
 const display_name=name.trim();
 if(!display_name||display_name.length>80||/[\u0000-\u001f\u007f]/u.test(display_name))throw Error('ペルソナ名は改行を含まない1〜80文字で入力してください。');
 const existing=profiles.find(p=>p.display_name===display_name);
 if(existing)return {profiles,persona:existing,created:false};
 if(profiles.length>=50)throw Error('登録できる相手は50人までです。');
 const persona={room_id:'persona-'+makeId(),display_name};
 return {profiles:[...profiles,persona],persona,created:true};
}
