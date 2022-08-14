import { generateFreeStyleBitmap } from "./bitmapgen.js";
import { Bitmap, Canvas } from "./canvas.js";


export const createBackgroundBackLayer = (width : number, height : number) : Bitmap => {

    return generateFreeStyleBitmap(width, height, (canvas : Canvas) => {

        const MOON_XOFF = -40;
        const MOON_YOFF = 28;

        canvas.clear(170, 85, 255)
              .setFillColor(255, 170, 85)  
              .fillEllipse(width + MOON_XOFF, MOON_YOFF, 32, 32)
              .setFillColor(255, 255, 170)  
              .fillEllipse(width + MOON_XOFF - 2, MOON_YOFF - 2, 30, 30)
              .setFillColor(170, 85, 255)
              .fillEllipse(width + MOON_XOFF - 8, MOON_YOFF - 8, 28, 28);

    });
}


export const createBackgroundMiddleLayer = (width : number, height : number) : Bitmap => {

    const HFACTOR = 16;
    const CURVE = (t : number) => {

        let s = t / width;
        return HFACTOR - Math.round( (Math.abs(Math.cos(s * Math.PI * 6)) - 6*(Math.abs( (s % 0.5) - 0.25)))  * HFACTOR);
    }

    return generateFreeStyleBitmap(width, height, (canvas : Canvas) => {

        const SHIFTX = 8;

        let y = 0;

        canvas.setFillColor(85, 0, 170);
        for (let x = 0; x < width; ++ x) {

            y = CURVE(x + SHIFTX);
            canvas.fillRect(x, y, 1, height-y + 1);
        }
    });
}