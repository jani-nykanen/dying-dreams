import { Bitmap, Canvas } from "./canvas.js";
import { Direction, PuzzleState } from "./stage.js";



export const animate = (state : PuzzleState, 
    moveData : Array<Direction>, animTimer : number,
    canvas : Canvas, bmp : Bitmap) : void => {

    const DX = [0, 1, 0, -1, 0];
    const DY = [0, 0, -1, 0, 1];

    let sy = 0;
    let dx = 0;
    let dy = 0;
    let direction : Direction;

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


                

            sy = 0;
            if (state.getTile(x, y-1) == 4)
                sy = 16;

            canvas.drawBitmapRegion(bmp, 0, 16 + sy, 16, 16, dx, dy + 1);
            break;

        default:
            break;
        }
    });
}
