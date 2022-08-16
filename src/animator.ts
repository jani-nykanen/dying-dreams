import { Bitmap, Canvas } from "./canvas.js";
import { Direction, PuzzleState } from "./stage.js";



export const animate = (state : PuzzleState, moveData : Array<Direction>, canvas : Canvas, bmp : Bitmap) : void => {

    state.iterate((x : number, y : number, value : number) => {

        switch (value) {

        // Gopher
        case 4:
            canvas.drawBitmapRegion(bmp, 0, 16, 16, 16, x*16, y*16);
            break;

        default:
            break;
        }
    });
}
