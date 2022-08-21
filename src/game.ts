import { Assets } from "./assets.js";
import { Canvas } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { LEVEL_DATA } from "./leveldata.js";
import { Stage } from "./stage.js";


export class Game {


    private stage : Stage;
    private stageIndex = 1;
    
    private assets : Assets;

    private backgroundTimer : number = 0.0;


    constructor(event : CoreEvent) {

        this.assets = new Assets(event);

        this.stage = new Stage(LEVEL_DATA[this.stageIndex-1]);
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


    public update(event : CoreEvent) : void {

        const BACKGROUND_SPEED = 0.025;

        if (!this.assets.hasLoaded()) return;

        if (this.stage.update(event)) {

            this.stage.nextStage(LEVEL_DATA[this.stageIndex ++]);
        }
        
        this.backgroundTimer = (this.backgroundTimer + BACKGROUND_SPEED*event.step) % (Math.PI*2);
    }


    public redraw(canvas : Canvas) : void {

        if (!this.assets.hasLoaded()) {

            canvas.clear(0);
            return;
        }

        this.drawBackground(canvas);
        this.stage.draw(canvas, this.assets);

        // canvas.drawText(this.bmpFontSmall, "Alpha 0.0.1",  -6, -4, -17, 0, TextAlign.Left);;
    }

}
