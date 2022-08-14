import { Bitmap, Canvas } from "./canvas.js";
import { GameObject } from "./gameobject.js";
import { Vector2 } from "./vector.js";


export class Player extends GameObject {


    constructor(x : number, y : number) {

        super(x, y);

        this.moveSpeed = 1.0/16.0;
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        let renderPos = Vector2.interpolate(this.pos, this.target, this.moveTimer).scalarMultiply(16);

        let px = Math.round(renderPos.x);
        let py = Math.round(renderPos.y) + 1;

        canvas.drawBitmapRegion(bmp, 0, 16, 16, 16, px, py);
    }
}
