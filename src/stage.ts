import { Bitmap, Canvas, Flip } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { Player } from "./player.js";
import { COLUMN_COUNT, createTerrainMap } from "./terrainmap.js";


const STATIC_TILES = [0, 1, 2];
const DYNAMIC_TILES = [3];


export const enum Direction {

    None = 0,
    Right = 1,
    Up = 2,
    Left = 3,
    Down = 4
};


export class PuzzleState {

    private layers : Array<Array<number>>;

    public readonly width : number;
    public readonly height : number;


    constructor(bottom : Array<number>, top : Array<number>, 
        width : number, height : number) {

        // We make an assumption that the arrays passed here
        // are copies already, to avoid possible double
        // Array.from, which affects the performance
        this.layers = new Array<Array<number>> (2);
        this.layers[0] = bottom;
        this.layers[1] = top;

        this.width = width;
        this.height = height;
    }


    public getTile(layer : 0 | 1, x : number, y : number, def = 1) : number {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return def;

        return this.layers[layer][y*this.width + x];
    }


    public clone = () : PuzzleState => new PuzzleState(
        Array.from(this.layers[0]), 
        Array.from(this.layers[1]), 
        this.width, this.height);
}


export class Stage {


    private baseTilemap : Array<number>;
    private terrainMap : Array<number>;

    private states : Array<PuzzleState>;
    private activeState : PuzzleState;

    private player : Player | null = null;

    public readonly width = 10;
    public readonly height = 9;


    constructor(initialMap : Array<number>, event : CoreEvent) {

        this.baseTilemap = Array.from(initialMap);

        this.states = new Array<PuzzleState> ();
        this.activeState = new PuzzleState(
            this.baseTilemap.map(v => Number(STATIC_TILES.includes(v)) * v),
            this.baseTilemap.map(v => Number(DYNAMIC_TILES.includes(v)) * v),
            this.width, this.height);

        this.terrainMap = createTerrainMap(this.baseTilemap, this.width, this.height);
        this.parseObjects(event);
    }


    private parseObjects(event : CoreEvent) : void {

        let tid : number;

        for (let y = 0; y < this.height; ++ y) {

            for (let x = 0; x < this.width; ++ x) {

                tid = this.baseTilemap[y*this.width + x];

                switch (tid) {

                // Player
                case 3:
                    this.player = new Player(x, y, event);
                    break;

                default:
                    break;
                }
            }
        }
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

                default:
                    break;
                }
            }
        }
    }


    public update(event : CoreEvent) : void {

        this.player?.update(this, event);
    }


    public draw(canvas : Canvas, bmpBase : Bitmap) : void {

        this.drawTerrain(canvas, bmpBase);
        this.drawNonTerrainStaticTiles(canvas, bmpBase);

        this.player?.draw(canvas, bmpBase);
    }


    public getTile = (layer : 0 | 1, x : number, y : number) : number => this.activeState.getTile(layer, x, y);


    public isSolid = (x : number, y : number) : boolean => [1].includes(this.getTile(0, x, y));
    public isLadder = (x : number, y : number) : boolean => this.getTile(0, x, y) == 2;


    public findGround(x : number, y : number) : number {

        for (let j = y; j < this.height; ++ j) {

            if (this.isSolid(x, j) || this.isLadder(x, j)) {

                return j-1;
            }
        }
        return this.height-1;
    }
}
