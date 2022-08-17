import { animate } from "./animator.js";
import { Bitmap, Canvas, Flip } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { KeyState } from "./keyboard.js";
import { COLUMN_COUNT, createTerrainMap } from "./terrainmap.js";


const DYNAMIC_TILES = [4];
const STATE_BUFFER_MAX = 64;


export const enum Direction {

    None = 0,
    Right = 1,
    Up = 2,
    Left = 3,
    Down = 4
};


export class PuzzleState {

    private tiles : Array<number>;
    private flip : Flip;

    private readonly staticTiles : Array<number>;

    public readonly width : number;
    public readonly height : number;


    constructor(data : Array<number>, staticTiles : Array<number>,
        width : number, height : number, flip : Flip) {

        this.tiles = Array.from(data);
        this.staticTiles = staticTiles; // Note: we copy the reference, NOT make a copy!
        this.flip = flip;

        this.width = width;
        this.height = height;
    }


    public getTile(x : number, y : number, def = 1) : number {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return def;

        return this.tiles[y*this.width + x];
    }


    public getStaticTile(x : number, y : number, def = 1) : number {
        
        if (x < 0 || y < 0 || x >= this.width || y >=  this.height)
            return def;

        return this.staticTiles[y*this.width + x];
    }


    public setTile(x : number, y : number, v : number) : void {
        
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return;

        this.tiles[y*this.width + x] = v;
    }


    public getFlip() : Flip {

        return this.flip;
    }


    public setFlip(flip : Flip) : void {

        this.flip = flip;
    }


    public iterate(cb : (x : number, y : number, value : number) => void) : void {

        let i = 0;
        for (let dy = 0; dy < this.height; ++ dy) {

            for (let dx = 0; dx < this.width; ++ dx) {

                cb(dx, dy, this.tiles[i ++]);
            }
        }
    }


    public clone = () : PuzzleState => new PuzzleState(this.tiles, this.staticTiles, this.width, this.height, this.flip);
}


export class Stage {


    private baseTilemap : Array<number>;
    private terrainMap : Array<number>;

    private states : Array<PuzzleState>;
    private activeState : PuzzleState;
    private oldState : PuzzleState | null = null;
    private moveData : Array<Direction>;

    private moveTimer = 0.0;
    private moving = false;
    private falling = false;

    public readonly width = 10;
    public readonly height = 9;


    constructor(initialMap : Array<number>) {

        this.baseTilemap = Array.from(initialMap);

        this.states = new Array<PuzzleState> ();
        this.activeState = new PuzzleState(
            this.baseTilemap.map(v => Number(DYNAMIC_TILES.includes(v)) * v),
            this.baseTilemap,
            this.width, this.height, Flip.None);

        this.moveData = (new Array<Direction> (this.width*this.height)).fill(Direction.None);

        this.terrainMap = createTerrainMap(this.baseTilemap, this.width, this.height);
    }


    private isReserved(x : number, y : number) : boolean {

        return [1, 3].includes(this.activeState.getStaticTile(x, y)) ||
               this.activeState.getTile(x, y) == 4;
    }


    private checkLadder(x : number, y : number, direction : Direction, falling = false) : boolean {

        // TODO: Simplify (make more "compact")

        if (direction == Direction.Left || direction == Direction.Right)
            return true;

        let tid = this.activeState.getStaticTile(x, y);
        let ret = tid == 2;
        if (!ret) {

            if (direction == Direction.Down) {

                return this.activeState.getStaticTile(x, y+1) == 2 ||
                    (!falling && y < this.height-1 && this.activeState.getTile(x, y+2) == 4);
            }
            else if (tid == 0) {

                for (let dy = y+1; dy < this.height; ++ dy) {

                    // Need to use the old state here...
                    // TODO: Does this cause problems?
                    if (this.oldState?.getTile(x, dy) != 4)
                        break;
                    if (this.oldState?.getStaticTile(x, dy) == 2)
                        return true;
                }
            }
        }
        return ret;
    }


    private handleAction(direction : Direction, event : CoreEvent, fallCheck = false) : boolean {

        const DX = [1, 0, -1, 0];
        const DY = [0, -1, 0, 1];

        if (direction == Direction.None)
            return false;

        let dx = DX[Number(direction) -1];
        let dy = DY[Number(direction) -1];

        let moved = false;
        let changed = false;

        if (!fallCheck) {

            this.oldState = this.activeState.clone();
        }

        do {

            changed = false;
            this.activeState.iterate((x : number, y : number, v : number) => {

                switch (v) {

                // Player
                case 4:

                    if (this.moveData[y*this.width + x] == Direction.None &&
                        !this.isReserved(x + dx, y + dy) &&
                        this.checkLadder(x, y, direction, fallCheck) == !fallCheck) {

                        this.activeState.setTile(x, y, 0);
                        this.activeState.setTile(x + dx, y + dy, 4);

                        this.moveData[(y + dy) * this.width + (x + dx)] = direction;

                        if (direction == Direction.Left) {

                            this.activeState.setFlip(Flip.Horizontal);
                        }
                        else if (direction == Direction.Right) {

                            this.activeState.setFlip(Flip.None);
                        }

                        moved = true;
                        changed = true;
                    }
                    break;

                default:
                    break;
                }

            });

        } while(changed);

        return moved;
    }


