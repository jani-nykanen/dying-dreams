import { Canvas } from "./canvas.js";
import { CoreEvent, Scene } from "./core.js";
import { KeyState } from "./keyboard.js";
import { LEVEL_DATA } from "./leveldata.js";
import { Menu, MenuButton } from "./menu.js";
import { Stage } from "./stage.js";
import { TransitionType } from "./transition.js";


const HINTS = [
    "  HINT: USE ARROW KEYS TO MOVE.",
    "  HINT: PRESS BACKSPACE TO UNDO.",
    "  HINT: PRESS R TO RESTART.",
    "  HINT: PRESS ENTER TO PAUSE."
];


export class Game implements Scene {


    private stage : Stage;
    private stageIndex = 1;
    
    private backgroundTimer : number = 0.0;

    private pauseMenu : Menu;

    private hintPos : number = 0.0;


    constructor() {

        this.stage = new Stage(LEVEL_DATA[this.stageIndex-1], this.stageIndex);

        this.pauseMenu = new Menu(
            [
                new MenuButton("RESUME", () => this.pauseMenu.deactivate()),

                new MenuButton("RESTART", () => {

                    this.stage.restart();
                    this.pauseMenu.deactivate();
                }),

                new MenuButton("UNDO", () => {

                    this.stage.undo();
                    this.pauseMenu.deactivate();
                }),

                new MenuButton("AUDIO: ON ", (event : CoreEvent) => {

                    event.audio.toggle();
                    this.pauseMenu.changeButtonText(3, event.audio.getStateString());
                }),

                new MenuButton("QUIT", (event : CoreEvent) => {

                    this.pauseMenu.deactivate();
                    event.transition.activate(true, TransitionType.Fade,
                        1.0/30.0, () => {
                            event.changeScene("titlescreen", 1);
                        }, 6);
                })
            ]
        );
    }


    private drawBackground(canvas : Canvas) : void {

        let bmp = canvas.getBitmap("background");
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

        this.hintPos = 0;
    }


    public update(event : CoreEvent) : void {

        const BACKGROUND_SPEED = 0.025;
        const HINT_SPEED = 0.5;

        if (!this.pauseMenu.isActive()) {
            
            this.stage.updateBackground(event);
            this.backgroundTimer = (this.backgroundTimer + BACKGROUND_SPEED*event.step) % (Math.PI*2);
        }

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

        if (this.stageIndex <= HINTS.length) {

            this.hintPos = (this.hintPos + HINT_SPEED*event.step) % (HINTS[this.stageIndex-1].length * 8);
        }

        if (this.stage.update(event, event.assets)) {

            if (this.stageIndex == LEVEL_DATA.length) {

                event.transition.activate(true, TransitionType.Fade, 1.0/60.0, (event : CoreEvent) => {

                    event.transition.deactivate();
                    event.changeScene("story", 1);

                }, 6);
            }
            else {

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
                    this.hintPos = 0;
                });
            }
        } 
    }


    public redraw(canvas : Canvas) : void {

        this.drawBackground(canvas);
        this.stage.draw(canvas);

        if (this.pauseMenu.isActive()) {

            canvas.setFillColor(0, 0, 0, 0.33)
                  .fillRect();
            this.pauseMenu.draw(canvas);
        }

        if (this.stageIndex <= HINTS.length) {

            canvas.setFillColor(0, 0, 0, 0.33)
                  .fillRect(0, 0, canvas.width, 10);
            for (let i = 0; i < 2; ++ i) {

                canvas.drawText(canvas.getBitmap("font"), HINTS[this.stageIndex-1], 
                    -Math.floor(this.hintPos) + i * HINTS[this.stageIndex-1].length*8, 1, 0);
            }
        }
    }
}
