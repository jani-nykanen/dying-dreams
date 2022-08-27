import { Assets } from "./assets.js";
import { Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { Menu, MenuButton } from "./menu.js";


export class TitleScreen {


    private startMenu : Menu


    constructor(event : CoreEvent) {

        this.startMenu = new Menu(
            [
                new MenuButton("New Game", () => {}),
                new MenuButton("Continue", () => {}),
                new MenuButton(event.audio.getStateString(), (event : CoreEvent) => {

                    event.audio.toggle();
                    this.startMenu.changeButtonText(2, event.audio.getStateString());
                })
            ], true);
    }


    public update(assets : Assets, event : CoreEvent) : void {

        this.startMenu.update(assets, event);
    }


    public draw(canvas : Canvas, assets : Assets) : void {

        canvas.drawBitmap(assets.getBitmap("background"), -8);

        this.startMenu.draw(canvas, assets, 0, 40);
    }

}
