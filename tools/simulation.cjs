const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
module.exports=function boot(){
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const exposed=`globalThis.game={loadLevel,update,setPlayerHeld,clearHeld,render,setAir,fanOn,hogHalf,hogScale,device,reset,memoTotalAir,getRoomGuide,get levels(){return LEVELS},get base(){return BASE_LEVELS},get level(){return L},get idx(){return idx},get hog(){return hog},get dog(){return dog},get memo(){return memo},get win(){return win},get hurt(){return hurt},get stats(){return stats},get just(){return just},get ropeShort(){return ropeShort},get ropeLen(){return ropeLen},get walls(){return walls},get checkpoint(){return checkpoint}};loadLevel(16);`;
 const source=html.split('<script>')[1].split('</script>')[0].replace('loadLevel(16);requestAnimationFrame(frame);',exposed);
 const elements=new Map(),canvas=new Proxy({measureText:s=>({width:String(s).length*10})},{get:(o,k)=>o[k]||(()=>{})});
 const element=id=>{if(!elements.has(id))elements.set(id,{children:[],dataset:{},style:{},classList:{add(){},remove(){}},getContext:()=>canvas,addEventListener(){},setAttribute(){},appendChild(b){this.children.push(b)},focus(){}});return elements.get(id);};
 const context={document:{getElementById:element,querySelectorAll:()=>[],createElement:()=>element(Math.random()),addEventListener(){}},window:{},performance:{now:()=>0},requestAnimationFrame(){},addEventListener(){},setTimeout(){},console,Math};
 vm.createContext(context);vm.runInContext(source,context);return context.game;
};
