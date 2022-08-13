import { AudioPlayer } from "./audioplayer.js";
import { Canvas } from "./canvas.js";
import { Keyboard } from "./keyboard.js";



export class CoreEvent {


    public readonly keyboard : Keyboard;
    public readonly audio : AudioPlayer;
    public readonly step = 1.0;


    constructor(keyboard : Keyboard, audio : AudioPlayer) {

        this.keyboard = keyboard;
        this.audio = audio;
    }
}


export type UpdateCallbackFunction = (event : CoreEvent) => void;
export type RedrawCallbackFunction = (redraw : Canvas)   => void;


export class Core {


    private canvas : Canvas;
    private keyboard : Keyboard;
    private audio : AudioPlayer;
    private event : CoreEvent;

    private timeSum = 0.0;
    private oldTime = 0.0;

    private updateCallback : UpdateCallbackFunction = (_ : CoreEvent) : void => {};
    private redrawCallback : RedrawCallbackFunction = (_ : Canvas)    : void => {};


    constructor(canvasWidth : number, canvasHeight : number) {

        this.canvas = new Canvas(canvasWidth, canvasHeight);
        this.keyboard = new Keyboard();
        this.audio = new AudioPlayer();
        this.event = new CoreEvent(this.keyboard, this.audio);
    }


    private loop(ts : number) : void {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.event.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount --) > 0) {

            this.updateCallback(this.event);
            this.keyboard.update();

            this.timeSum -= FRAME_WAIT;
        }

        this.redrawCallback(this.canvas);
        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public run(onstart : ((event : CoreEvent) => void) = () => {},
        updateCb : UpdateCallbackFunction = () => {},
        redrawCb : RedrawCallbackFunction = () => {}) : void {

        this.updateCallback = updateCb;
        this.redrawCallback = redrawCb;

        onstart(this.event);
        this.loop(0);
    }
}
