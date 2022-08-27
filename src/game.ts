import { Canvas } from "./canvas.js";
import { CoreEvent, Scene } from "./core.js";
import { KeyState } from "./keyboard.js";
import { LEVEL_DATA } from "./leveldata.js";
import { Menu, MenuButton } from "./menu.js";
import { Stage } from "./stage.js";
import { TransitionType } from "./transition.js";


export class Game implements Scene {


    private stage : Stage;
    private stageIndex = 1;
    
    private backgroundTimer : number = 0.0;

    private pauseMenu : Menu;


    constructor() {

        this.stage = new Stage(LEVEL_DATA[this.stageIndex-1], this.stageIndex);

        this.pauseMenu = new Menu(
            [
                new MenuButton("Resume", () => this.pauseMenu.deactivate()),

                new MenuButton("Restart", () => {

                    this.stage.restart();
                    this.pauseMenu.deactivate();
                }),

                new MenuButton("Undo", () => {

                    this.stage.undo();
                    this.pauseMenu.deactivate();
                }),

                new MenuButton("Audio: On ", (event : CoreEvent) => {

                    event.audio.toggle();
                    this.pauseMenu.changeButtonText(3, event.audio.getStateString());
                }),

                new MenuButton("Quit", (event : CoreEvent) => {

                    this.pauseMenu.deactivate();
                    event.transition.activate(true, TransitionType.Fade,
                        1.0/30.0, () => {
                            event.changeScene("titlescreen");
                        }, 6);
                })
            ]
        );
    }


    private drawBackground(canvas : Canvas) : void {

        let bmp = canvas.assets.getBitmap("background");
        if (bmp == undefined)
            return;

        let offy = 4; // Math.abs(canvas.height - bmp.height) / 2;

        let amplitude = offy;
        let perioud = Math.PI*4 / bmp.width;

        let dy : number;

        for (let dx = 0; dx < bmp.width; ++ dx) {

            dy = Math.round(Math.sin(this.backgroundTimer + perioud*dx) * amplitude);
            canvas.drawBitmapRegion(bmp, dx, dy + offy, 1, canvas.height, dx, 0);
        }
    }


    public init(param : any | null, event: CoreEvent) : void {

        this.pauseMenu.changeButtonText(3, event.audio.getStateString());
        if (param != null) {

            this.stageIndex = Number(param);
            this.stage.changeStage(this.stageIndex, LEVEL_DATA[this.stageIndex-1]);
        }
    }


    public update(event : CoreEvent) : void {

        const BACKGROUND_SPEED = 0.025;

        if (event.transition.isActive())
            return;

        if (this.pauseMenu.isActive()) {

            this.pauseMenu.update(event);
            return;
        }
        else if (this.stage.canBeInterrupted() &&
            event.keyboard.getActionState("pause") == KeyState.Pressed) {

            event.audio.playSample(event.assets.getSample("pause"), 0.60);
            this.pauseMenu.activate(0);
            return;
        }

        if (this.stage.update(event, event.assets)) {

            event.transition.activate(true, TransitionType.Circle, 1.0/30.0,
            () => {

                try {

                    window.localStorage.setItem("dying_dreams_js13k_save", String(this.stageIndex+1));
                }
                catch (e) {

                    console.log(e);
                }
                ++ this.stageIndex;
                this.stage.changeStage(this.stageIndex, LEVEL_DATA[this.stageIndex-1]);
            });
        }
        
        this.backgroundTimer = (this.backgroundTimer + BACKGROUND_SPEED*event.step) % (Math.PI*2);
    }


    public redraw(canvas : Canvas) : void {

        this.drawBackground(canvas);
        this.stage.draw(canvas, canvas.assets);

        if (this.pauseMenu.isActive()) {

            canvas.setFillColor(0, 0, 0, 0.33)
                  .fillRect();
            this.pauseMenu.draw(canvas);
        }
    }
}
