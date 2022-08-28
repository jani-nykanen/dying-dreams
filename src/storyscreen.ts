import { Canvas } from "./canvas";
import { CoreEvent, Scene } from "./core";
import { TransitionType } from "./transition";



const STORY = [
    [
        "You are having\nthe same\ndream again.",
        "The dream where\neveryone must\ndie."
    ],
    [
        "You wake up.",
        "Everyone around you\nis dead.",
        "Everyone you ever\ncared about.",
        "Did you kill them,\nor were they\nkilled by your\ndream?",
        "That you will\nnever know."
    ]
];


const isWhitespace = (c : string) : boolean => ["\n", " ", "\t"].includes(c);


export class StoryScreen implements Scene {


    private textIndex = 0;
    private charIndex = 0;
    private charTimer = 0;
    private ready : boolean = false;
    private rectTimer : number = 0;

    private phase : 0 | 1 = 0;


    constructor() {}


    public init(param: any, event: CoreEvent) : void {

        this.textIndex = 0;
        this.charIndex = 0;
        this.charTimer = 0;

        this.ready = false;

        this.phase = Number(param) as (0 | 1);
    }


    public update(event: CoreEvent) : void {

        const RECT_SPEED = 0.15;
        const CHAR_TIME = 4;

        if (event.transition.isActive()) return;

        this.rectTimer = (this.rectTimer + RECT_SPEED*event.step) % (Math.PI*2);

        this.ready = this.charIndex >= STORY[this.phase][this.textIndex].length;
        if (!this.ready) {

            if (event.keyboard.isAnyPressed()) {

                this.charIndex = STORY[this.phase][this.textIndex].length;
                this.ready = true;
            }
            else if ((this.charTimer += event.step) >= CHAR_TIME ||
                isWhitespace(STORY[this.phase][this.textIndex]) ) {

                ++ this.charIndex;
                this.charTimer = 0;
            }
        }
        else {

            if (event.keyboard.isAnyPressed()) {

                if (++ this.textIndex == STORY[this.phase].length) {

                    event.changeScene("game", 1);
                    event.transition.activate(false, TransitionType.Circle, 1.0/30.0, () => {});
                }
                else {

                    this.charIndex = 0;
                    this.charTimer = 0;
                }
                event.audio.playSample(event.assets.getSample("choose"), 0.60);
            }
        }
    }


    public redraw(canvas: Canvas) : void {
     
        // TODO: Way too many numeric constants here, make this cleaner
        // (i.e compute actual text location. If size permits...)

        const XOFF = -15;
        const POS_Y = 40;

        let font = canvas.getBitmap("font");

        canvas.clear(0);

        if ((this.textIndex > 0 || this.charIndex > 0) &&
            this.textIndex < STORY[this.phase].length) {

            // TODO: Compute location
            canvas.drawText(font, 
                STORY[this.phase][this.textIndex].substring(0, this.charIndex),
                8, POS_Y, XOFF, -8);
        }

        let rectY = Math.round(Math.sin(this.rectTimer)) * 2;
        if (this.ready) {

            canvas.setFillColor(255)
                  .fillRect(128, 84 + rectY, 6, 6);
        }
    }
}