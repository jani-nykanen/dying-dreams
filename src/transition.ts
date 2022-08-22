import { Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";


export const enum TransitionType {
    None = 0,
    Fade = 1,
    Circle = 2
};


export class Transition {


    private timer : number = 1.0;
    private fadeOut : boolean = false;
    private effectType : TransitionType = TransitionType.None;
    private active : boolean = false;
    private speed : number = 1.0;
    private param : number = 0.0;
    
    private callback : ((event : CoreEvent) => void) = (() => {});


    constructor() {

        // ...
    }


    public activate(fadeOut : boolean, type : TransitionType, speed : number, 
        callback : (event : CoreEvent) => any, param = 0) : void {

        this.fadeOut = fadeOut;
        this.speed = speed;
        this.timer = 1.0;
        this.callback = callback;
        this.effectType = type;
        this.param = param;

        this.active = true;
    }


    public update(event : CoreEvent) {

        if (!this.active) return;

        if ((this.timer -= this.speed * event.step) <= 0) {

            this.fadeOut = !this.fadeOut;
            if (!this.fadeOut) {

                this.timer += 1.0;
                this.callback(event);
            }
            else {

                this.active = false;
                this.timer = 0;
            }
        }
    }


    public draw(canvas : Canvas) : void {

        if (!this.active || this.effectType == TransitionType.None)
            return;

        let t = this.timer;
        if (this.fadeOut)
            t = 1.0 - t;

        let maxRadius : number;
        let radius : number;

        switch (this.effectType) {

        case TransitionType.Fade:

            if (this.param > 0) {

                t = Math.round(t * this.param) / this.param;
            }
            canvas.setFillColor(0, 0, 0, t)
                  .fillRect(0, 0, canvas.width, canvas.height);
            break;

        case TransitionType.Circle:

            maxRadius = Math.max(
                Math.hypot(canvas.width/2, canvas.height/2),
                Math.hypot(canvas.width - canvas.width/2, canvas.height/2),
                Math.hypot(canvas.width - canvas.width/2, canvas.height - canvas.height/2),
                Math.hypot(canvas.width/2, canvas.height - canvas.height/2)
            );

            radius = (1 - t) * maxRadius;
            canvas.setFillColor(0)
                  .fillCircleOutside(radius);

            break;

        default:
            break;
        }
    }


    public isActive = () : boolean => this.active;
    public isFadingOut = () : boolean => this.active && this.fadeOut;

    
    public deactivate() {

        this.active = false;
    }
}
