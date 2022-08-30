import { Bitmap, Canvas } from "./canvas";
import { CoreEvent } from "./core";
import { RGBA, Vector2 } from "./vector.js";



const updateSpeedComponent = (speed : number, target : number, step : number) : number => {

    if (speed < target) {

        return Math.min(target, speed + step);
    }
    return Math.max(target, speed - step);
}


export class Particle {

    
    protected pos : Vector2;
    protected speed : Vector2;
    protected target : Vector2;
    protected friction : Vector2;

    protected radius = 8;

    protected exist = false;
    protected loop = false;


    constructor() {

        this.pos = new Vector2();
        this.speed = new Vector2();
        this.target = new Vector2();
        this.friction = new Vector2(1, 1);
    }


    protected updateLogic(event : CoreEvent) : void {}


    public update(event : CoreEvent) : void {

        if (!this.exist)
            return;

        this.speed.x = updateSpeedComponent(this.speed.x, this.target.x, this.friction.x*event.step);
        this.speed.y = updateSpeedComponent(this.speed.y, this.target.y, this.friction.y*event.step);

        this.pos.x += this.speed.x * event.step;
        this.pos.y += this.speed.y * event.step;

        this.updateLogic(event);

        if (this.loop) {

            if (this.pos.y - this.radius >= event.screenHeight) {

                this.pos.y -= event.screenHeight + this.radius;
            }
        }
        else {

            if (this.pos.x + this.radius < 0 ||
                this.pos.x - this.radius >= event.screenWidth ||
                this.pos.y + this.radius < 0 ||
                this.pos.y - this.radius >= event.screenHeight) {

                this.exist = false;
            }
        }
    }


    public spawnBase(x : number, y : number, sx : number, sy : number) : void {

        const GRAVITY = 4.0;

        this.pos = new Vector2(x, y);
        this.speed = new Vector2(sx, sy);
        this.target.x = this.speed.x;
        this.target.y = GRAVITY;

        this.exist = true;
    }


    public draw(canvas : Canvas, bmp? : Bitmap) : void {}


    public doesExist = () : boolean => this.exist;

    public kill() : void {

        this.exist = false;
    }
}



export class StarParticle extends Particle {


    private waveTimer = 0.0;
    private color : RGBA;


    constructor() {

        super();

        this.friction.x = 0;
        this.friction.y = 0.10;
        this.radius = 16;

        this.color = new RGBA();
    }


    protected updateLogic(event: CoreEvent) : void {

        const WAVE_SPEED = Math.PI*2 / 30;

        this.waveTimer = (this.waveTimer + WAVE_SPEED*event.step) % (Math.PI*2);
    }


    public draw(canvas : Canvas) : void {

        const MIN_R = 7;
        const VARY_R = 2;

        if (!this.exist)
            return;

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        let r = Math.round(MIN_R + Math.sin(this.waveTimer) * VARY_R);

        canvas.setFillColor(this.color.r, this.color.g, this.color.b, this.color.a)
            .fillRegularStar(px, py, r);
    }


    public spawn(x : number, y : number, sx : number, sy : number, color : RGBA) {

        this.spawnBase(x, y, sx, sy);
        this.color = color.clone();
    }
}


export class RubbleParticle extends Particle {


    private tileIndex : number = 0;


    constructor() {

        super();

        this.friction.x = 0;
        this.friction.y = 0.10;
        this.radius = 8;
    }


    public draw(canvas : Canvas, bmp : Bitmap) {

        if (!this.exist)
            return;

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        let srcx = 80 + (this.tileIndex % 2) * 8;
        let srcy = Math.floor(this.tileIndex/2) * 8;

        canvas.drawBitmapRegion(bmp, srcx, srcy, 8, 8,
            px-4, py-4);
    }


    public spawn(x : number, y : number, sx : number, sy : number, tileIndex : number) {

        this.spawnBase(x, y, sx, sy);
        this.tileIndex = tileIndex;
    }
}


export class Bat extends Particle {


    private frameTimer = 0;
    private frame = 0;


    constructor() {

        super();

        this.friction.x = 0.10;
        this.friction.y = 0.10;
        this.radius = 8;
    }


    protected updateLogic(event: CoreEvent) : void {

        const ANIM_SPEED = 6;

        if ((this.frameTimer += event.step) >= ANIM_SPEED) {

            this.frameTimer %= ANIM_SPEED;
            this.frame = (this.frame + 1) % 2;
        }
    }


    public draw(canvas : Canvas, bmp : Bitmap) {

        if (!this.exist)
            return;

        let px = Math.round(this.pos.x);
        let py = Math.round(this.pos.y);

        canvas.drawBitmapRegion(bmp, 
            96, 32 + this.frame*8, 16, 8,
            px-4, py-4);
    }


    public spawn(x : number, y : number, sx : number, sy : number) {

        this.spawnBase(x, y, sx, sy);
        this.speed.x = 0;

        this.target.y *= -1;
    }
}



export const nextParticle = (arr : Array<Particle>, type : Function) : Particle => {

    let p : Particle | null = null;
    for (let a of arr) {

        if (!a.doesExist()) {

            p = a;
            break;
        }
    }

    if (p == null) {

        p = new type.prototype.constructor();
        arr.push(p as Particle);
    }
    return p as Particle; // p is non-null at this point
}
