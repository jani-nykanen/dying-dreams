import { Bitmap, Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";



export class Stage {


    private baseTilemap : Array<number>;
    private staticTiles : Array<number>;


    constructor(initialMap : Array<number>) {

        this.baseTilemap = Array.from(initialMap);
        this.staticTiles = Array.from(initialMap).filter(v => [0, 1, 2].includes(v));

        console.log(this.staticTiles);
    }


    public update(event : CoreEvent) : void {

        // ...
    }


    public draw(canvas : Canvas, bmpBase : Bitmap) : void {

        // ...
    }
}
