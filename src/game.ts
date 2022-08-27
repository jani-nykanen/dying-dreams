import { Assets } from "./assets.js";
import { Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { KeyState } from "./keyboard.js";
import { LEVEL_DATA } from "./leveldata.js";
import { Menu, MenuButton } from "./menu.js";
import { Stage } from "./stage.js";
import { TitleScreen } from "./titlescreen.js";
import { Transition, TransitionType } from "./transition.js";


const enum Scene {

    Intro = 0,
    TitleScreen = 1,
    Story = 2,
    Game = 3,
};



export class Game {


    private scene = Scene.Game;

    private stage : Stage;
    private stageIndex = 1;
    
    private assets : Assets;
    private transition : Transition;

    private backgroundTimer : number = 0.0;

    private pauseMenu : Menu;
    private titleScreen : TitleScreen;


    constructor(event : CoreEvent) {

        this.assets = new Assets(event);
        this.transition = new Transition();

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

                new MenuButton(event.audio.getStateString(), (event : CoreEvent) => {

                    event.audio.toggle();
                    this.pauseMenu.changeButtonText(3, event.audio.getStateString());
                }),

                new MenuButton("Quit", () => {

                    this.pauseMenu.deactivate();
                    this.transition.activate(true, TransitionType.Fade,
                        1.0/30.0, () => {
                            this.scene = Scene.TitleScreen
                        }, 6);
                })
            ]
        );

        this.titleScreen = new TitleScreen(event);
    }


    private drawBackground(canvas : Canvas) : void {

        let bmp = this.assets.getBitmap("background");
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


    private updateGame(event : CoreEvent) : void {

        const BACKGROUND_SPEED = 0.025;

        if (this.pauseMenu.isActive()) {

            this.pauseMenu.update(this.assets, event);
            return;
        }
        else if (this.stage.canBeInterrupted() &&
            event.keyboard.getActionState("pause") == KeyState.Pressed) {

            event.audio.playSample(this.assets.getSample("pause"), 0.60);
            this.pauseMenu.activate(0);
            return;
        }

        if (this.stage.update(event, this.assets)) {

            this.transition.activate(true, TransitionType.Circle, 1.0/30.0,
            () => {

                this.stage.nextStage(LEVEL_DATA[this.stageIndex ++]);
            });
        }
        
        this.backgroundTimer = (this.backgroundTimer + BACKGROUND_SPEED*event.step) % (Math.PI*2);
    }


    private drawGame(canvas : Canvas) : void {
        
        this.drawBackground(canvas);
        this.stage.draw(canvas, this.assets);

        this.transition.draw(canvas);

        if (this.pauseMenu.isActive()) {

            canvas.setFillColor(0, 0, 0, 0.33)
                  .fillRect();
            this.pauseMenu.draw(canvas, this.assets);
        }
    }


    public update(event : CoreEvent) : void {

        if (!this.assets.hasLoaded()) return;

        if (this.transition.isActive()) {

            this.transition.update(event);
            return;
        }

        switch (this.scene) {

        case Scene.TitleScreen:

            if (!this.transition.isActive())
                this.titleScreen.update(this.assets, event);
            break;

        case Scene.Game:
            this.updateGame(event);
            break;

        default:
            break;
        }

    }


    public redraw(canvas : Canvas) : void {

        if (!this.assets.hasLoaded()) {

            canvas.clear(0);
            return;
        }

        switch (this.scene) {

        case Scene.TitleScreen:
            this.titleScreen.draw(canvas, this.assets);
            break;

        case Scene.Game:
            this.drawGame(canvas);
            break;

        default:
            break;
        }
    }

}
