import { animate } from "./animator.js";
import { Bitmap, Canvas, Flip } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { KeyState } from "./keyboard.js";
import { nextParticle, RubbleParticle, StarParticle } from "./particle.js";
import { COLUMN_COUNT, createTerrainMap } from "./terrainmap.js";
import { RGBA } from "./vector.js";


const DYNAMIC_TILES = [4, 10];
const STATE_BUFFER_MAX = 64;


export const enum Direction {

    None = 0,
    Right = 1,
    Up = 2,
    Left = 3,
    Down = 4
};


export class PuzzleState {

    private layers : Array<Array<number>>;

    private flip : Flip;

    public readonly width : number;
    public readonly height : number;


    constructor(staticLayer : Array<number>, dynamicLayer : Array<number>,
        width : number, height : number, flip : Flip) {

        this.layers = new Array<Array<number>> (2);

        this.layers[0] = Array.from(staticLayer);
        this.layers[1] = Array.from(dynamicLayer);

        this.flip = flip;

        this.width = width;
        this.height = height;
    }


    public getTile(layer : 0 | 1, x : number, y : number, def = 1) : number {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return def;

        return this.layers[layer][y*this.width + x];
    }


    public setTile(layer : 0 | 1, x : number, y : number, v : number) : void {
        
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return;

        this.layers[layer][y*this.width + x] = v;
    }


    public getFlip() : Flip {

        return this.flip;
    }


    public setFlip(flip : Flip) : void {

        this.flip = flip;
    }


    public iterate(layer : number, cb : (x : number, y : number, value : number) => void) : void {

        let i = 0;
        for (let dy = 0; dy < this.height; ++ dy) {

            for (let dx = 0; dx < this.width; ++ dx) {

                cb(dx, dy, this.layers[layer][i ++]);
            }
        }
    }


    public clone = () : PuzzleState => new PuzzleState(
        this.layers[0], this.layers[1], 
        this.width, this.height, this.flip);
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

    private staticAnimationTimer = 0.0;

    private stars : Array<StarParticle>;
    private rubble : Array<RubbleParticle>;

    public readonly width = 10;
    public readonly height = 9;


    constructor(initialMap : Array<number>) {

        this.baseTilemap = Array.from(initialMap);

        this.states = new Array<PuzzleState> ();
        this.activeState = new PuzzleState(
            this.baseTilemap,
            this.baseTilemap.map(v => Number(DYNAMIC_TILES.includes(v)) * v),
            this.width, this.height, Flip.None);

        this.moveData = (new Array<Direction> (this.width*this.height)).fill(Direction.None);

        this.terrainMap = createTerrainMap(this.baseTilemap, this.width, this.height);

        this.stars = new Array<StarParticle> ();
        this.rubble = new Array<RubbleParticle> ();
    }


    private isReserved(x : number, y : number) : boolean {

        let bottom = this.activeState.getTile(0, x, y);
        let top = this.activeState.getTile(1, x, y);
        
        return [1, 3, 8, 9].includes(bottom) ||
               top == 4 || top == 10;
    }


    private checkLadder(x : number, y : number, direction : Direction, falling = false) : boolean {

        // TODO: Simplify (make more "compact")

        if (direction == Direction.Left || direction == Direction.Right)
            return true;

        let tid = this.activeState.getTile(0, x, y);
        let ret = tid == 2;
        if (!ret) {

            if (direction == Direction.Down) {

                return this.activeState.getTile(0, x, y+1) == 2 ||
                    (!falling && y < this.height-1 && this.activeState.getTile(1, x, y+2) == 4);
            }
            else if (tid == 0) {

                for (let dy = y+1; dy < this.height; ++ dy) {

                    // Need to use the old state here...
                    // TODO: Does this cause problems?
                    if (this.oldState?.getTile(1, x, dy) != 4)
                        break;
                    if (this.oldState?.getTile(0, x, dy) == 2)
                        return true;
                }
            }
        }
        return ret;
    }


