import { generateFont, generateRGB222LookupTable, loadBitmapRGB222 } from "./bitmapgen.js";
import { Bitmap, Canvas, TextAlign } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { PALETTE1 } from "./palettedata.js";


export class Game {

    private bmpBase : Bitmap;
    private bmpFontSmall : Bitmap | null = null;

    private loaded = false;


    constructor(event : CoreEvent) {

        let lookup = generateRGB222LookupTable();

        this.loaded = false;;

        this.bmpBase = loadBitmapRGB222("b.png", lookup, PALETTE1, () => {

            this.loaded = true;
        });

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

        canvas.clear(170, 85, 255)
              .drawText(this.bmpFontSmall, "Alpha 0.0.1",  -6, -4, -17, 0, TextAlign.Left);

        canvas.drawBitmap(this.bmpBase, 64, 64);
    }

}
