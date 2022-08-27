import { Canvas } from "./canvas.js";
import { CoreEvent, Scene } from "./core.js";
import { LEVEL_DATA } from "./leveldata.js";
import { clamp } from "./math.js";
import { Menu, MenuButton } from "./menu.js";
import { TransitionType } from "./transition.js";


export class TitleScreen implements Scene {


    private startMenu : Menu


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

                event.changeScene("game", index);
            });
    }


    private drawLogo(canvas : Canvas) : void {

        const POS_Y = [16, 40];
        const XOFF = -14;
        const TEXT = ["DYING", "DREAMS"];

        let font = canvas.assets.getBitmap("fontBig");

        let dx : number;

        for (let i = 0; i < 2; ++ i) {

            // 1.20 is a "correction number", since the font is not properly aligned
            // to the "grid"
            dx = canvas.width/2 - (TEXT[i].length + 1.20) * (32 + XOFF) / 2.0;
            for (let j = 0; j < TEXT[i].length; ++ j) {

                for (let k = 1; k >= 0; -- k) {

                    canvas.drawText(font, TEXT[i].charAt(j), 
                        dx + j * (32 + XOFF) + k, POS_Y[i] + k);
                }
            }
        }
    }


    public init(param : any, event : CoreEvent) : void {

        this.startMenu.activate(0);
        this.startMenu.changeButtonText(2, event.audio.getStateString());
    }


    public update(event : CoreEvent) : void {

        this.startMenu.update(event);
    }


    public redraw(canvas : Canvas) : void {

        canvas.drawBitmap(canvas.assets.getBitmap("background"), -8)
              .setFillColor(0, 0, 0, 0.33)
              .fillRect();
              
        this.startMenu.draw(canvas, 0, 40);
        this.drawLogo(canvas);
    }


    public onChange() : any {

        return null;
    }

}
