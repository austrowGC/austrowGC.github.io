class LinkNode {
  constructor(data, next = null) {
    this.data = data;
    this.next = next;
  }
}
class LinkList {
  constructor(){
    this.head = null;
  }

  clear() {
    this.head = null;
  }
  dropHead() {
    let value = this.head.data;
    if (value) {
      this.head = this.head.next;
    }
    return value;
  }
  prepend(data) {
    this.head = new LinkNode(data, this.head);
  }
  append(data) {
    let cursor;
    if (this.head == null) {
      this.prepend(data);
    } else {
      cursor = this.head;
      while (cursor.next !== null) cursor = cursor.next;
      cursor.next = new LinkNode(data, null, cursor);
    }
  }
  locate(data) {
    let cursor = this.head;
    while (cursor) {
      if (cursor.data === data) break;
      else cursor = cursor.next;

    }
    return cursor;
  }
  search(data) {
    let node = this.locate(data);
    let value = node ? node.data : null;
    return value;
  }
  remove(data) {
    let cursor = this.head, prev = null;
    if (cursor.data === data) return this.dropHead();
    else prev = cursor, cursor = cursor.next;
    while (cursor) {
      if (cursor.data === data) return prev.next = cursor.next;
      prev = cursor;
      cursor = cursor.next;
    }
  }
  map(func) {
    let cursor = this.head;
    while (cursor) {
      cursor.data[func]();
      cursor = cursor.next;
    }
  }
}
class V2d {
  constructor(x=0, y=0) { this.x = x, this.y = y }

  sum=v=>(
    v = isNaN(v) ? v : new V2d(v, v),
    new V2d(this.x + v.x, this.y + v.y)
  );
  product=v=>(
    v = isNaN(v) ? v : new V2d(v, v),
    new V2d(this.x * v.x, this.y * v.y)
  );
  dist=v=>(
    v = isNaN(v) ? v : new V2d(v, v),
    Math.sqrt((this.x - v.x)**2 + (this.y - v.y)**2)
  );
}
class Player {
  constructor(map = this.direction, team = 'red', spawnP = new V2d(0,0)) {
    this.team =()=> team;
    this.direction.down = map.down;
    this.direction.left = map.left;
    this.direction.right = map.right;
    this.direction.up = map.up;
    this.Position = spawnP;
  }

  direction = {
    up: {},
    down: {},
    left: {},
    right: {}
  };
  action =(event, ship, func = null)=>{
    func = this.parse(event);
    if (func) return ship[func]();
  }
  parse(event) {
    switch (event.code) {
      case this.direction.up.code: return 'up';
      case this.direction.left.code: return 'left';
      case this.direction.down.code: return 'down';
      case this.direction.right.code: return 'right';
      default: return false;
    }
  }
}
class Entity {
  constructor(owner = {}, w = 1, h = 1, vecP = new V2d(), vecV = new V2d()) {
    this.owner = owner;
    this.width = w;
    this.height = h
    this.Position = vecP;  // top left
    this.Velocity = vecV;
    this.shots = new LinkList();
  }

  team =()=>this.owner.team();
  center =()=> new V2d(this.Position.x+this.width/2, this.Position.y+this.height/2);
  shotSpeed =()=> 12;

  travel() {
    return this.Position = this.Position.sum(this.Velocity);
  }
  accelerate(x, y) {
    return this.Velocity = this.Velocity.sum(new V2d(x,y));
  }
  collides(Entity) {
    return this.center().dist(Entity.center()) < this.width/2 + Entity.width/2;
  }
  nOOB(Entity) { return this.Position.y < Entity.Position.y; }
  sOOB(Entity) { return this.Position.y + this.height > Entity.Position.y + Entity.height; }
  eOOB(Entity) { return this.Position.x + this.width > Entity.Position.x + Entity.width; }
  wOOB(Entity) { return this.Position.x < Entity.Position.x; }
  reverseX() {
    this.Velocity.x *= -1;
    return this;
  }
  reverseY() {
    this.Velocity.y *= -1;
    return this;
  }
  up() {
    /* new projectile with -y */
    this.shoot(new V2d(0, -this.shotSpeed()));
  }
  left() {
    /* new projectile with -x */
    this.shoot(new V2d(-this.shotSpeed(), 0));

  }
  down() {
    /* new projectile with +y */
    this.shoot(new V2d(0, this.shotSpeed()));

  }
  right() {
    /* new projectile with +x */
    this.shoot(new V2d(this.shotSpeed(), 0));

  }
  shoot(velocity = new V2d()) {
    this.shots.append(new Entity(this, shotSide, shotSide, this.center(), velocity));
    this.Velocity = this.Velocity.sum(velocity.product(-3/this.shotSpeed()));
  }

}
class Space {
  constructor(document, h, w) {
    this.height = h;
    this.width = w;
    this.players = new LinkList();
    this.ships = new LinkList();
    this.hits = new LinkList();
    this.collisions = new LinkList();
    this.cxt = this.initContext(document);

  }

  Position = new V2d(0,0);
  
