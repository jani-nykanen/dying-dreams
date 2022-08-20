import { Bitmap, Canvas, Flip } from "./canvas.js";
import { Direction, PuzzleState } from "./puzzlestate";


//
// TODO: Merge with stage once finished to save
// some bytes
//


const drawHuman = (canvas : Canvas, bmp : Bitmap, 
    x : number, y : number,
    dx : number, dy : number, 
    direction : Direction, state : PuzzleState, animTimer : number,
    moveData : Array<Direction>) : void => {

    const LEG_X = [0, 16, 16, 32, 32, 48];
    const LEG_Y = [8, 0, 8, 0, 8, 0];

    let frame = 0;
    let climbing = false;

    let horizontal = direction == Direction.Left || direction == Direction.Right;

    // Check if climbing
    if (!horizontal &&
        (state.getTile(0, x, y) == 2 &&
        (state.getTile(0, x, y+1) != 1 || direction == Direction.Down)) ||
        (direction == Direction.Up && state.getTile(0, x, y+1) == 2)) {

        climbing = true;
        frame = 0;
        if (direction != Direction.None) {

            frame += Math.floor(animTimer * 2);
        }
    }
    // Or falling
    else if (direction == Direction.Down && 
        state.getTile(0, x, y) != 2 && 
        state.getTile(1, x, y+1) != 4) {

        frame = 5;
    }
    // Or not being carried, so can be animated
    else if (direction != Direction.None && 
        (state.getTile(1, x, y+1) != 4 || 
        (y < state.height-1 && moveData[(y+1) * state.width + x] == Direction.None))) {

        frame = 1 + Math.floor(4 * animTimer);
    }

    let sy = 16;
    if (state.getTile(1, x, y-1) == 4)
                sy = 32;

    if (climbing) {

        canvas.drawBitmapRegion(bmp, 64, 16, 16, 16, dx, dy+1,
            frame == 0 ? Flip.None : Flip.Horizontal);
        return;
    }

    canvas.drawBitmapRegion(bmp, 0, sy, 16, 8, dx, dy + 1, state.getFlip())
          .drawBitmapRegion(bmp, LEG_X[frame], sy + LEG_Y[frame], 16, 8, 
                            dx, dy + 9, state.getFlip()); 
}


export const animate = (state : PuzzleState, 
    moveData : Array<Direction>, animTimer : number,
    canvas : Canvas, bmp : Bitmap) : void => {

    const DX = [0, 1, 0, -1, 0];
    const DY = [0, 0, -1, 0, 1];

    let dx = 0;
    let dy = 0;
    let direction : Direction;

    state.iterate(1, (x : number, y : number, value : number) => {

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
            drawHuman(canvas, bmp, x, y, dx, dy, direction, state, animTimer, moveData);
            break;

        // Boulder
        case 10:

            canvas.drawBitmapRegion(bmp, 80, 16, 16, 16, dx, dy+1);
            break;

        default:
            break;
        }
    });
}
