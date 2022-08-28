import { Assets } from "./assets.js";
import { clamp } from "./math.js";


export type Bitmap = HTMLImageElement | HTMLCanvasElement;


export const enum Flip {

    None = 0,
    Horizontal = 1,
    Vertical = 2,
    Both = 3
};


export const enum TextAlign {

    Left = 0,
    Center = 1,
    Right = 2
};


const createCanvasElement = (width : number, height : number, embedToDiv = true) : [HTMLCanvasElement, CanvasRenderingContext2D] => {

    let div : HTMLDivElement | null = null;
    
    if (embedToDiv) {

        div = document.createElement("div");
        div.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: -1;");
    }

    let canvas = document.createElement("canvas");
    canvas.setAttribute(
        "style", 
        "position: absolute; top: 0; left: 0; z-index: -1;" + 
        "image-rendering: optimizeSpeed;" + 
        "image-rendering: pixelated;" +
        "image-rendering: -moz-crisp-edges;");

    canvas.width = width;
    canvas.height = height;

    if (div != null) {

        div.appendChild(canvas);
        document.body.appendChild(div);
    }

    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = false;

    return [canvas, ctx];
}


export const getColorString = (r : number, g : number, b : number, a = 1.0) : string =>
    "rgba(" + 
        String(r | 0) + "," + 
        String(g | 0) + "," + 
        String(b | 0) + "," + 
        String(clamp(a, 0.0, 1.0)) + 
    ")";


export class Canvas {


    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;

    private readonly assets : Assets;


    public get width() {

        return this.canvas.width;
    }
    public get height() {

        return this.canvas.height;
    }


    constructor(width : number, height : number, isMainCanvas : boolean, assets : Assets) {

        [this.canvas, this.ctx] = createCanvasElement(width, height, isMainCanvas);

        if (isMainCanvas) {

            window.addEventListener("resize", () => this.resizeEvent(window.innerWidth, window.innerHeight));
            this.resizeEvent(window.innerWidth, window.innerHeight);
        }
        this.assets = assets;
    }   


    private resizeEvent(width : number, height : number) : void {

        let m = Math.min(width / this.width, height / this.height);
        if (m >= 1.0) {

            m = Math.floor(m);
        }

        let style = this.canvas.style;

        style.width  = String( (m*this.width) | 0) + "px";
        style.height = String( (m*this.height) | 0) + "px";

        style.left = String((width/2 - m*this.width/2) | 0) + "px";
        style.top  = String((height/2 - m*this.height/2) | 0) + "px";
    }


    public setFillColor(r = 255, g = r, b = g, a = 1.0) : Canvas {

        this.ctx.fillStyle = getColorString(r, g, b, a);
        return this;
    }


    public setAlpha(a = 1.0) : Canvas {

        this.ctx.globalAlpha = clamp(a, 0.0, 1.0);
        return this;
    }


    public fillRect(x = 0, y = 0, w = this.width, h = this.height) : Canvas {

        this.ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
        return this;
    }


    public clear = (r = 255, g = r, b = g) : Canvas => this.setFillColor(r, g, b).fillRect();


    public drawBitmapRegion(bmp : Bitmap | undefined, 
        sx : number, sy : number, sw : number, sh : number, 
        dx : number, dy : number, flip = Flip.None) : Canvas {

        if (bmp == undefined || sw <= 0 || sh <= 0) 
            return this;

        let c = this.ctx;

        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;

        dx |= 0;
        dy |= 0;

        flip = flip | Flip.None;
        
        if (flip != Flip.None) {
            c.save();
        }

        if ((flip & Flip.Horizontal) != 0) {

            c.translate(sw, 0);
            c.scale(-1, 1);
            dx *= -1;
        }
        if ((flip & Flip.Vertical) != 0) {

            c.translate(0, sh);
            c.scale(1, -1);
            dy *= -1;
        }

        c.drawImage(bmp, sx, sy, sw, sh, dx, dy, sw, sh);

        if (flip != Flip.None) {

            c.restore();
        }

        return this;
    }


    public drawBitmap(bmp : Bitmap | undefined, dx = 0.0, dy = 0.0, flip = Flip.None) : Canvas {

        if (bmp == undefined)
            return this;

        return this.drawBitmapRegion(bmp, 0, 0, bmp.width, bmp.height, dx, dy, flip);
    }


