import {WIDTH,HEIGHT,NPC,houses,trees,fences,VillageGame} from './game-core.js';
const $=s=>document.querySelector(s),canvas=$('#world'),ctx=canvas.getContext('2d'),game=new VillageGame();
const keys=new Set(),touchKeys=new Map(),town=new Image(),characters=new Image(),stage=$('#stage');
let assetsReady=false,lastTime=0,previousView='',lastAction=0,cameraX=0;
const ground=document.createElement('canvas');ground.width=WIDTH;ground.height=HEIGHT;const g=ground.getContext('2d');
ctx.imageSmoothingEnabled=false;g.imageSmoothingEnabled=false;
function tile(c,image,col,row,x,y,w=16,h=16){c.drawImage(image,col*16,row*16,16,16,Math.round(x),Math.round(y),w,h);}
function randomAt(x,y){let n=((x+17)*374761393+(y+31)*668265263)|0;n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967295;}
function pathAt(x,y){return(y>=9&&y<=11&&x>=3&&x<=28)||(x>=15&&x<=17&&y>=5&&y<=18)||(x>=12&&x<=20&&y>=8&&y<=13)||(x>=6&&x<=8&&y>=7&&y<=16)||(x>=24&&x<=26&&y>=7&&y<=16);}
function drawGround(){
 for(let y=0;y<20;y++)for(let x=0;x<32;x++){
  const r=randomAt(x,y);tile(g,town,r>.87?1:0,0,x*16,y*16);if(!pathAt(x,y)&&r>.974)tile(g,town,2,0,x*16,y*16);
  if(pathAt(x,y)){const l=pathAt(x-1,y),r=pathAt(x+1,y),u=pathAt(x,y-1),d=pathAt(x,y+1);tile(g,town,!l?0:!r?2:1,!u?1:!d?3:2,x*16,y*16);}
 }
 for(const [x,y] of [[5,8],[9,8],[23,8],[27,8],[11,13],[21,13],[4,15],[9,15],[23,15],[28,15],[12,7],[20,7]])tile(g,town,2,0,x*16,y*16);
 for(const [x,y] of [[15,6],[16,6],[17,6],[15,7],[16,7],[17,7]])tile(g,town,7,3,x*16,y*16);
}
function drawHouse(h){
 const base=h.color==='red'?4:0,wall=h.color==='red'?0:4;
 for(let x=0;x<h.width;x++){const edge=x===0?0:x===h.width-1?2:1;
  tile(ctx,town,base+edge,4,(h.x+x)*16,h.y*16);tile(ctx,town,base+edge,5,(h.x+x)*16,(h.y+1)*16);
  tile(ctx,town,wall+(x===0?0:x===h.width-1?3:1),6,(h.x+x)*16,(h.y+2)*16);tile(ctx,town,wall+(x===0?0:x===h.width-1?3:1),6,(h.x+x)*16,(h.y+3)*16);
 }
 tile(ctx,town,h.color==='red'?7:3,4,(h.x+2)*16,h.y*16);tile(ctx,town,h.color==='red'?7:3,5,(h.x+2)*16,(h.y+1)*16);
 tile(ctx,town,wall,7,(h.x+1)*16,(h.y+2)*16);tile(ctx,town,wall,7,(h.x+3)*16,(h.y+2)*16);
 tile(ctx,town,wall+2,6,(h.x+2)*16,(h.y+2)*16);tile(ctx,town,wall+2,7,(h.x+2)*16,(h.y+3)*16);
}
function drawTree(x,y){for(const [dx,dy] of [[1,0],[0,1],[2,1]]){tile(ctx,town,4,0,(x+dx)*16,(y+dy)*16);tile(ctx,town,4,1,(x+dx)*16,(y+dy+1)*16);}}
function drawFence(f){for(let i=0;i<f.length;i++)tile(ctx,town,i===0?8:i===f.length-1?10:9,6,(f.x+i)*16,f.y*16);}
function drawCharacter(x,y,col,row,walking=false,facing=1){
 ctx.fillStyle='#38563a38';ctx.fillRect(Math.round(x-6),Math.round(y-1),12,3);
 const bounce=walking?Math.floor(Math.sin(game.walkTime*18)*.8):0,leg=walking?(Math.sin(game.walkTime*18)>0?1:-1):0;
 ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(facing,1);
 ctx.drawImage(characters,col*16,row*16,16,14,-8,-15+bounce,16,14);
 ctx.drawImage(characters,col*16,row*16+14,8,2,-8,-1+leg,8,2);ctx.drawImage(characters,col*16+8,row*16+14,8,2,0,-1-leg,8,2);ctx.restore();
}
function render(){
 ctx.drawImage(ground,0,0);const layers=[];
 houses.forEach(h=>layers.push({y:(h.y+4)*16,draw:()=>drawHouse(h)}));
 trees.forEach(([x,y])=>layers.push({y:(y+2.7)*16,draw:()=>drawTree(x,y)}));
 fences.forEach(f=>layers.push({y:f.y*16+12,draw:()=>drawFence(f)}));
 layers.push({y:269,draw:()=>{tile(ctx,town,11,10,108,246,24,24);tile(ctx,town,8,8,380,242,24,24);}});
 layers.push({y:NPC.y,draw:()=>drawCharacter(NPC.x,NPC.y,3,7)});
 layers.push({y:game.player.y,draw:()=>drawCharacter(game.player.x,game.player.y,0,7,game.moving,game.player.facing)});
 layers.sort((a,b)=>a.y-b.y).forEach(layer=>layer.draw());
 if(game.canTalk()){ctx.strokeStyle='#fff4b3';ctx.lineWidth=1;ctx.strokeRect(Math.round(NPC.x-10),Math.round(NPC.y-17),20,20);}
}
function updateMarkers(){
 const box=stage.getBoundingClientRect(),mobile=window.innerWidth<=600,scale=box.height/HEIGHT;
 cameraX=mobile?Math.max(0,Math.min(WIDTH-box.width/scale,game.player.x-box.width/scale/2)):0;
 canvas.style.left=mobile?(-cameraX*scale)+'px':'0px';
 const place=(el,x,y)=>{el.style.left=((x-cameraX)*scale)+'px';el.style.top=(y*scale)+'px';};
 place($('#npc-marker'),NPC.x,NPC.y-18);place($('#player-marker'),game.player.x,game.player.y-18);
}
function updateUI(){
 const signature=JSON.stringify([game.screen,game.paused,game.greeted,game.canTalk(),game.dialogue?.index,!!game.dialogue]);
 if(signature===previousView)return;previousView=signature;const active=game.screen==='playing';
 $('#title-layer').hidden=active;$('#npc-marker').hidden=!active||!!game.dialogue;$('#player-marker').hidden=!active||!!game.dialogue;
 $('#objective').hidden=!active;$('#touch-controls').hidden=!active;$('#objective').classList.toggle('done',game.greeted);
 $('#objective-check').textContent=game.greeted?'✓':'◇';$('#objective-text').textContent=game.greeted?'첫 인사 완료! 자유롭게 마을을 둘러보세요.':'마을 중앙의 루미에게 말을 걸어보세요.';
 $('.quest-bubble').textContent=game.greeted?'…':'!';$('#interact').disabled=!game.canTalk();$('#dialogue').hidden=!game.dialogue;
 let hint='모험을 시작할 준비가 되었나요?';
 if(active)hint=game.dialogue?'대화 중에는 이동이 잠시 멈춰요.':game.canTalk()?'루미가 반갑게 손을 흔들어요. 말을 걸어볼까요?':game.greeted?'첫 친구를 만났어요. 이제 마을을 자유롭게 걸어보세요.':'흙길을 따라 중앙의 루미에게 다가가 보세요.';
 $('#hint-text').textContent=hint;
 if(game.dialogue){$('#dialogue-text').textContent=game.dialogue.lines[game.dialogue.index];$('#dialogue-count').textContent=(game.dialogue.index+1)+' / '+game.dialogue.lines.length;
 $('#next-dialogue').innerHTML=game.dialogue.index===game.dialogue.lines.length-1?'인사 마치기 <kbd>Enter</kbd><span aria-hidden="true">✓</span>':'다음 <kbd>Enter</kbd><span aria-hidden="true">▸</span>';}
}
function resetInput(){keys.clear();touchKeys.clear();game.moving=false;}
function start(){if(!assetsReady)return;game.start();resetInput();updateUI();updateMarkers();$('#start').blur();}
function interact(){if(performance.now()-lastAction<180)return;lastAction=performance.now();if(game.dialogue){game.nextDialogue();if(!game.dialogue)$('#next-dialogue').blur();}else game.interact();resetInput();updateUI();}
function openDialog(id){resetInput();game.paused=true;$(id).showModal();updateUI();}
$('#start').addEventListener('click',start);$('#interact').addEventListener('click',interact);$('#next-dialogue').addEventListener('click',interact);
$('#help').addEventListener('click',()=>openDialog('#help-dialog'));$('#menu').addEventListener('click',()=>openDialog(game.screen==='title'?'#help-dialog':'#menu-dialog'));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{resetInput();game.paused=false;updateUI();}));
$('#back-to-title').addEventListener('click',()=>{$('#menu-dialog').close();game.toTitle();resetInput();updateUI();$('#start').focus();});
$('#retry').addEventListener('click',()=>location.reload());
const directionKeys={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
document.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]'))return;
 if(directionKeys[e.key]&&game.screen==='playing'){e.preventDefault();keys.add(e.code);return;}
 if(e.repeat)return;
 if(e.key==='Escape'&&game.screen==='playing'){e.preventDefault();if(game.dialogue){game.closeDialogue();resetInput();updateUI();}else openDialog('#menu-dialog');}
 if((e.key.toLowerCase()==='e'||e.key==='Enter')&&game.screen==='playing'){
  if(e.key==='Enter'&&document.activeElement?.tagName==='BUTTON')return;
  e.preventDefault();interact();
 }
});
document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{resetInput();lastTime=0;});
document.querySelectorAll('[data-direction]').forEach(b=>{
 b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touchKeys.set(e.pointerId,b.dataset.direction);});
 const release=e=>touchKeys.delete(e.pointerId);b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
});
function held(direction){const codes={up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight']};return codes[direction].some(k=>keys.has(k))||[...touchKeys.values()].includes(direction);}
function loop(time){const dt=lastTime?(time-lastTime)/1000:0;lastTime=time;game.step(Number(held('right'))-Number(held('left')),Number(held('down'))-Number(held('up')),dt);render();updateUI();updateMarkers();requestAnimationFrame(loop);}
function load(image,url){return new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});}
Promise.all([load(town,'assets/town.png'),load(characters,'assets/characters.png')]).then(()=>{assetsReady=true;drawGround();$('#start').disabled=false;$('#start-label').textContent='모험 시작하기';updateUI();requestAnimationFrame(loop);}).catch(()=>{$('#asset-error').hidden=false;});
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 const definitions=[
 {name:'read_village_state',description:'마을 위치, 대화와 첫 인사 진행 상태를 읽습니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>game.snapshot()},
 {name:'start_village',description:'첫 마을 탐험을 시작합니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:()=>{if(!assetsReady)throw Error('마을 준비 중입니다.');start();return game.snapshot();}},
 {name:'move_in_village',description:'장애물과 대화 중 이동 제한을 지키며 지정 방향으로 이동합니다.',inputSchema:{type:'object',properties:{direction:{type:'string',enum:['up','down','left','right']},seconds:{type:'number',minimum:.05,maximum:3}},required:['direction','seconds'],additionalProperties:false},execute:input=>{
 if(!['up','down','left','right'].includes(input?.direction)||!Number.isFinite(input?.seconds)||input.seconds<.05||input.seconds>3)throw Error('유효한 방향과 0.05~3초를 입력하세요.');
 if(game.screen!=='playing'||game.paused||game.dialogue)throw Error('지금은 이동할 수 없습니다.');
 const vector={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[input.direction];let remaining=input.seconds;while(remaining>0){const dt=Math.min(.016,remaining);game.step(...vector,dt);remaining-=dt;}
 game.moving=false;render();updateUI();updateMarkers();return game.snapshot();}},
 {name:'talk_to_village_guide',description:'안내인 가까이에서 대화를 시작하거나 한 문장 진행합니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:()=>{if(game.paused)throw Error('메뉴를 먼저 닫아주세요.');if(game.dialogue)game.nextDialogue();else if(!game.interact())throw Error('루미 가까이에서 말을 걸어주세요.');resetInput();updateUI();return game.snapshot();}}
 ];
 for(const d of definitions){try{Promise.resolve(document.modelContext.registerTool({...d,annotations:{readOnlyHint:false,untrustedContentHint:false,...d.annotations}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
