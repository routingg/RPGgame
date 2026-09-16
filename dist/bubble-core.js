export const COLS = 13;
export const ROWS = 9;
export const CELL = 32;
export const ROUND_TIME = 60;

const crateLayout = [
  [5,1],[7,1],[9,1],[11,1],
  [1,3],[3,3],[5,3],[7,3],[9,3],[11,3],
  [3,5],[5,5],[7,5],[9,5],[11,5],
  [1,7],[3,7],[5,7],[7,7],[9,7],[11,7],
  [4,1],[7,2],[10,3],[1,4],[4,5],[7,6],[10,7],
];

const hiddenDrops = new Map([
  ['3,3','drop'],
  ['7,3','drop'],
  ['9,5','drop'],
]);

const key = (x,y) => `${x},${y}`;

export function isWall(x,y) {
  return x < 0 || y < 0 || x >= COLS || y >= ROWS || x === 0 || y === 0 || x === COLS-1 || y === ROWS-1 || (x % 2 === 0 && y % 2 === 0);
}

export class BubbleGame {
  constructor() { this.reset(); }

  reset() {
    this.status = 'idle';
    this.timeLeft = ROUND_TIME;
    this.lives = 2;
    this.collected = 0;
    this.player = {x:1,y:1};
    this.crates = new Set(crateLayout.map(([x,y]) => key(x,y)));
    this.drops = new Map();
    this.bombs = [];
    this.blasts = [];
    this.invulnerable = 0;
    this.message = '물풍선을 놓아 상자 속 빛방울을 찾아보세요.';
  }

  start() {
    this.reset();
    this.status = 'playing';
    return this.snapshot();
  }

  canEnter(x,y) {
    if (isWall(x,y) || this.crates.has(key(x,y))) return false;
    return !this.bombs.some(bomb => bomb.x === x && bomb.y === y && !(this.player.x === x && this.player.y === y && bomb.escape));
  }

  move(dx,dy) {
    if (this.status !== 'playing') return false;
    if (!Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx)+Math.abs(dy) !== 1) return false;
    const x = this.player.x + dx, y = this.player.y + dy;
    if (!this.canEnter(x,y)) return false;
    for (const bomb of this.bombs) if (bomb.escape && (bomb.x !== x || bomb.y !== y)) bomb.escape = false;
    this.player = {x,y};
    this.collectDrop();
    return true;
  }

  placeBomb() {
    if (this.status !== 'playing' || this.bombs.length >= 1) return false;
    if (this.bombs.some(bomb => bomb.x === this.player.x && bomb.y === this.player.y)) return false;
    this.bombs.push({x:this.player.x,y:this.player.y,fuse:1.65,escape:true});
    this.message = '물풍선이 곧 터져요! 두 칸 이상 떨어지세요.';
    return true;
  }

  collectDrop() {
    const cell = key(this.player.x,this.player.y);
    if (this.drops.get(cell) !== 'drop') return false;
    this.drops.delete(cell);
    this.collected += 1;
    this.message = `빛방울을 찾았어요! ${this.collected} / 3`;
    if (this.collected >= 3) {
      this.status = 'won';
      this.message = '빛방울을 모두 찾았어요!';
    }
    return true;
  }

  blastCells(bomb) {
    const cells = [{x:bomb.x,y:bomb.y}];
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      for (let distance=1; distance<=2; distance++) {
        const x=bomb.x+dx*distance, y=bomb.y+dy*distance;
        if (isWall(x,y)) break;
        cells.push({x,y});
        if (this.crates.has(key(x,y))) break;
      }
    }
    return cells;
  }

  explode(bomb) {
    const cells = this.blastCells(bomb);
    this.blasts.push({cells,ttl:.52});
    for (const cell of cells) {
      const cellKey = key(cell.x,cell.y);
      if (this.crates.delete(cellKey) && hiddenDrops.has(cellKey)) this.drops.set(cellKey,hiddenDrops.get(cellKey));
      const chained = this.bombs.find(other => other !== bomb && other.x === cell.x && other.y === cell.y);
      if (chained) chained.fuse = 0;
    }
    this.message = '촤아— 물길이 지나갔어요.';
    this.hitPlayer(cells);
  }

  hitPlayer(cells) {
    if (this.invulnerable > 0 || !cells.some(cell => cell.x === this.player.x && cell.y === this.player.y)) return;
    this.lives -= 1;
    this.invulnerable = 1.2;
    if (this.lives <= 0) {
      this.status = 'lost';
      this.message = '물에 두 번 맞았어요. 다시 도전해보세요.';
    } else {
      this.player = {x:1,y:1};
      this.message = '물에 맞았어요! 시작 지점에서 다시 출발해요.';
    }
  }

  update(dt) {
    if (this.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
    const elapsed = Math.min(dt,.1);
    this.timeLeft = Math.max(0,this.timeLeft-elapsed);
    this.invulnerable = Math.max(0,this.invulnerable-elapsed);
    for (const blast of this.blasts) blast.ttl -= elapsed;
    this.blasts = this.blasts.filter(blast => blast.ttl > 0);
    for (const bomb of this.bombs) bomb.fuse -= elapsed;
    const exploding = this.bombs.filter(bomb => bomb.fuse <= 0);
    for (const bomb of exploding) this.explode(bomb);
    this.bombs = this.bombs.filter(bomb => bomb.fuse > 0);
    for (const blast of this.blasts) this.hitPlayer(blast.cells);
    this.collectDrop();
    if (this.timeLeft <= 0 && this.status === 'playing') {
      this.status = 'lost';
      this.message = '시간이 끝났어요. 위치를 기억해 다시 도전해보세요.';
    }
  }

  snapshot() {
    return {
      status:this.status,
      timeLeft:Math.ceil(this.timeLeft),
      lives:this.lives,
      collected:this.collected,
      player:{...this.player},
      bombs:this.bombs.length,
      crates:this.crates.size,
      message:this.message,
    };
  }
}