    private control(event : CoreEvent) : void {

        if (this.moving)
            return;

        let dir = Direction.None;

        if ((event.keyboard.getActionState("right") & KeyState.DownOrPressed) == 1) {

            dir = Direction.Right;
        }
        else if ((event.keyboard.getActionState("up") & KeyState.DownOrPressed) == 1) {

            dir = Direction.Up;
        }
        else if ((event.keyboard.getActionState("left") & KeyState.DownOrPressed) == 1) {

            dir = Direction.Left;
        }
        else if ((event.keyboard.getActionState("down") & KeyState.DownOrPressed) == 1) {

            dir = Direction.Down;
        }

        if (this.handleAction(dir, event)) {

            this.moving = true;
            this.moveTimer = 0.0;
            this.falling = false;
        }
    }


    private move(event : CoreEvent) : void {

        const MOVE_SPEED_BASE = 1.0/16.0;
        const MOVE_SPEED_FALL = 1.0/8.0;

        if (!this.moving)
            return;

        let moveSpeed = this.falling ? MOVE_SPEED_FALL : MOVE_SPEED_BASE;

        if ((this.moveTimer += moveSpeed * event.step) >= 1.0) {

            this.moveTimer = 0;
            this.moving = false;

            this.moveData.fill(Direction.None);

            // Check falling
            if (this.handleAction(Direction.Down, event, true)) {
                
                this.moving = true;
                this.moveTimer = 0.0;

                this.falling = true;
            }
            else if (this.oldState != null) {

                this.states.push(this.oldState.clone());
                if (this.states.length >= STATE_BUFFER_MAX) {

                    this.states.shift();
                }
            }
        }
    }


    private undo() : void {

        let s = this.states.pop();
        if (s == null)
            return;

        this.activeState = s.clone();

        this.moving = false;
        this.moveTimer = 0;
        this.moveData.fill(Direction.None);
    }


    private drawTerrain(canvas : Canvas, bmp : Bitmap) : void {

        let sx : number;
        let sy : number;
        let tid : number;

        for (let y = 0; y < this.height*2; ++ y) {

            for (let x = 0; x < this.width*2; ++ x) {

                tid = this.terrainMap[y * this.width * 2 + x];
                if (tid < 0)
                    continue;

                if (tid == 0) {

                    canvas.setFillColor(255, 170, 85)
                          .fillRect(x*8, y*8, 8, 8);
                    continue;
                }
                -- tid;

                sx = tid % COLUMN_COUNT;
                sy = (tid / COLUMN_COUNT) | 0;

                canvas.drawBitmapRegion(bmp, sx*8, sy*8, 8, 8, x*8, y*8);
            }
        }
    }


    private drawNonTerrainStaticTiles(canvas : Canvas, bmp : Bitmap) : void {

        const BRIDGE_OFF = -2;

        let tid : number;
        let dx : number;
        let dy : number;

        for (let y = 0; y < this.height; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                dx = x*16;
                dy = y*16;

                tid = this.baseTilemap[y*this.width + x];
                switch (tid) {

                // Ladder
                case 2:

                    for (let j = 0; j < 2; ++ j) {

                        canvas.drawBitmapRegion(bmp, 56, 0, 8, 8, dx, dy + j*8)
                            .drawBitmapRegion(bmp, 56, 0, 8, 8, dx+8, dy + j*8, Flip.Horizontal);
                    }

                    if (y > 0 && this.baseTilemap[(y-1)*this.width + x] != 2) {

                        dy -= 8;
                        canvas.drawBitmapRegion(bmp, 56, 8, 8, 8, dx, dy)
                              .drawBitmapRegion(bmp, 56, 8, 8, 8, dx+8, dy, Flip.Horizontal);  
                    }
                    break;

                // Bridge
                case 3:

                    for (let i = 0; i < 2; ++ i) {

                        canvas.drawBitmapRegion(bmp, 64, 0, 8, 16, dx + i*8, dy + BRIDGE_OFF);
                    }
                    break;

                default:
                    break;
                }
            }
        }
    }


    public update(event : CoreEvent) : void {

        this.move(event);
        this.control(event);

        if (event.keyboard.getActionState("undo") == KeyState.Pressed) {

            this.undo();
        }
    }


    public draw(canvas : Canvas, bmpBase : Bitmap) : void {
    
        this.drawNonTerrainStaticTiles(canvas, bmpBase);
        this.drawTerrain(canvas, bmpBase);
        animate(this.activeState, this.moveData, this.moveTimer, canvas, bmpBase);
    }
}
