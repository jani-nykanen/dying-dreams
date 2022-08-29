import { Canvas } from "./canvas.js";
import { CoreEvent, Scene } from "./core.js";
import { Menu, MenuButton } from "./menu.js";


const TEXT = `Would you like to\nenable audio?\nYou can change\nthis later.`;


export class StartScreen implements Scene {


    private menu : Menu;


    constructor() {

        this.menu = new Menu(
            [
                new MenuButton("Yes", (event : CoreEvent) => {

                    event.audio.toggle(true);
                    this.goToStartIntro(event);
                }),

                new MenuButton("No", (event : CoreEvent) => {

                    event.audio.toggle(false);
                    this.goToStartIntro(event);
                })
            ], true);
    } 


    private goToStartIntro(event : CoreEvent) : void {

        event.changeScene("intro");
    }


    public init(param: any, event: CoreEvent): void { }


    public update(event: CoreEvent): void {

        this.menu.update(event);
    }


    public redraw(canvas: Canvas) : void {
        
        canvas.clear(0, 85, 170);

        let font = canvas.getBitmap("font");

        canvas.setFillColor(0, 0, 0, 0.33)
            .fillRect(6, 16, canvas.width-12, 64)
            .drawText(font, TEXT, 4, 16, -14, -10);

        this.menu.draw(canvas, 0, 40, -15, 12, 0.33);
    }
}
