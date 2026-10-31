export const randomUUID=()=>crypto.randomUUID();
export function randomInt(min,max){if(max===undefined){max=min;min=0;}const range=max-min;if(!Number.isSafeInteger(range)||range<=0||range>0x100000000)throw Error('乱数の範囲が不正です。');const limit=Math.floor(0x100000000/range)*range;let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=limit);return min+n%range;}
