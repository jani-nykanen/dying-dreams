import { Canvas, TextAlign } from "./canvas.js";
import { CoreEvent, Scene } from "./core.js";
import { KeyState } from "./keyboard.js";
import { LEVEL_DATA } from "./leveldata.js";
import { clamp } from "./math.js";
import { Menu, MenuButton } from "./menu.js";
import { TransitionType } from "./transition.js";


export class TitleScreen implements Scene {


    private startMenu : Menu
    private phase = 0;
    private enterTimer = 29;
    private waveTimer = 0;


    constructor() {

        this.startMenu = new Menu(
            [
                new MenuButton("New Game", (event : CoreEvent) => {

                    this.startGame(event);
                }),
                new MenuButton("Continue", (event : CoreEvent) => {

                    let index = 1;
                    try {

                        index = clamp(Number(window.localStorage.getItem("dying_dreams_js13k_save")), 1, LEVEL_DATA.length);
                    }
                    catch (e) {

                        console.log(e);
                        index = 1;
                    }
                    this.startGame(event, index);
                }),
                new MenuButton("Audio: Off", (event : CoreEvent) => {

                    event.audio.toggle();
                    this.startMenu.changeButtonText(2, event.audio.getStateString());
                })
            ], true);
    }

    
    private startGame(event : CoreEvent, index = 1) : void {

        

        event.transition.activate(true, TransitionType.Circle, 1.0/30.0,
            (event : CoreEvent) => {

                if (index > 1) {

                    event.changeScene("game", index);
                }
                else {

                    event.changeScene("story", 0);
                    event.transition.deactivate();
                }
            });
    }


    private drawLogo(canvas : Canvas) : void {

        const POS_Y = [16, 40];
        const XOFF = -14;
        const TEXT = ["DYING", "DREAMS"];
        const CORRECTION = 1.0;
        const AMPLITUDE = 4;

        let font = canvas.getBitmap("fontBig");

        let dx : number;
        let dy : number;

        for (let i = 0; i < 2; ++ i) {

            dx = canvas.width/2 - (TEXT[i].length + CORRECTION) * (32 + XOFF) / 2.0;
            for (let j = 0; j < TEXT[i].length; ++ j) {

                dy = Math.round(Math.sin(this.waveTimer + Math.PI*2 / TEXT[i].length * j) * AMPLITUDE);
                for (let k = 1; k >= 0; -- k) {

                    canvas.drawText(font, 
                        TEXT[i].charAt(j), 
                        dx + j * (32 + XOFF) + k, 
                        dy + POS_Y[i] + k);
                }
            }
        }
    }


    public init(param : any, event : CoreEvent) : void {

        this.startMenu.activate(0);
        this.startMenu.changeButtonText(2, event.audio.getStateString());

        if (param != null) {

            this.phase = Number(param);
            if (this.phase == 1) {

                this.startMenu.activate(1);
            }
        }
    }


    public update(event : CoreEvent) : void {

        const WAVE_SPEED = Math.PI / 60;

        this.waveTimer = (this.waveTimer + WAVE_SPEED*event.step) % (Math.PI*2);

        if (event.transition.isActive())
            return;

        if (this.phase == 0) {

            if (event.keyboard.getActionState("start") == KeyState.Pressed ||
                event.keyboard.getActionState("select") == KeyState.Pressed) {

                event.audio.playSample(event.assets.getSample("pause"), 0.60);
                ++ this.phase;
            }

            this.enterTimer = (this.enterTimer + event.step) % 60;
        }
        else {
            
            this.startMenu.update(event);
        }
    }


    public redraw(canvas : Canvas) : void {

        const CENTER_CORRECTION = -9;

        canvas.drawBitmap(canvas.getBitmap("background"), 0, -8)
              .setFillColor(0, 0, 0, 0.33)
              .fillRect();
              
        if (this.phase == 0) {

            canvas.drawText(canvas.getBitmap("font"), "(c)2022 Jani Nyk@nen",
                canvas.width/2 + CENTER_CORRECTION, 
                canvas.height-20, 
                -17, 0, TextAlign.Center);

            if (this.enterTimer >= 30) {

                canvas.drawText(canvas.getBitmap("fontYellow"), "Press ENTER",
                    canvas.width/2 + CENTER_CORRECTION, canvas.height/2 + 24, -17, 0, TextAlign.Center);
            }
        }
        else {

            this.startMenu.draw(canvas, 0, 40);
        }
        this.drawLogo(canvas);
    }


    public onChange() : any {

        return null;
    }

}
