import { Bitmap, Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { Stage } from "./stage.js";
import { Vector2 } from "./vector.js";


export const DEFAULT_MOVE_SPEED = 16.0;


export class GameObject {

    
    protected pos : Vector2;
    protected target : Vector2;

    protected moving = false;
    protected moveTimer = 0.0;
    protected moveSpeed = DEFAULT_MOVE_SPEED;

    protected exist = true;


    constructor(x : number, y : number) {

        this.pos = new Vector2(x, y);
        this.target = this.pos.clone();
    }


    protected stopMovementEvent(stage : Stage, event : CoreEvent) : void {}


    private updateMovement(stage : Stage, event : CoreEvent) : void {

        if (!this.moving)
            return;

        if ((this.moveTimer += (1.0 / this.moveSpeed) * event.step) >= 1.0) {

            this.stopMovementEvent(stage, event);
            this.pos = this.target.clone();
            
            this.moveTimer = 0;
            this.moving = false;
        }
    }


    protected moveTo(x : number, y : number) : void {

        if (this.moving)
            return;

        this.target = new Vector2(x, y);
        this.moving = true;
        this.moveTimer = 0.0;
    }


    protected updateLogic(stage : Stage, event : CoreEvent) : void {}


    public update(stage : Stage, event : CoreEvent) : void {

        if (!this.exist)
            return;

        this.updateLogic(stage, event);
        this.updateMovement(stage, event);
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {}
}