  initContext =document=>{
    let canvas = document.createElement`canvas`;
    canvas.width = this.width;
    canvas.height = this.height;
    document.querySelector`body`.appendChild(canvas);
    return canvas.getContext`2d`;
  };
  initGame =()=>{
    for (let player = this.players.head; player; player = player.next) {
      this.ships.append(new Entity(player.data, shipSide, shipSide, player.data.Position))
    }
  };
  input =event=>{
    let player = this.players.head;
    let ship = this.ships.head;
    while (player) {
      player.data.action(event, ship.data);
      player = player.next;
      ship = ship.next;
    }
  };
  inputSetup =()=>{ return (window.addEventListener('keydown', e=>{ console.log(this) }), window)};
  update=()=>{
    this.resolveHits();
    this.clear();
    // process ship data
    for (let ship = this.ships.head; ship; ship = ship.next) {
      // process shot data
      for (let shot = ship.data.shots.head; shot; shot = shot.next) {
        shot.data.travel();
        this.render(shot.data);
        if (this.shotOOB(shot.data)) ship.data.shots.remove(shot.data);
      }
      ship.data.travel();
      ship.data = this.damp(ship.data);
      this.courseCorrect(ship.data);
      this.findOverlaps(ship.data);
      this.render(ship.data);
    }
    window.requestAnimationFrame(this.update);  // global window
  };

  clear() {
    this.cxt.clearRect(0, 0, this.width, this.height)
  }
  render(Entity) {
    this.cxt.fillStyle = Entity.team();
    this.cxt.fillRect(Entity.Position.x, Entity.Position.y, Entity.width, Entity.height);
    return Entity;
  }
  findOverlaps(Data) {
    let ship, shot;
    for (ship = this.ships.head; ship; ship = ship.next) {
      if (Data.team() == ship.data.team()) continue;
      else {
        for (shot = ship.data.shots.head; shot; shot = shot.next) {
          if (Data.collides(shot.data)) {
            this.hits.append({ship:Data, shot:shot.data});
            // console.log(shot.data.team(), 'hits', Data.team());
          }
        }
        if (Data.collides(ship.data)) {
          this.collisions.append({parties:[Data, ship.data]});
          console.log('collision', ship.data.team(), Data.team());
        }
      }
    }
  }
  resolveHits() {
    let hit;
    while (this.hits.head) {
      hit = this.hits.dropHead();
      // console.log(hit.shot.team(), 'hits', hit.ship.team());
      hit.shot.owner.shots.remove(hit.shot);
      this.ships.remove(hit.ship);
      this.players.remove(hit.ship.owner);
      // this.cxt.
    }
  }
  resolveCollisions() {
    let collision;
  }
  courseCorrect(Data) {
    if (Data.nOOB(this)) (Data.reverseY(), Data.Position.y = this.Position.y);
    if (Data.sOOB(this)) (Data.reverseY(), Data.Position.y = this.height - Data.height);
    if (Data.eOOB(this)) (Data.reverseX(), Data.Position.x = this.width - Data.width);
    if (Data.wOOB(this)) (Data.reverseX(), Data.Position.x = this.Position.x);
    return Data;
  }
  shotOOB(Data) {
    return  Data.nOOB(this)
          | Data.sOOB(this)
          | Data.eOOB(this)
          | Data.wOOB(this);
  }
  damp(Entity) {
    const damp=n=>(n**2 * (1/(2**8))) * ((n<0)?1:-1)
    Entity.Velocity = Entity.Velocity.sum(new V2d(
      damp(Entity.Velocity.x),
      damp(Entity.Velocity.y)
    ));
    return Entity;
  }
}

const team =       [ 'cyan', 'magenta', 'yellow', 'grey' ];
const shotSide =     4;
const shipSide =    24;
const arenaSide =   800;
const innerArena =  200;
const rng =()=> Math.random();
const frng =()=> Math.fround(rng());
const drng =()=> Math.trunc(rng()*10)/10;
const defaultMap =()=>( [
  {
    up:     {code:'KeyE'  },
    left:   {code:'KeyS'  },
    down:   {code:'KeyD'  },
    right:  {code:'KeyF'  }
  },
  {
    up:     {code:'ArrowUp'     },
    left:   {code:'ArrowLeft'   },
    down:   {code:'ArrowDown'   },
    right:  {code:'ArrowRight'  }
  },
  {
    up:     {code:'KeyW'  },
    left:   {code:'KeyA'  },
    down:   {code:'KeyS'  },
    right:  {code:'KeyD'  }
  }
] );
const defaultSpawns =()=>( [
  new V2d(innerArena, innerArena),
  new V2d(3*innerArena, 3*innerArena),
  new V2d(3*innerArena, innerArena),
  new V2d(innerArena, 3*innerArena),
] );
const Spool = new Space(document, arenaSide, arenaSide);

window.onload =()=>{
  Spool.players.append(new Player(defaultMap()[0], team[0], defaultSpawns()[0]));
  Spool.players.append(new Player(defaultMap()[1], team[1], defaultSpawns()[1]));
  // Spool.players.append(new Player(defaultMap()[2], team[2], defaultSpawns()[2]));

  window.addEventListener('keydown', Spool.input);
  Spool.initGame();
  Spool.update();

}
