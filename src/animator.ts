import { Bitmap, Canvas, Flip } from "./canvas.js";
import { Direction, PuzzleState } from "./stage.js";



const drawHuman = (canvas : Canvas, bmp : Bitmap, 
    x : number, y : number,
    dx : number, dy : number, 
    direction : Direction, state : PuzzleState, animTimer : number,
    moveData : Array<Direction>) : void => {

    const LEG_X = [0, 16, 16, 32, 32, 64, 0, 0];
    const LEG_Y = [8, 0, 8, 0, 8, 0, 8, 8];

    let frame = 0;
    let climbing = false;

    // Check if climbing
    if ((state.getStaticTile(x, y) == 2 &&
         (state.getStaticTile(x, y+1) != 1 || direction == Direction.Down)) ||
        (direction == Direction.Up && state.getStaticTile(x, y+1) == 2)) {

        climbing = true;
        frame = 0;
        if (direction != Direction.None) {

            frame += Math.floor(animTimer * 2);
        }
    }
    else if (direction != Direction.None && 
        (state.getTile(x, y+1) != 4 || 
        (y < state.height-1 && moveData[(y+1) * state.width + x] == Direction.None))) {

        frame = 1 + Math.floor(4 * animTimer);
    }

    let sy = 16;
    if (state.getTile(x, y-1) == 4)
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



// TODO: Split to pieces
export const animate = (state : PuzzleState, 
    moveData : Array<Direction>, animTimer : number,
    canvas : Canvas, bmp : Bitmap) : void => {

    const DX = [0, 1, 0, -1, 0];
    const DY = [0, 0, -1, 0, 1];

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
            drawHuman(canvas, bmp, x, y, dx, dy, direction, state, animTimer, moveData);
            break;

        default:
            break;
        }
    });
}