    private spawnRubble(x : number, y : number) : void {

        const INITIAL_SPEEDS = [0.5, 1.5, 2.5, 3.5];

        for (let dy = 0; dy < 2; ++ dy) {

            for (let dx = 0; dx < 2; ++ dx) {

                (nextParticle(this.rubble, RubbleParticle) as RubbleParticle)
                    .spawn(x + dx*8 + 4, y + dy*8 + 4,
                        0, INITIAL_SPEEDS[dy*2 + dx],
                        dy*2 + dx);
            }
        }
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
            this.activeState.iterate(1, (x : number, y : number, v : number) => {

                switch (v) {

                // Player
                case 4:

                    if (this.moveData[y*this.width + x] == Direction.None &&
                        !this.isReserved(x + dx, y + dy) &&
                        this.checkLadder(x, y, direction, fallCheck) == !fallCheck) {

                        this.activeState.setTile(1, x, y, 0);
                        this.activeState.setTile(1, x + dx, y + dy, 4);

                        if (!fallCheck && y < this.height-1 && this.activeState.getTile(0, x, y+1) == 9) {

                            this.activeState.setTile(0, x, y+1, 0);
                            this.spawnRubble(x*16, (y+1)*16);
                        }

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

                // Boulder
                case 10:

                    if (!fallCheck && (direction == Direction.Up || direction == Direction.Down)) {
                        
                        break;
                    }

                    // TODO: Add support for moving multiple boulders!
                    if (this.moveData[y*this.width + x] == Direction.None && 
                        !this.isReserved(x + dx, y + dy) &&
                        (fallCheck || this.oldState?.getTile(1, x - dx, y) == 4)) {

                        this.activeState.setTile(1, x, y, 0);
                        this.activeState.setTile(1, x + dx, y + dy, 10);

                        this.moveData[(y + dy) * this.width + (x + dx)] = direction;
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


    private spawnStarParticles(x : number, y : number, count : number, 
        angleStart : number, color : RGBA) : void {

        const BASE_SPEED = 2.0;
        const VERTICAL_JUMP = -1.0;

        let angle : number;

        for (let i = 0; i < count; ++ i) {

            angle = angleStart + Math.PI*2 / count * i;

            (nextParticle(this.stars, StarParticle) as StarParticle)
                .spawn(x, y, 
                    Math.cos(angle) * BASE_SPEED, 
                    Math.sin(angle) * BASE_SPEED + VERTICAL_JUMP,
                 color);
        }
    }


    private checkStaticTileEvents(event : CoreEvent) : boolean {

        const HURTING_TILES = [5, 6, 7];
        
        const COLORS = [
            new RGBA(255, 255, 255),
            new RGBA(255, 255, 85),
            new RGBA(170, 255, 255)
        ];

        let somethingHappened = false;
        let bottom : number;

        let color : RGBA;

        this.activeState.iterate(0, (x : number, y : number, v : number) => {

            bottom = this.activeState.getTile(0, x, y);

            if (this.activeState.getTile(1, x, y) == 4 &&
                HURTING_TILES.includes(bottom)) {

                color = COLORS[0];

                this.activeState.setTile(1, x, y, 0);
                if (bottom == 5) {

                    this.activeState.setTile(0, x, y, 0);
                    color = COLORS[1];
                }
                else if (bottom == 7) {

                    this.activeState.setTile(0, x, y, 8);
                    color = COLORS[2];
                }

                this.spawnStarParticles(x*16 + 8, y*16 + 8, 4, Math.PI/4, color);

                somethingHappened = true;
            }
        });
        return somethingHappened;
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

            this.checkStaticTileEvents(event);

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
                }
                else {
                    
                    -- tid;

                    sx = tid % COLUMN_COUNT;
                    sy = (tid / COLUMN_COUNT) | 0;

                    canvas.drawBitmapRegion(bmp, sx*8, sy*8, 8, 8, x*8, y*8);
                }

                // Tile correction
                if (y > 0) {

                    tid = this.terrainMap[(y-1) * this.width * 2 + x]
                    if (tid >= 1 && tid <= 3) {

                        canvas.setFillColor(170, 85, 85)
                            .fillRect(x*8+2, y*8, 4, 1);
                            
                    }
                }
            }
        }
    }


    private drawWater(canvas : Canvas, dx : number, dy : number) : void {

        const AMPLITUDE = 2;
        const YOFF = 6;

        let baseWave = this.staticAnimationTimer * Math.PI*2;
        let wave : number;

        dy += YOFF;
        
        canvas.setFillColor(170, 255, 255);
        for (let x = 0; x < 16; ++ x) {

            wave = Math.round(Math.sin(baseWave + (Math.PI*2) / 16 * x) * AMPLITUDE * Math.sin(Math.PI / 16 * x));

            canvas.fillRect(dx + x, dy + wave, 1, 16 - (wave + YOFF));
        }
    }


    private drawNonTerrainStaticTiles(canvas : Canvas, bmp : Bitmap) : void {

        const BRIDGE_OFF = -2;

        let dx : number;
        let dy : number;

        this.activeState.iterate(0, (x : number, y : number, v : number) => {

            dx = x*16;
            dy = y*16;

            switch (v) {

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

            // Flame
            case 5:

                canvas.drawHorizontallyWavingBitmapRegion(
                    bmp, 64, 32, 16, 16, dx, dy,
                    this.staticAnimationTimer * Math.PI*2,
                    Math.PI*4 / 16, 1);
                break;

            // Spikes
            case 6:

                for (let i = 0; i < 2; ++ i)
                    canvas.drawBitmapRegion(bmp, 72, 0, 8, 8, dx + i*8, dy+8);
                break;

            // Lava
            case 7:

                this.drawWater(canvas, dx, dy);
                break;

            // Ice block
            case 8:

                canvas.drawBitmapRegion(bmp, 80, 32, 16, 16, dx, dy);
                break;

            // Breaking block
            case 9:

                canvas.drawBitmapRegion(bmp, 80, 0, 16, 16, dx, dy);
                break;

            default:
                break;
            }
        });
    }


    public update(event : CoreEvent) : void {

        const STATIC_ANIMATION_SPEED = 0.025;

        this.move(event);
        this.control(event);

        if (event.keyboard.getActionState("undo") == KeyState.Pressed) {

            this.undo();
        }

        this.staticAnimationTimer = (this.staticAnimationTimer + STATIC_ANIMATION_SPEED*event.step) % 1.0;

        for (let r of this.rubble) {

            r.update(event);
        }
        for (let s of this.stars) {

            s.update(event);
        }
    }


    public draw(canvas : Canvas, bmpBase : Bitmap) : void {
    
        this.drawNonTerrainStaticTiles(canvas, bmpBase);
        this.drawTerrain(canvas, bmpBase);

        for (let r of this.rubble) {

            r.draw(canvas, bmpBase);
        }

        animate(this.activeState, this.moveData, this.moveTimer, canvas, bmpBase);

        for (let s of this.stars) {

            s.draw(canvas);
        }
    }
}
