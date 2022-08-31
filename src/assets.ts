import { Bitmap } from "./canvas.js";
import { loadBitmapRGB222, RGB222LookupTable } from "./bitmapgen.js";
import { Sample } from "./sample.js";


export class Assets {


    private bitmaps : Map<string, Bitmap>;
    private samples : Map<string, Sample>;

    private loaded : number = 0;
    private loadCount : number = 0;


    constructor() {

        this.bitmaps = new Map<string, Bitmap> ();
        this.samples = new Map<string, Sample> ();
    }


    public addSample(name : string, s : Sample) : void {

        this.samples.set(name, s);
    }


    public addBitmap(name : string, b : Bitmap) : void {

        this.bitmaps.set(name, b);
    }


    public loadBitmapRGB222(name : string, path : string, lookup : RGB222LookupTable, palette : number[][]) : void {

        ++ this.loadCount;
        this.addBitmap(name, loadBitmapRGB222(path, lookup, palette, () => {

            ++ this.loaded;
        }));
    }


    public hasLoaded = () : boolean => this.loaded >= this.loadCount;


    public getBitmap(name : string) : Bitmap | undefined {

        return this.bitmaps.get(name);
    }


    public getSample(name : string) : Sample | undefined {

        return this.samples.get(name);
    }
}
