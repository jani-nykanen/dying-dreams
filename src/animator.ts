import { Bitmap, Canvas } from "./canvas.js";
import { Direction, PuzzleState } from "./stage.js";



export const animate = (state : PuzzleState, moveData : Array<Direction>, canvas : Canvas, bmp : Bitmap) : void => {

    state.iterate((x : number, y : number, value : number) => {

        let sy = 0;

        switch (value) {

        // Human
        case 4:

            sy = 0;
            if (state.getTile(x, y-1) == 4)
                sy = 16;

            canvas.drawBitmapRegion(bmp, 0, 16 + sy, 16, 16, x*16, y*16 +1);
            break;

        default:
            break;
        }
    });
}
