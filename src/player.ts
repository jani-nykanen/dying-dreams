import { Bitmap, Canvas, Flip } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { DEFAULT_MOVE_SPEED, GameObject } from "./gameobject.js";
import { KeyState } from "./keyboard.js";
import { clamp } from "./math.js";
import { Ramp, Sample } from "./sample.js";
import { Stage } from "./stage.js";
import { Vector2 } from "./vector.js";



const enum JumpType {

    None = 0,
    Up = 1,
    Forward = 2,
    Down = 3
};



export class Player extends GameObject {


    private flip = Flip.None;

    private frame = 0;
    private animStart = 0;
    private animEnd = 0;
    private animTimer = 0.0;
    private animSpeed = 0.0;

    private climbing = false;
    private jumpType : JumpType = JumpType.None;
    private jumpHeight : number;

    // TODO: Move these to an asset manager object
    private sampleJump : Sample;
    private sampleClimb : Sample;


    constructor(x : number, y : number, event : CoreEvent) {

        super(x, y);

        this.sampleJump = event.audio.createSample(
            [[160, 4], [192, 4], [256, 10]], 0.60,
            "sawtooth", Ramp.Exponential, 0.20
        );
        this.sampleClimb = event.audio.createSample(
            [[180, 3]], 0.60,
            "square", Ramp.Instant, 0.20
        );
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

        this.jumpType = JumpType.None;
        this.moveSpeed = DEFAULT_MOVE_SPEED;

        if (dx != 0 || dy != 0) {

            tx = (this.pos.x + dx) | 0;
            ty = (this.pos.y + dy) | 0;
            
            if (stage.isSolid(tx, ty)) {

                // Jump over a tile, if possible
                if (dx != 0 && !stage.isSolid(tx, ty-1) && !this.climbing) {

                    this.jumpType = JumpType.Up;
                    -- ty;
                }
                else {
                
                    return;
                }
            }
            else if (dx != 0 && 
                    !stage.isSolid(tx, ty+1) && 
                    !stage.isLadder(tx, ty+1)) {

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

                    this.jumpType = JumpType.Forward;
                }
                // Fall
                else  {
                    
                    this.jumpType = JumpType.Down;
                    ty = stage.findGround(tx, ty);

                    this.jumpHeight = Math.abs(this.pos.y - ty);
                    this.moveSpeed = DEFAULT_MOVE_SPEED * (1.0 + (this.jumpHeight - 1)*0.25);
                }
            }
            else if (dy != 0) {

                // Climb
                if (stage.isLadder(tx, ty-dy) ||
                    stage.isLadder(tx, ty)) {

                    this.climbing = true;
                }
                else {

                    return;
                }
            }
            this.moveTo(tx, ty);

            if (this.jumpType != JumpType.None) {

                event.audio.playSample(this.sampleJump, 0.60);
            }
        }
    }


    private startAnimation(start : number, end = start, speed = 0) : void {

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

        let oldFrame = this.frame;

        if (!this.climbing) {

            if (this.jumpType == JumpType.None) {

                this.startAnimation(1, 4, 6.0);
            }
            else {

                this.startAnimation(5);
            }
            this.flip = (this.pos.x > this.target.x) ? Flip.Horizontal : Flip.None;
        }
        else {

            this.startAnimation(6, 7, 8.0);
        }

        if (this.animSpeed > 0.0 &&
            (this.animTimer += event.step) >= this.animSpeed) {

            this.animTimer %= this.animSpeed;
            if ((++ this.frame) > this.animEnd) {

                this.frame = this.animStart;
            }
        }

        if (this.climbing && oldFrame != this.frame && this.frame == 6) {

            event.audio.playSample(this.sampleClimb, 0.70);
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

        const JUMP_HEIGHT = [12.0, 8.0, 12.0];

        const LEG_X = [0, 16, 16, 32, 32, 64, 0, 0];
        const LEG_Y = [8, 0, 8, 0, 8, 0, 8, 8];

        let renderPos = Vector2.interpolate(this.pos, this.target, this.moveTimer).scalarMultiply(16);

        let px = Math.round(renderPos.x);
        let py = Math.round(renderPos.y) + 1;

        if (this.climbing) {

            canvas.drawBitmapRegion(bmp, 48, 16, 16, 16, px, py, 
                this.frame == 7 ? Flip.Horizontal : Flip.None);
            return;
        }

        let jumpBonus = 0;
        if (this.jumpType != JumpType.None) {

            switch (this.jumpType) {

            case JumpType.Forward:
            case JumpType.Up: 

                jumpBonus = Math.round(Math.sin(Math.PI * this.moveTimer) * JUMP_HEIGHT[Number(this.jumpType-1)]);
                break;

            case JumpType.Down:

                jumpBonus = Math.round(Math.sin(Math.PI * this.moveTimer) * JUMP_HEIGHT[Number(this.jumpType-1)] * this.jumpHeight);
                break;

            default:
                break;
            }

            py -= jumpBonus;
        }

        // Head
        canvas.drawBitmapRegion(bmp, 0, 16, 16, 8, px, py, this.flip);
        // Legs
        canvas.drawBitmapRegion(bmp, LEG_X[this.frame], 16+LEG_Y[this.frame], 16, 8, px, py+8, this.flip);
    }
}