    // Note: this method does not support flipping (reason: laziness, also 
    // don't need it here)
    public drawHorizontallyWavingBitmapRegion(bmp : Bitmap | undefined, 
        sx : number, sy : number, sw : number, sh : number, 
        dx : number, dy : number,
        wave : number, period : number, amplitude : number) : Canvas {

        if (bmp == undefined)
            return this;

        sx |= 0;
        sy |= 0;
        sw |= 0;
        sh |= 0;

        dx |= 0;
        dy |= 0;    

        let w = 0.0;
        let tx : number;

        for (let y = 0; y < sh; ++ y) {

            w = wave + period * y;
            tx = dx + Math.round(Math.sin(w) * amplitude);

            this.ctx.drawImage(bmp, sx, sy + y, sw, 1, tx, dy + y, sw, 1);
        }
        return this;
    }


    public drawText(font : Bitmap | undefined, str : string, 
        dx : number, dy : number, 
        xoff = 0.0, yoff = 0.0, align = TextAlign.Left) : Canvas {

        if (font == undefined)
            return this;

        let cw = (font.width / 16) | 0;
        let ch = cw;

        let x = dx;
        let y = dy;
        let chr : number;

        if (align == TextAlign.Center) {

            dx -= (str.length * (cw + xoff)) / 2.0 ;
            x = dx;
        }
        else if (align == TextAlign.Right) {
            
            dx -= ((str.length) * (cw + xoff));
            x = dx;
        }

        for (let i = 0; i < str.length; ++ i) {

            chr = str.charCodeAt(i);
            if (chr == '\n'.charCodeAt(0)) {

                x = dx;
                y += (ch + yoff);
                continue;
            }

            this.drawBitmapRegion(
                font, 
                (chr % 16) * cw, 
                ((chr/16)|0) * ch, 
                cw, ch, 
                x, y);

            x += cw + xoff;
        }

        return this;
    }


    public fillEllipse(cx : number, cy : number, w : number, h : number) : Canvas {

        const EPS = 2.0;

        if (w < EPS || h < EPS)
            return this;

        cx |= 0;
        cy |= 0;    

        w /= 2;
        h /= 2;

        let rh = Math.round(h);
        let dw = 0;

        for (let y = cy - rh; y <= cy + rh; ++ y) {

            dw = Math.round(w * Math.sqrt(1 - ((y - cy)*(y - cy)) / (h*h)));
            this.fillRect(cx - dw, y, dw*2, 1);   
        }
        return this;
    }


    public fillCircleOutside(r : number, cx = this.width/2, cy = this.height/2) : Canvas {

        let start = Math.max(0, cy - r) | 0;
        let end = Math.min(this.height, cy + r) | 0;

        if (start > 0)
            this.fillRect(0, 0, this.width, start);
        if (end < this.height)
            this.fillRect(0, end, this.width, this.height - end);

        let dy : number;
        let px1 : number;
        let px2 : number;
        
        for (let y = start; y < end; ++ y) {

            dy = y - cy;

            if (Math.abs(dy) >= r) {

                this.fillRect(0, y, this.width, 1);
                continue;
            }

            px1 = Math.round(cx - Math.sqrt(r*r - dy*dy));
            px2 = Math.round(cx + Math.sqrt(r*r - dy*dy));
            if (px1 > 0)
                this.fillRect(0, y, px1, 1);
            if (px2 < this.width)
                this.fillRect(px2, y, this.width - px1, 1);
        }

        return this;
    }


    public fillRegularStar(cx : number, cy : number, radius : number) : Canvas {

        let leftx = Math.round(Math.sin(-Math.PI*2/3) * radius);
        let bottomy = -Math.round(Math.cos(-Math.PI*2/3) * radius);

        let x = 0;
        let stepx = bottomy / Math.abs(leftx);

        let rx : number;

        for (let y = -radius; y <= bottomy; ++ y, x += stepx) {

            rx = Math.round(x);

            this.fillRect(cx - rx, cy + y, rx*2, 1);
            this.fillRect(cx - rx, cy + radius - bottomy*2 - y,  rx*2, 1);
        }

        return this;
    }


    // Looks silly, but it is here for abstraction
    public convertToBitmap = () : Bitmap => this.canvas;


    public getBitmap = (name : string) : Bitmap | undefined => this.assets.getBitmap(name); 
}
