import { Bitmap, Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { Stage } from "./stage.js";
import { Vector2 } from "./vector.js";


export class GameObject {

    
    protected pos : Vector2;
    protected target : Vector2;

    protected moving = false;
    protected moveTimer = 0.0;
    protected moveSpeed = 1.0/30.0;

    protected exist = true;


    constructor(x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
    }


    private updateMovement(event : CoreEvent) : void {

        if (!this.moving)
            return;

        if ((this.moveTimer -= this.moveSpeed * event.step) <= 0) {

            this.pos = this.target.clone();
            
            this.moveTimer = 0;
            this.moving = false;
        }
    }


    protected updateLogic(stage : Stage, event : CoreEvent) : void {}


    public update(stage : Stage, event : CoreEvent) : void {

        if (!this.exist)
            return;

        this.updateLogic(stage, event);
        this.updateMovement(event);
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {}
}
