import { Bitmap } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { createBackgroundBitmap } from "./background.js";
import { generateFont, generateRGB222LookupTable, loadBitmapRGB222 } from "./bitmapgen.js";
import { PALETTE1 } from "./palettedata.js";


export class Assets {

    private bitmaps : Map<string, Bitmap>;

    private loaded : boolean = false;


    constructor(event : CoreEvent) {

        let lookup = generateRGB222LookupTable();

        this.bitmaps = new Map<string, Bitmap> ();

        this.bitmaps.set("base", loadBitmapRGB222("b.png", lookup, PALETTE1, () => {

            this.loaded = true;
        }));

        this.bitmaps.set("background", createBackgroundBitmap(160, 160, 8));
        this.bitmaps.set("font", generateFont("12px Arial", 24, 24, 2, 8, 127));
        this.bitmaps.set("fontBig", generateFont("bold 24px Arial", 32, 32, 2, 8, 127, [170, 255, 0], true));
    }


    public hasLoaded = () : boolean => this.loaded;


    public getBitmap(name : string) : Bitmap | undefined {

        return this.bitmaps.get(name);
    }
}
