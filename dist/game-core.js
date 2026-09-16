export const TILE=16, WIDTH=512, HEIGHT=320, SPEED=64, TALK_DISTANCE=31;
export const NPC={x:264,y:163,radius:8}, SPAWN={x:264,y:249};
export const houses=[{x:5,y:3,width:5,color:'red'},{x:14,y:1,width:5,color:'blue'},{x:23,y:3,width:5,color:'red'}];
export const trees=[[0,-1],[3,-2],[8,-2],[11,-2],[20,-2],[26,-2],[29,-1],[-1,4],[29,4],[-1,8],[30,8],[1,12],[28,12],[-1,16],[4,17],[8,17],[12,18],[19,18],[23,17],[28,17],[11,4],[20,4]];
export const fences=[{x:4,y:13,length:5},{x:23,y:13,length:5}];
export const obstacles=[...houses.map(h=>({x:h.x*TILE,y:(h.y+1)*TILE,w:h.width*TILE,h:3*TILE})),...trees.map(([x,y])=>({x:x*TILE+8,y:y*TILE+19,w:32,h:25})),...fences.map(f=>({x:f.x*TILE,y:f.y*TILE+5,w:f.length*TILE,h:7})),{x:106,y:247,w:26,h:23},{x:377,y:246,w:30,h:24}];
export const firstDialogue=['안녕! 봄들 마을에 온 걸 환영해.\n나는 이 마을의 안내인, 루미야.','여기는 천천히 둘러보기 좋은 곳이야.\n흙길을 따라 집과 정원 사이를 걸어봐!','첫 인사 완료! 이제 자유롭게 마을을 둘러봐.\n다음 만남에는 숲으로 가는 길도 함께 찾아보자.'];
export const repeatDialogue=['또 만났네, 여행자!\n아직은 작은 마을이지만, 천천히 함께 넓혀가 보자.'];
export function blocked(x,y,radius=5){
 if(x-radius<16||x+radius>WIDTH-16||y-radius<24||y+radius>HEIGHT-16)return true;
 if(Math.hypot(x-NPC.x,y-NPC.y)<radius+NPC.radius)return true;
 return obstacles.some(o=>x+radius>o.x&&x-radius<o.x+o.w&&y+radius>o.y&&y-radius<o.y+o.h);
}
export class VillageGame{
 constructor(){this.screen='title';this.player={...SPAWN,facing:1};this.paused=false;this.moving=false;this.walkTime=0;this.greeted=false;this.dialogue=null;}
 start(){if(this.screen==='playing')return false;this.screen='playing';this.paused=false;this.dialogue=null;this.moving=false;return true;}
 toTitle(){this.screen='title';this.dialogue=null;this.paused=false;this.moving=false;}
 canTalk(){return this.screen==='playing'&&!this.paused&&!this.dialogue&&Math.hypot(this.player.x-NPC.x,this.player.y-NPC.y)<=TALK_DISTANCE;}
 step(horizontal,vertical,dt){
  this.moving=false;if(this.screen!=='playing'||this.paused||this.dialogue||!Number.isFinite(dt)||dt<=0)return;
  const magnitude=Math.hypot(horizontal,vertical);if(!magnitude)return;
  const distance=SPEED*Math.min(dt,.05),dx=horizontal/magnitude*distance,dy=vertical/magnitude*distance,oldX=this.player.x,oldY=this.player.y;
  if(!blocked(oldX+dx,oldY))this.player.x+=dx;
  if(!blocked(this.player.x,oldY+dy))this.player.y+=dy;
  this.moving=this.player.x!==oldX||this.player.y!==oldY;if(horizontal)this.player.facing=horizontal<0?-1:1;if(this.moving)this.walkTime+=dt;
 }
 interact(){if(!this.canTalk())return false;this.dialogue={index:0,lines:this.greeted?repeatDialogue:firstDialogue};this.moving=false;return true;}
 nextDialogue(){if(!this.dialogue)return false;if(this.dialogue.index<this.dialogue.lines.length-1)this.dialogue.index++;else{this.greeted=true;this.dialogue=null;}return true;}
 closeDialogue(){this.dialogue=null;}
 snapshot(){return{screen:this.screen,player:{...this.player},paused:this.paused,greeted:this.greeted,canTalk:this.canTalk(),dialogue:this.dialogue?{index:this.dialogue.index,total:this.dialogue.lines.length}:null};}
}
