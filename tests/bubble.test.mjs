import test from 'node:test';
import assert from 'node:assert/strict';
import {BubbleGame,isWall,ROUND_TIME} from '../dist/bubble-core.js';

const advance=(game,seconds)=>{for(let elapsed=0;elapsed<seconds;elapsed+=.05)game.update(.05);};

test('arena walls and fixed pillars cannot be entered',()=>{
 const game=new BubbleGame();game.start();
 assert.equal(isWall(0,1),true);assert.equal(isWall(2,2),true);assert.equal(isWall(1,1),false);
 assert.equal(game.move(-1,0),false);assert.deepEqual(game.player,{x:1,y:1});
});

test('one balloon opens a crate and reveals the first light drop',()=>{
 const game=new BubbleGame();game.start();assert.equal(game.placeBomb(),true);assert.equal(game.placeBomb(),false);
 assert.equal(game.move(1,0),true);assert.equal(game.move(1,0),true);assert.equal(game.move(0,1),true);advance(game,1.8);
 assert.equal(game.lives,2);assert.equal(game.placeBomb(),true);assert.equal(game.move(0,-1),true);assert.equal(game.move(-1,0),true);advance(game,1.8);
 assert.equal(game.crates.has('3,3'),false);assert.equal(game.drops.get('3,3'),'drop');assert.equal(game.bombs.length,0);
});

test('water blast costs one life and respawns the player',()=>{
 const game=new BubbleGame();game.start();game.placeBomb();advance(game,1.8);
 assert.equal(game.lives,1);assert.deepEqual(game.player,{x:1,y:1});assert.equal(game.status,'playing');
 advance(game,1.3);game.placeBomb();advance(game,1.8);assert.equal(game.lives,0);assert.equal(game.status,'lost');
});

test('collecting all three revealed drops wins the round',()=>{
 const game=new BubbleGame();game.start();
 for(const cell of [[1,1],[2,1],[3,1]]){game.player={x:cell[0],y:cell[1]};game.drops.set(`${cell[0]},${cell[1]}`,'drop');game.collectDrop();}
 assert.equal(game.collected,3);assert.equal(game.status,'won');
});

test('a real movement and balloon route can finish the full round',()=>{
 const game=new BubbleGame();game.start();
 const move=(...steps)=>{for(const [dx,dy] of steps)assert.equal(game.move(dx,dy),true);};
 const bomb=()=>assert.equal(game.placeBomb(),true);
 const R=[1,0],L=[-1,0],U=[0,-1],D=[0,1];

 bomb();move(R,R,D);advance(game,2.3);
 bomb();move(U,L);advance(game,2.3);move(R,D,D);assert.equal(game.collected,1);

 move(R);bomb();move(L,U);advance(game,2.3);move(D,R,R,R);
 bomb();move(L,U);advance(game,2.3);move(D,R,R);assert.equal(game.collected,2);

 move(D);bomb();move(U,L);advance(game,2.3);move(R,D,D,R);
 bomb();move(L,U);advance(game,2.3);move(D,R,R);

 assert.equal(game.collected,3);assert.equal(game.status,'won');
});

test('round ends when the timer reaches zero',()=>{
 const game=new BubbleGame();game.start();advance(game,ROUND_TIME+.2);
 assert.equal(game.timeLeft,0);assert.equal(game.status,'lost');
});

test('idle and finished rounds reject play actions',()=>{
 const game=new BubbleGame();assert.equal(game.move(1,0),false);assert.equal(game.placeBomb(),false);
 game.start();game.status='won';assert.equal(game.move(1,0),false);assert.equal(game.placeBomb(),false);
});
