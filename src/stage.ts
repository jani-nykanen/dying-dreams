import { Bitmap, Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { COLUMN_COUNT, createTerrainMap } from "./terrainmap.js";



export class Stage {


    private baseTilemap : Array<number>;
    private staticTiles : Array<number>;

    private terrainMap : Array<number>;

    public readonly width = 10;
    public readonly height = 9;


    constructor(initialMap : Array<number>) {

        this.baseTilemap = Array.from(initialMap);
        this.staticTiles = Array.from(initialMap).map(v => [1,2].includes(v) ? v : 0);

        this.terrainMap = createTerrainMap(this.staticTiles, this.width, this.height);
    }


    public update(event : CoreEvent) : void {

        // ...
    }


    public draw(canvas : Canvas, bmpBase : Bitmap) : void {

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

                canvas.drawBitmapRegion(bmpBase, sx*8, sy*8, 8, 8, x*8, y*8);
            }
        }
    }
}
