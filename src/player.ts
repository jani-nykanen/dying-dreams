import { Bitmap, Canvas, Flip } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { GameObject } from "./gameobject.js";
import { KeyState } from "./keyboard.js";
import { Stage } from "./stage.js";
import { Vector2 } from "./vector.js";


export class Player extends GameObject {


    private flip = Flip.None;

    private frame = 0;
    private animStart = 0;
    private animEnd = 0;
    private animTimer = 0.0;
    private animSpeed = 0.0;


    constructor(x : number, y : number) {

        super(x, y);

        this.moveSpeed = 1.0/16.0;
    }


    private control(stage : Stage, event : CoreEvent) : void {

        if (this.moving)
            return;

        let dx = 0;
        let dy = 0;

        if ((event.keyboard.getActionState("right") & KeyState.DownOrPressed) == 1) {

            dx = 1;
        }
        else if ((event.keyboard.getActionState("left") & KeyState.DownOrPressed) == 1) {

            dx = -1;
        }
        else if ((event.keyboard.getActionState("up") & KeyState.DownOrPressed) == 1) {

            dy = -1;
        }
        else if ((event.keyboard.getActionState("down") & KeyState.DownOrPressed) == 1) {

            dy = 1;
        }

        if (dx != 0 || dy != 0) {

            this.moveTo((this.pos.x + dx) | 0, (this.pos.y + dy) | 0);
        }
    }


    private startAnimation(start : number, end : number, speed : number) : void {

        this.animStart = start;
        this.animEnd = end;
        this.animSpeed = speed;

        if (this.frame < start || this.frame > end)
            this.frame = start;
    }


    private animate(event : CoreEvent) : void {

        let horizontal = Math.abs(this.pos.x - this.target.x) > 0;

        if (!this.moving) {

            // TODO: Climb  frame?
            this.frame = 0;
            return;
        }

        if (horizontal) {

            this.flip = (this.pos.x > this.target.x) ? Flip.Horizontal : Flip.None;

            this.startAnimation(1, 4, 4.0);
        }

        if ((this.animTimer += event.step) >= this.animSpeed) {

            this.animTimer %= this.animSpeed;
            if ((++ this.frame) > this.animEnd) {

                this.frame = this.animStart;
            }
        }
    }


    protected updateLogic(stage: Stage, event: CoreEvent) : void {
        
        this.control(stage, event);
        this.animate(event);
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        let renderPos = Vector2.interpolate(this.pos, this.target, this.moveTimer).scalarMultiply(16);

        let px = Math.round(renderPos.x);
        let py = Math.round(renderPos.y) + 1;

        canvas.drawBitmapRegion(bmp, 0, 16, 16, 16, px, py, this.flip);
    }
}
