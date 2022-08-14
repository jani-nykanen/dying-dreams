

export class Vector2 {

    public x : number;
    public y : number;


    constructor(x = 0, y = 0) {

        this.x = x;
        this.y = y;
    }


    public scalarMultiply = (s : number) : Vector2 => new Vector2(this.x * s, this.y * s);


    static interpolate = (a : Vector2, b : Vector2, t : number) : Vector2 =>
        new Vector2(a.x * (1-t) + b.x * t, a.y * (1-t) + b.y * t);


    public clone = () : Vector2 => new Vector2(this.x, this.y);
}
