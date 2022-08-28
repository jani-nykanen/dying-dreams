import { Flip } from "./canvas.js";


export const enum Direction {

    None = 0,
    Right = 1,
    Up = 2,
    Left = 3,
    Down = 4
};


export class PuzzleState {

    private layers : Array<Array<number>>;
    private flip : Flip;
    private toggleWallsState : boolean;

    private readonly width : number;
    private readonly height : number;


    constructor(staticLayer : Array<number>, dynamicLayer : Array<number>,
        width : number, height : number, flip : Flip,
        toggleWallsState = true) {

        this.layers = new Array<Array<number>> (2);

        this.layers[0] = Array.from(staticLayer);
        this.layers[1] = Array.from(dynamicLayer);

        this.flip = flip;
        this.toggleWallsState = toggleWallsState;

        this.width = width;
        this.height = height;
    }


    public getTile(layer : 0 | 1, x : number, y : number, def = 1) : number {

        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return def;

        return this.layers[layer][y*this.width + x];
    }


    public getIndexedTile(layer : 0 | 1, i : number, def = 1) : number {

        if (i < 0 || i >= this.width*this.height)
            return def;

        return this.layers[layer][i];
    }


    public setTile(layer : 0 | 1, x : number, y : number, v : number) : void {
        
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return;

        this.layers[layer][y*this.width + x] = v;
    }


    public setIndexedTile(layer : 0 | 1, i : number, v : number) : void {

        if (i < 0 || i >= this.width*this.height)
            return;

        this.layers[layer][i] = v;
    }


    public setFlip(flip : Flip) : void {

        this.flip = flip;
    }
    public getFlip = () : Flip => this.flip;


    public setToggleableWallState(state : boolean) : void {

        this.toggleWallsState = state;
    }
    public getToggleableWallState = () : boolean => this.toggleWallsState;


    public iterate(layer : number, cb : (x : number, y : number, value : number) => void) : void {

        let i = 0;
        for (let dy = 0; dy < this.height; ++ dy) {

            for (let dx = 0; dx < this.width; ++ dx) {

                cb(dx, dy, this.layers[layer][i ++]);
            }
        }
    }


    public clone = () : PuzzleState => new PuzzleState(
        this.layers[0], this.layers[1], 
        this.width, this.height, this.flip,
        this.toggleWallsState);
}
