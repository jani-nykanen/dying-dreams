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

    private climbing = false;


    constructor(x : number, y : number) {

        super(x, y);

        this.moveSpeed = 1.0/16.0;
    }


    private control(stage : Stage, event : CoreEvent) : void {

        if (this.moving)
            return;

        let dx = 0;
        let dy = 0;

        let tx : number;
        let ty : number;

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

            tx = (this.pos.x + dx) | 0;
            ty = (this.pos.y + dy) | 0;
            
            if (stage.isSolid(tx, ty)) {

                if (dx != 0 && !stage.isSolid(tx, ty-1) && !this.climbing) {

                    -- ty;
                }
                else {
                
                    return;
                }
            }
            else if (dx != 0 && !stage.isSolid(tx, ty+1)) {

                // Cannot jump from a ladder
                if (this.climbing) {

                    return;
                }

                // Jump over gap, if possible
                if (stage.isSolid(tx+dx, ty+1) &&
                    !stage.isSolid(tx+dx, ty)) {

                    tx += dx;
                    if (stage.isSolid(tx, ty)) {

                        return;
                    }
                }
                // Fall
                else {
                    
                    ty = stage.findGround(tx, ty);
                }
            }
            else if (dy != 0) {

                if (stage.getTile(0, tx, ty-dy) == 2 ||
                    stage.getTile(0, tx, ty) == 2) {

                    this.climbing = true;
                }
                else {

                    return;
                }
            }
            this.moveTo(tx, ty);
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

        if (!this.moving) {

            this.animSpeed = 0;
            if (!this.climbing) {

                this.frame = 0;
            }
            return;
        }

        if (!this.climbing) {

            this.flip = (this.pos.x > this.target.x) ? Flip.Horizontal : Flip.None;
            this.startAnimation(1, 4, 6.0);
        }
        else {

            this.startAnimation(5, 6, 8.0);
        }

        if (this.animSpeed > 0.0 &&
            (this.animTimer += event.step) >= this.animSpeed) {

            this.animTimer %= this.animSpeed;
            if ((++ this.frame) > this.animEnd) {

                this.frame = this.animStart;
            }
        }
    }


    protected stopMovementEvent(stage : Stage, event : CoreEvent) : void {

        let px = this.target.x | 0;
        let py = this.target.y | 0;

        if (this.climbing) {

            if (!stage.isLadder(px, py) || 
                (py > this.pos.y && stage.isSolid(px, py+1))) {

                this.climbing = false;
            }
        }
    }


    protected updateLogic(stage: Stage, event: CoreEvent) : void {
        
        if (!this.moving && this.climbing && 
            !stage.isLadder(this.pos.x, this.pos.y)) {

            this.climbing = false;
        }

        this.control(stage, event);
        this.animate(event);
    }


    public draw(canvas : Canvas, bmp : Bitmap) : void {

        const LEG_X = [0, 16, 16, 32, 32, 48, 48];
        const LEG_Y = [8, 0, 8, 0, 8, 8, 8];

        let renderPos = Vector2.interpolate(this.pos, this.target, this.moveTimer).scalarMultiply(16);

        let px = Math.round(renderPos.x);
        let py = Math.round(renderPos.y) + 1;

        if (this.climbing) {

            canvas.drawBitmapRegion(bmp, 48, 16, 16, 16, px, py, 
                this.frame == 6 ? Flip.Horizontal : Flip.None);
            return;
        }

        // Head
        canvas.drawBitmapRegion(bmp, 0, 16, 16, 8, px, py, this.flip);
        // Legs
        canvas.drawBitmapRegion(bmp, LEG_X[this.frame], 16+LEG_Y[this.frame], 16, 8, px, py+8, this.flip);
    }
}
