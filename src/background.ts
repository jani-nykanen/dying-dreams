import { generateFreeStyleBitmap } from "./bitmapgen.js";
import { Bitmap, Canvas } from "./canvas.js";


export const createBackgroundBitmap = (width : number, height : number) : Bitmap => {

    return generateFreeStyleBitmap(width, height, (canvas : Canvas) => {

        const MOON_XOFF = -32;
        const MOON_YOFF = 32;
        const MOON_DIAM = 44;

        const MOUNTAINS_HFACTOR = 16;
        const MOUNTAINS_SHIFTX = 8;
        const MOUNTAIN_CURVE = (t : number) => {

            let s = t / width;
            return 1.0 - (Math.abs(Math.cos(s * Math.PI * 6)) - 6*(Math.abs( (s % 0.5) - 0.25)));
        }
        const MOUNTAIN_YOFF = 72;

        // Moon
        canvas.clear(170, 85, 255)
              .setFillColor(255, 170, 85)  
              .fillEllipse(width + MOON_XOFF, MOON_YOFF, MOON_DIAM, MOON_DIAM)
              .setFillColor(255, 255, 170)  
              .fillEllipse(width + MOON_XOFF - 2, MOON_YOFF - 2, MOON_DIAM-2, MOON_DIAM-2)
              .setFillColor(170, 85, 255)
              .fillEllipse(width + MOON_XOFF - 10, MOON_YOFF - 10, MOON_DIAM-4, MOON_DIAM-4);

        // Forest/mountains/"shapes"
        let y : number;;
        canvas.setFillColor(85, 0, 170);
        for (let x = 0; x < width; ++ x) {

            y = height - MOUNTAIN_YOFF + Math.round(MOUNTAIN_CURVE(x + MOUNTAINS_SHIFTX) * MOUNTAINS_HFACTOR);
            canvas.fillRect(x, y, 1, height-y + 1);
        }
    });
}
