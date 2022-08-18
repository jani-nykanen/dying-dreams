

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



export class RGBA {

    public r : number;
    public g : number;
    public b : number;
    public a : number;


    constructor(r = 255, g = r, b = g, a = 1.0) {

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }


    public clone = () : RGBA => new RGBA(this.r, this.g, this.b, this.a);
}
