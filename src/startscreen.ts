import { Canvas } from "./canvas.js";
import { CoreEvent, Scene } from "./core.js";
import { Menu, MenuButton } from "./menu.js";


const TEXT = `WOULD YOU LIKE TO\nENABLE AUDIO? YOU\nCAN CHANGE THIS\nLATER.`;


export class StartScreen implements Scene {


    private menu : Menu;


    constructor() {

        this.menu = new Menu(
            [
                new MenuButton("YES", (event : CoreEvent) => {

                    event.audio.toggle(true);
                    this.goToStartIntro(event);
                }),

                new MenuButton("NO", (event : CoreEvent) => {

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
        
        canvas.clear(85, 170, 255);

        let font = canvas.getBitmap("font");

        canvas.setFillColor(0, 0, 85)
            .fillRect(6+4, 16+4, canvas.width-16, 64)
            .fillRect(canvas.width/2-14, canvas.height/2 + 30, 34, 26)
            .setFillColor(0, 85, 170)
            .fillRect(6, 16, canvas.width-16, 64)
            .fillRect(canvas.width/2-18, canvas.height/2 + 26, 34, 26)
            .drawText(font, TEXT, 12, 24, 0, 2);
        
        this.menu.draw(canvas, 0, 40, false);
    }
}
