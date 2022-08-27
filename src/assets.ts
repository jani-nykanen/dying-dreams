import { Bitmap } from "./canvas.js";
import { CoreEvent } from "./core.js";
import { createBackgroundBitmap } from "./background.js";
import { generateFont, generateRGB222LookupTable, loadBitmapRGB222 } from "./bitmapgen.js";
import { PALETTE1 } from "./palettedata.js";
import { Ramp, Sample } from "./sample.js";


export class Assets {


    private bitmaps : Map<string, Bitmap>;
    private samples : Map<string, Sample>;

    private loaded : boolean = false;


    constructor(event : CoreEvent) {

        this.bitmaps = new Map<string, Bitmap> ();
        this.samples = new Map<string, Sample> ();

        this.constructBitmaps();
        this.constructSamples(event);
    }


    private constructBitmaps() : void {

        let lookup = generateRGB222LookupTable();

        this.bitmaps.set("base", loadBitmapRGB222("b.png", lookup, PALETTE1, () => {

            this.loaded = true;
        }));

        this.bitmaps.set("background", createBackgroundBitmap(160, 160, 8));
        this.bitmaps.set("font", generateFont("12px Arial", 24, 24, 2, 8, 127));
        this.bitmaps.set("fontYellow", generateFont("12px Arial", 24, 24, 2, 8, 127, [255, 255, 0]));
        this.bitmaps.set("fontBig", generateFont("bold 24px Arial", 32, 32, 2, 8, 127, [170, 255, 0], true));
    }


    private constructSamples(event : CoreEvent) : void {

        this.samples.set("die",
            event.audio.createSample(
                [[192, 4], [144, 8], [128, 12]],
                0.70, "square", Ramp.Exponential, 0.20
            ));
        this.samples.set("climb",
            event.audio.createSample(
                [[160, 4]],
                0.70, "square", Ramp.Instant));
        this.samples.set("toggle1",
            event.audio.createSample(
                [[160, 4], [192, 12]],
                0.70, "square", Ramp.Instant, 0.35));
        this.samples.set("toggle2",
            event.audio.createSample(
                [[192, 4], [160, 12]],
                0.70, "square", Ramp.Instant, 0.35));       
        this.samples.set("rumble",
            event.audio.createSample(
                [[224, 4], [160, 4], [192, 4], [160, 4],  [128, 12]],
                0.80, "sawtooth", Ramp.Linear, 0.20
            ));  
        this.samples.set("boulder",
            event.audio.createSample(
                [[144, 8]],
                1.0, "triangle", Ramp.Exponential, 0.20
            ));    
        this.samples.set("victory",
            event.audio.createSample(
                [[128, 12], [144, 12], [160, 12], [176, 12], [192, 12], [208, 60]],
                0.60, "sawtooth", Ramp.Instant, 0.10
            ));

        this.samples.set("choose",
            event.audio.createSample(
                [[160, 6]],
                0.70, "square", Ramp.Instant));
        this.samples.set("select",
            event.audio.createSample(
                [[192, 10]],
                0.70, "square", Ramp.Instant, 0.30));
        this.samples.set("pause",
            event.audio.createSample(
                [[128, 4], [144, 6]],
                0.70, "square", Ramp.Exponential));    
    }


    public hasLoaded = () : boolean => this.loaded;


    public getBitmap(name : string) : Bitmap | undefined {

        return this.bitmaps.get(name);
    }


    public getSample(name : string) : Sample | undefined {

        return this.samples.get(name);
    }
}
