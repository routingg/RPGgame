import test from 'node:test';
import assert from 'node:assert/strict';
import {VillageGame,blocked,obstacles,NPC,SPAWN,SPEED} from '../dist/game-core.js';

const walk=(game,x,y,seconds)=>{for(let t=0;t<seconds;t+=.01)game.step(x,y,.01);};

test('start is idempotent and the initial spawn is walkable',()=>{
 const game=new VillageGame();assert.equal(blocked(SPAWN.x,SPAWN.y),false);
 game.step(1,0,.05);assert.equal(game.player.x,SPAWN.x);
 assert.equal(game.start(),true);assert.equal(game.start(),false);
 walk(game,1,0,.2);assert.ok(game.player.x>SPAWN.x);
});
test('diagonal and cardinal movement cover equal distances',()=>{
 const a=new VillageGame(),b=new VillageGame();a.start();b.start();
 a.step(1,0,.05);b.step(1,-1,.05);
 const distance=g=>Math.hypot(g.player.x-SPAWN.x,g.player.y-SPAWN.y);
 assert.ok(Math.abs(distance(a)-distance(b))<1e-9);
 assert.ok(Math.abs(distance(a)-SPEED*.05)<1e-9);
});
test('all house, tree, fence and prop footprints block entry',()=>{
 for(const o of obstacles)assert.equal(blocked(o.x+o.w/2,o.y+o.h/2),true);
 for(const [x,y] of [[0,100],[512,100],[200,0],[200,320]])assert.equal(blocked(x,y),true);
});
test('movement cannot tunnel through a house even after a long frame',()=>{
 const game=new VillageGame();game.start();game.player={x:120,y:119,facing:1};
 walk(game,0,-1,3);assert.ok(game.player.y>=117);assert.equal(blocked(game.player.x,game.player.y),false);
 const before=game.player.y;game.step(0,-1,100);assert.equal(game.player.y,before);
});
test('guide is reachable and cannot be walked through',()=>{
 const game=new VillageGame();game.start();assert.equal(game.interact(),false);
 walk(game,0,-1,2);assert.equal(game.canTalk(),true);
 assert.ok(game.player.y>=NPC.y+13);assert.equal(blocked(game.player.x,game.player.y),false);
});
test('dialogue freezes movement, completes once, and supports repeat talk',()=>{
 const game=new VillageGame();game.start();walk(game,0,-1,1);
 assert.equal(game.interact(),true);const before={...game.player};
 walk(game,1,0,1);assert.deepEqual(game.player,before);
 assert.equal(game.interact(),false);game.nextDialogue();game.nextDialogue();
 assert.equal(game.greeted,false);game.nextDialogue();assert.equal(game.greeted,true);
 assert.equal(game.dialogue,null);assert.equal(game.nextDialogue(),false);
 assert.equal(game.interact(),true);assert.equal(game.dialogue.lines.length,1);
 game.nextDialogue();assert.equal(game.greeted,true);
});
test('cancelled dialogue does not complete the greeting; pause locks movement',()=>{
 const game=new VillageGame();game.start();walk(game,0,-1,1);game.interact();game.closeDialogue();
 assert.equal(game.greeted,false);assert.equal(game.canTalk(),true);game.paused=true;
 const before={...game.player};walk(game,1,0,1);assert.deepEqual(game.player,before);assert.equal(game.interact(),false);
 game.paused=false;walk(game,1,0,.2);assert.notEqual(game.player.x,before.x);
});
test('returning to title preserves page-session progress and prevents movement',()=>{
 const game=new VillageGame();game.start();walk(game,0,-1,1);game.interact();
 game.nextDialogue();game.nextDialogue();game.nextDialogue();game.toTitle();
 const before={...game.player};walk(game,1,0,1);assert.deepEqual(game.player,before);
 game.start();assert.equal(game.greeted,true);assert.deepEqual(game.player,before);
});
