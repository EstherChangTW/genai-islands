export const PREFIX='COMMUNITYISL1.';
export function fresh(name='訪客',avatar=0){return {version:1,name,avatar,visited:[],answers:[],best:{},stamps:[],traded:[],bag:{'貝殼':3},position:0,finalPassed:false};}
export function exp(s,r){return s.visited.length*r.firstVisit+s.answers.reduce((sum,a)=>sum+(a.correct?(a.first?r.firstCorrect:r.repeatCorrect):0),0)+s.stamps.length*r.firstClear+s.traded.length*2;}
export function level(x){return x<30?1:x<80?2:x<150?3:x<250?4:5+Math.floor((x-250)/120);}
export function visit(s,id){if(!id||s.visited.includes(id))return false;s.visited.push(id);s.position=id;return true;}
export function answer(s,q,pick){const correct=pick===q.correct;const first=!s.answers.some(a=>a.id===q.id&&a.correct);s.answers.push({id:q.id,correct,first:correct&&first});return {correct,first};}
export function clear(s,id,score){s.best[id]=Math.max(s.best[id]||0,score);if(score>=2&&!s.stamps.includes(id)){s.stamps.push(id);return true;}return false;}
export function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0');}
export function encode(s){const text=JSON.stringify(s);const bytes=new TextEncoder().encode(text);let b='';bytes.forEach(v=>b+=String.fromCharCode(v));const payload=btoa(b);return PREFIX+payload+'.'+hash(payload);}
export function validate(s){
 if(!s||s.version!==1||typeof s.name!=='string'||s.name.trim().length<2||s.name.length>12||!Number.isInteger(s.avatar)||s.avatar<0||s.avatar>2)throw Error('存檔格式或冒險者資料不正確。');
 for(const key of ['visited','stamps'])if(!Array.isArray(s[key])||s[key].length>7||new Set(s[key]).size!==s[key].length||s[key].some(i=>!Number.isInteger(i)||i<1||i>7))throw Error('島嶼紀錄不正確。');
 if(!Array.isArray(s.answers)||s.answers.length>100000||s.answers.some(a=>!a||!/^([1-7])-[0-2]$/.test(a.id)||typeof a.correct!=='boolean'||typeof a.first!=='boolean'))throw Error('作答紀錄不正確。');
 const seen=new Set();for(const a of s.answers){if(a.first!==Boolean(a.correct&&!seen.has(a.id)))throw Error('作答順序紀錄不正確。');if(a.correct)seen.add(a.id);}
 if(!s.best||typeof s.best!=='object'||Object.entries(s.best).some(([k,v])=>!/^([1-7])$/.test(k)||!Number.isInteger(v)||v<0||v>3))throw Error('成績格式不正確。');
 if(s.stamps.some(i=>!s.visited.includes(i)||!(s.best[i]>=2)))throw Error('島章與成績不符。');
 const items=['貝殼','蘋果','花束','小魚飾品','航海紙','海玻璃','星砂','島主明信片'];
 if(!s.bag||typeof s.bag!=='object'||Object.entries(s.bag).some(([k,v])=>!items.includes(k)||!Number.isInteger(v)||v<0||v>1000000))throw Error('背包格式不正確。');
 if(!Array.isArray(s.traded)||new Set(s.traded).size!==s.traded.length||s.traded.some(x=>!/^r[0-7]-[0-2]$/.test(x))||!Number.isInteger(s.position)||s.position<0||s.position>7||typeof s.finalPassed!=='boolean'||(s.finalPassed&&s.stamps.length<4))throw Error('存檔內容不正確。');
 return s;
}
export function decode(code){if(typeof code!=='string'||code.length>3000000||!code.startsWith(PREFIX))throw Error('這不是本網站的接關碼。');const [payload,check,...extra]=code.slice(PREFIX.length).split('.');if(extra.length||hash(payload)!==check)throw Error('接關碼不完整或已被改動，請重新複製。');try{return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(payload),c=>c.charCodeAt(0)))));}catch(e){throw Error('無法讀取接關碼：'+e.message);}}
