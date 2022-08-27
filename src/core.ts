import { Assets } from "./assets.js";
import { AudioPlayer } from "./audioplayer.js";
import { Canvas } from "./canvas.js";
import { Keyboard } from "./keyboard.js";
import { Transition } from "./transition.js";


type SceneParam = number | string;


export interface Scene {

    init(param : any, event : CoreEvent) : void;
    update(event : CoreEvent) : void;
    redraw(canvas : Canvas) : void;
}


export class CoreEvent {


    public readonly keyboard : Keyboard;
    public readonly audio : AudioPlayer;
    public readonly transition : Transition;
    public readonly assets : Assets;

    public readonly step = 1.0;

    private readonly canvas : Canvas;
    private readonly core : Core;


    constructor(keyboard : Keyboard, audio : AudioPlayer, canvas : Canvas, 
        transition : Transition, assets : Assets, core : Core) {

        this.keyboard = keyboard;
        this.audio = audio;
        this.canvas = canvas;
        this.transition = transition;
        this.assets = assets;
        this.core = core;
    }


    public get screenWidth() : number { 
        
        return this.canvas.width; 
    }
    public get screenHeight() : number { 
        
        return this.canvas.height; 
    }


    public changeScene(name : string, param : SceneParam = 0) : void {

        this.core.changeScene(name, param);
    }
}


export type UpdateCallbackFunction = (event : CoreEvent) => void;
export type RedrawCallbackFunction = (redraw : Canvas)   => void;


export class Core {


    private canvas : Canvas;
    private keyboard : Keyboard;
    private audio : AudioPlayer;
    private assets : Assets;
    private transition : Transition;
    private event : CoreEvent;

    private scenes : Map<string, Scene>;
    private activeScene : Scene | undefined = undefined;

    private timeSum = 0.0;
    private oldTime = 0.0;


    constructor(canvasWidth : number, canvasHeight : number) {

        this.assets = new Assets();
        this.canvas = new Canvas(canvasWidth, canvasHeight, true, this.assets);
        this.keyboard = new Keyboard();
        this.audio = new AudioPlayer();
        this.transition = new Transition();

        this.event = new CoreEvent(
            this.keyboard, this.audio, 
            this.canvas, this.transition, 
            this.assets, this);

        this.scenes = new Map<string, Scene> ();
    }


    private loop(ts : number) : void {

        const MAX_REFRESH_COUNT = 5;
        const FRAME_WAIT = 16.66667 * this.event.step;

        this.timeSum += ts - this.oldTime;
        this.timeSum = Math.min(MAX_REFRESH_COUNT * FRAME_WAIT, this.timeSum);
        this.oldTime = ts;

        let refreshCount = (this.timeSum / FRAME_WAIT) | 0;
        while ((refreshCount --) > 0) {

            if (this.activeScene != undefined &&
                this.assets.hasLoaded()) {

                this.activeScene.update(this.event);
            }

            this.keyboard.update();
            this.transition.update(this.event);

            this.timeSum -= FRAME_WAIT;
        }

        if (!this.assets.hasLoaded()) {

            this.canvas.clear(0);
        }
        else {

            if (this.activeScene != undefined)
                this.activeScene.redraw(this.canvas);

            this.transition.draw(this.canvas);
        }

        window.requestAnimationFrame(ts => this.loop(ts));
    }


    public run(initialScene : string, 
        onstart : ((event : CoreEvent) => void) = () => {}) : void {

        this.activeScene = this.scenes.get(initialScene);
        if (this.activeScene != undefined) {

            this.activeScene.init(null, this.event);
        }

        onstart(this.event);
        this.loop(0);
    }


    public addScene(name : string,  scene : Scene) : Core {

        this.scenes.set(name, scene);
        return this;
    }


    public changeScene(name : string, param : SceneParam = 0) : void {

        let newScene = this.scenes.get(name);
        if (newScene == undefined) {

            throw "No scene with name: " + name;
        }

        newScene.init(param, this.event);
        this.activeScene = newScene;
    }
}
