import { Bitmap, Canvas, Flip } from "./canvas.js";
import { Direction, PuzzleState, Stage } from "./stage.js";



// TODO: Split to pieces
export const animate = (state : PuzzleState, 
    moveData : Array<Direction>, animTimer : number,
    canvas : Canvas, bmp : Bitmap) : void => {

    const DX = [0, 1, 0, -1, 0];
    const DY = [0, 0, -1, 0, 1];

    const LEG_X = [0, 16, 16, 32, 32, 64, 0, 0];
    const LEG_Y = [8, 0, 8, 0, 8, 0, 8, 8];

    let sy = 0;
    let dx = 0;
    let dy = 0;
    let direction : Direction;
    let frame : number;

    state.iterate((x : number, y : number, value : number) => {

        direction = moveData[y * state.width + x];

        dx = x*16;
        dy = y*16;

        if (direction != Direction.None) {

            dx -= DX[Number(direction)] * (1.0 - animTimer) * 16;
            dy -= DY[Number(direction)] * (1.0 - animTimer) * 16;
        }
        
        switch (value) {

        // Human
        case 4:

            frame = 0;
            if (direction != Direction.None && 
                (state.getTile(x, y+1) != 4 || 
                (y < state.height-1 && moveData[(y+1) * state.width + x] == Direction.None))) {

                frame = 1 + Math.floor(4 * animTimer);
            }

            sy = 16;
            if (state.getTile(x, y-1) == 4)
                sy = 32;

            canvas.drawBitmapRegion(bmp, 0, sy, 16, 8, dx, dy + 1, state.getFlip())
                  .drawBitmapRegion(bmp, LEG_X[frame], sy + LEG_Y[frame], 16, 8, 
                                    dx, dy + 9, state.getFlip());  

            break;

        default:
            break;
        }
    });
}
