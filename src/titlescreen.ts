import { Canvas } from "./canvas.js";
import { CoreEvent, Scene } from "./core.js";
import { Menu, MenuButton } from "./menu.js";


export class TitleScreen implements Scene {


    private startMenu : Menu


    constructor() {

        this.startMenu = new Menu(
            [
                new MenuButton("New Game", () => {}),
                new MenuButton("Continue", () => {}),
                new MenuButton("Audio: Off", (event : CoreEvent) => {

                    event.audio.toggle();
                    this.startMenu.changeButtonText(2, event.audio.getStateString());
                })
            ], true);
    }


    public init(param : any, event : CoreEvent) : void {

        this.startMenu.activate(0);
        this.startMenu.changeButtonText(2, event.audio.getStateString());
    }


    public update(event : CoreEvent) : void {

        this.startMenu.update(event);
    }


    public redraw(canvas : Canvas) : void {

        canvas.drawBitmap(canvas.assets.getBitmap("background"), -8);
        this.startMenu.draw(canvas, 0, 40);
    }


    public onChange() : any {

        return null;
    }

}
