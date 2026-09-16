import {WIDTH,HEIGHT,NPC,houses,trees,fences,VillageGame} from './game-core.js';
import {BubbleGame,COLS,ROWS,CELL,isWall} from './bubble-core.js';
const $=s=>document.querySelector(s),canvas=$('#world'),ctx=canvas.getContext('2d'),game=new VillageGame();
const keys=new Set(),touchKeys=new Map(),town=new Image(),characters=new Image(),stage=$('#stage');
const miniCanvas=$('#bubble-game'),miniCtx=miniCanvas.getContext('2d'),bubbleGame=new BubbleGame();
let assetsReady=false,lastTime=0,previousView='',lastAction=0,cameraX=0,miniActive=false,miniView='',lastMiniMove=0;
const ground=document.createElement('canvas');ground.width=WIDTH;ground.height=HEIGHT;const g=ground.getContext('2d');
ctx.imageSmoothingEnabled=false;g.imageSmoothingEnabled=false;miniCtx.imageSmoothingEnabled=false;
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
function drawPixelStar(c,x,y){
 c.fillStyle='#ffe478';c.fillRect(x+13,y+5,6,22);c.fillRect(x+5,y+13,22,6);c.fillStyle='#fff6bd';c.fillRect(x+13,y+8,4,8);c.fillRect(x+8,y+13,8,4);
}
function renderMiniGame(){
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  const px=x*CELL,py=y*CELL;
  miniCtx.fillStyle=(x+y)%2?'#69bda3':'#73c7a9';miniCtx.fillRect(px,py,CELL,CELL);
  miniCtx.fillStyle='#7bd0b4';miniCtx.fillRect(px+3,py+3,2,2);miniCtx.fillRect(px+24,py+20,2,2);
  if(isWall(x,y)){
   miniCtx.fillStyle='#236472';miniCtx.fillRect(px,py,CELL,CELL);miniCtx.fillStyle='#397f88';miniCtx.fillRect(px+3,py+3,CELL-6,CELL-6);miniCtx.fillStyle='#4e98a0';miniCtx.fillRect(px+5,py+5,CELL-10,5);miniCtx.fillStyle='#1b5260';miniCtx.fillRect(px+5,py+22,CELL-10,5);
  }
 }
 for(const crateKey of bubbleGame.crates){
  const [x,y]=crateKey.split(',').map(Number),px=x*CELL,py=y*CELL;
  miniCtx.fillStyle='#754d32';miniCtx.fillRect(px+3,py+4,26,25);miniCtx.fillStyle='#b67a44';miniCtx.fillRect(px+6,py+7,20,19);miniCtx.fillStyle='#e2a85c';miniCtx.fillRect(px+8,py+9,16,4);miniCtx.fillStyle='#71432e';miniCtx.fillRect(px+7,py+21,18,4);miniCtx.fillRect(px+14,py+7,4,18);
 }
 for(const [dropKey] of bubbleGame.drops){const [x,y]=dropKey.split(',').map(Number);drawPixelStar(miniCtx,x*CELL,y*CELL);}
 for(const bomb of bubbleGame.bombs){
  const px=bomb.x*CELL,py=bomb.y*CELL,pulse=Math.floor((1.65-bomb.fuse)*8)%2;
  miniCtx.fillStyle=pulse?'#67daf0':'#4cb7d4';miniCtx.beginPath();miniCtx.arc(px+16,py+18,11,0,Math.PI*2);miniCtx.fill();miniCtx.fillStyle='#d9fbff';miniCtx.fillRect(px+10,py+11,5,4);miniCtx.fillStyle='#30546a';miniCtx.fillRect(px+15,py+4,4,5);miniCtx.fillStyle='#ffe16d';miniCtx.fillRect(px+19,py+2,4,4);
 }
 for(const blast of bubbleGame.blasts)for(const cell of blast.cells){
  const px=cell.x*CELL,py=cell.y*CELL,alpha=Math.min(1,blast.ttl*4);
  miniCtx.fillStyle=`rgba(196,247,255,${alpha})`;miniCtx.fillRect(px+3,py+10,26,12);miniCtx.fillRect(px+10,py+3,12,26);miniCtx.fillStyle=`rgba(91,210,241,${alpha})`;miniCtx.fillRect(px+7,py+14,18,4);miniCtx.fillRect(px+14,py+7,4,18);
 }
 if(!(bubbleGame.invulnerable>0&&Math.floor(bubbleGame.invulnerable*10)%2)){
  const px=bubbleGame.player.x*CELL,py=bubbleGame.player.y*CELL;
  miniCtx.fillStyle='#174e5060';miniCtx.fillRect(px+8,py+25,16,3);
  miniCtx.drawImage(characters,0,7*16,16,16,px+4,py+2,24,24);
 }
}
function updateMiniUI(){
 const signature=JSON.stringify([miniActive,bubbleGame.status,Math.ceil(bubbleGame.timeLeft),bubbleGame.lives,bubbleGame.collected,bubbleGame.bombs.length,bubbleGame.message]);
 if(signature===miniView)return;miniView=signature;
 $('#mini-layer').hidden=!miniActive;
 $('#mini-time').textContent=Math.ceil(bubbleGame.timeLeft);
 $('#mini-lives').textContent=bubbleGame.lives;
 $('#mini-score').textContent=`${bubbleGame.collected} / 3`;
 $('#mini-message').textContent=bubbleGame.message;
 $('#mini-intro').hidden=bubbleGame.status!=='idle';
 const finished=bubbleGame.status==='won'||bubbleGame.status==='lost';
 $('#mini-result').hidden=!finished;
 $('#mini-bomb').disabled=bubbleGame.status!=='playing'||bubbleGame.bombs.length>=1;
 if(finished){
  const won=bubbleGame.status==='won';
  $('#mini-result-kicker').textContent=won?'ROUND CLEAR':'TRY AGAIN';
  $('#mini-result-title').textContent=won?'빛방울 수집 완료!':'광장 놀이 종료';
  $('#mini-result-text').textContent=won?`${Math.ceil(bubbleGame.timeLeft)}초를 남기고 성공했어요.`:bubbleGame.message;
 }
}
function openMiniGame(){
 resetInput();if(game.dialogue)game.closeDialogue();game.paused=true;miniActive=true;miniView='';updateUI();updateMiniUI();renderMiniGame();$('#mini-start').focus();
}
function closeMiniGame(){
 miniActive=false;game.paused=false;resetInput();miniView='';updateMiniUI();updateUI();$('#minigame').focus();
}
function startMiniGame(){bubbleGame.start();miniView='';updateMiniUI();renderMiniGame();miniCanvas.focus?.();}
function miniMove(dx,dy){if(bubbleGame.move(dx,dy)){renderMiniGame();miniView='';updateMiniUI();}}
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
$('#minigame').addEventListener('click',openMiniGame);$('#mini-exit').addEventListener('click',closeMiniGame);$('#mini-home').addEventListener('click',closeMiniGame);
$('#mini-start').addEventListener('click',startMiniGame);$('#mini-retry').addEventListener('click',startMiniGame);$('#mini-bomb').addEventListener('click',()=>{bubbleGame.placeBomb();miniView='';updateMiniUI();renderMiniGame();});
document.querySelectorAll('[data-mini-direction]').forEach(button=>button.addEventListener('click',()=>{const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};miniMove(...vectors[button.dataset.miniDirection]);}));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('close',()=>{resetInput();game.paused=false;updateUI();}));
$('#back-to-title').addEventListener('click',()=>{$('#menu-dialog').close();game.toTitle();resetInput();updateUI();$('#start').focus();});
$('#retry').addEventListener('click',()=>location.reload());
const directionKeys={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right'};
document.addEventListener('keydown',e=>{
 if(miniActive){
  const vectors={ArrowUp:[0,-1],w:[0,-1],W:[0,-1],ArrowDown:[0,1],s:[0,1],S:[0,1],ArrowLeft:[-1,0],a:[-1,0],A:[-1,0],ArrowRight:[1,0],d:[1,0],D:[1,0]};
  if(vectors[e.key]){e.preventDefault();const now=performance.now();if(now-lastMiniMove>85){miniMove(...vectors[e.key]);lastMiniMove=now;}return;}
  if((e.code==='Space'||e.key===' ')&&!e.repeat){e.preventDefault();bubbleGame.placeBomb();miniView='';updateMiniUI();renderMiniGame();return;}
  if(e.key==='Escape'&&!e.repeat){e.preventDefault();closeMiniGame();return;}
  return;
 }
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
function loop(time){const dt=lastTime?(time-lastTime)/1000:0;lastTime=time;if(miniActive){bubbleGame.update(dt);renderMiniGame();updateMiniUI();}else game.step(Number(held('right'))-Number(held('left')),Number(held('down'))-Number(held('up')),dt);render();updateUI();updateMarkers();requestAnimationFrame(loop);}
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
 ,{name:'start_water_square',description:'물풍선으로 상자를 부수고 빛방울 세 개를 찾는 물방울 광장 미니게임을 시작합니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:()=>{openMiniGame();startMiniGame();return bubbleGame.snapshot();}}
 ,{name:'read_water_square',description:'물방울 광장의 남은 시간, 생명, 빛방울 수와 현재 위치를 읽습니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>bubbleGame.snapshot()}
 ,{name:'move_in_water_square',description:'물방울 광장에서 한 칸 이동합니다.',inputSchema:{type:'object',properties:{direction:{type:'string',enum:['up','down','left','right']}},required:['direction'],additionalProperties:false},execute:input=>{if(!miniActive||bubbleGame.status!=='playing')throw Error('물방울 광장 놀이를 먼저 시작해주세요.');const vector={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[input?.direction];if(!vector)throw Error('유효한 방향을 입력하세요.');bubbleGame.move(...vector);renderMiniGame();miniView='';updateMiniUI();return bubbleGame.snapshot();}}
 ,{name:'place_water_balloon',description:'플레이어가 서 있는 칸에 물풍선 하나를 놓습니다.',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:()=>{if(!miniActive||!bubbleGame.placeBomb())throw Error('지금은 물풍선을 놓을 수 없습니다.');miniView='';updateMiniUI();renderMiniGame();return bubbleGame.snapshot();}}
 ];
 for(const d of definitions){try{Promise.resolve(document.modelContext.registerTool({...d,annotations:{readOnlyHint:false,untrustedContentHint:false,...d.annotations}},{signal:lifecycle.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
