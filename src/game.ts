import { generateFont } from "./bitmapgen.js";
import { Bitmap, Canvas, TextAlign } from "./canvas.js";
import { CoreEvent } from "./core.js";


export class Game {

    private bmpFontSmall : Bitmap | null = null;

    private loaded = false;


    constructor(event : CoreEvent) {

        this.loaded = true;

        this.bmpFontSmall = generateFont("12px Arial", 24, 24, 2, 8, 127);
    }


    public update(event : CoreEvent) : void {

        if (!this.loaded) return;
    }


    public redraw(canvas : Canvas) : void {

        if (!this.loaded) {

            canvas.clear(0);
            return;
        }

        canvas.clear(170)
              .drawText(this.bmpFontSmall, "Alpha 0.0.1",  -6, -4, -17, 0, TextAlign.Left);
    }

}
