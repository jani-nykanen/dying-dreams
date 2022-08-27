import { Assets } from "./assets.js";
import { generateFreeStyleBitmap } from "./bitmapgen.js";
import { Bitmap, Canvas } from "./canvas.js";


const SMALL_STARS = [
    [8, 16], [68, 28], [84, 8],
    [16, 56], [56, 72], [112, 16],
    [32, 6]
];
const BIG_STARS = [
    [84, 56], [42, 36], [136, 72]
];



const putStart = (canvas : Canvas, x : number, y : number, radius = 1) : void => {

    const COLOR1 = [255];
    const COLOR2 = [255, 170, 255];

    let dx : number;
    let w : number;

    // Note: this does not really work for radius > 2...
    for (let dy = y - radius; dy <= y + radius; ++ dy) {

        w = radius - Math.abs(dy - y); 
        dx = x - Math.ceil(w/2);

        // Temporal fix
        if (radius > 1 && dy == y)
            dx -= 1;

        canvas.setFillColor(...COLOR2)
              .fillRect(dx, dy, w*2 + 1, 1);

        if (w > 0) {

            canvas.setFillColor(...COLOR1)
                  .fillRect(dx+1, dy, w*2 - 1, 1);
        }
    }
}



export const createBackgroundBitmap = (assets : Assets, width : number, height : number, yoff = 0) : Bitmap => {

    return generateFreeStyleBitmap(assets, width, height, (canvas : Canvas) => {

        const MOON_XOFF = -32;
        const MOON_YOFF = 32;
        const MOON_DIAM = 44;

        const MOUNTAINS_HFACTOR = 12;
        const MOUNTAINS_SHIFTX = 0;
        const MOUNTAIN_CURVE = (t : number) => {

            let s = t / width;
            return 1.0 - (Math.abs(Math.cos(s * Math.PI * 6)) - 8*(Math.abs( (s % 0.40) - 0.20)));
        }
        const MOUNTAIN_YOFF = 68;

        // Moon
        canvas.clear(170, 85, 255)
              .setFillColor(255, 170, 85)  
              .fillEllipse(width + MOON_XOFF, yoff + MOON_YOFF, MOON_DIAM, MOON_DIAM)
              .setFillColor(255, 255, 170)  
              .fillEllipse(width + MOON_XOFF - 2, yoff + MOON_YOFF - 2, MOON_DIAM-2, MOON_DIAM-2)
              .setFillColor(170, 85, 255)
              .fillEllipse(width + MOON_XOFF - 10, yoff + MOON_YOFF - 10, MOON_DIAM-4, MOON_DIAM-4);

        // Forest/mountains/"shapes"
        let y : number;;
        canvas.setFillColor(85, 0, 170);
        for (let x = 0; x < width; ++ x) {

            y = height - MOUNTAIN_YOFF + 
                Math.round(
                    MOUNTAIN_CURVE(x + MOUNTAINS_SHIFTX) * MOUNTAINS_HFACTOR
                );
            canvas.fillRect(x, -yoff + y, 1, height-y + 1);
        }

        // Stars
        for (let s of SMALL_STARS) {

            putStart(canvas, s[0], yoff + s[1], 1);
        }
        for (let s of BIG_STARS) {

            putStart(canvas, s[0], yoff + s[1], 2);
        }
    });
}
