import { clamp } from "./math.js";


export const enum Ramp {

    Instant = 0,
    Linear = 1,
    Exponential = 2
};


export class Sample {


    private readonly ctx : AudioContext;
    private readonly gain : GainNode;

    private oscillator : OscillatorNode | null = null;
    private baseSequence : number[][];
    private baseVolume : number;
    private type : OscillatorType;
    private ramp : Ramp;
    private fadeVolumeFactor : number;


    constructor(ctx : AudioContext, sequence : number[][], 
        baseVolume = 1.0, type : OscillatorType = "square",
        ramp = Ramp.Exponential, fadeVolumeFactor = 0.5) {

        this.ctx = ctx;
        this.gain = ctx.createGain();

        this.baseSequence = sequence.map(s => Array.from(s));
        this.baseVolume = baseVolume;
        this.type = type;
        this.ramp = ramp;
        this.fadeVolumeFactor = fadeVolumeFactor;
    }


    public stop() : void {

        if (this.oscillator == null) return;

        this.oscillator.stop(0);
        this.oscillator.disconnect();
        this.oscillator = null;
    }


    public play(volume : number) : void {

        this.stop();

        let time = this.ctx.currentTime;
        let timer = 0.0;

        this.oscillator = this.ctx.createOscillator();
        this.oscillator.type = this.type;

        volume *= this.baseVolume;

        this.oscillator.frequency.setValueAtTime(this.baseSequence[0][0], time);
        this.gain.gain.setValueAtTime(clamp(volume, 0.01, 1.0), time);

        timer = 0;
        for (let s of this.baseSequence ) {

            switch (this.ramp) {
            
            case Ramp.Instant:
                this.oscillator.frequency.setValueAtTime(s[0], time + timer);
                break;

            case Ramp.Linear:
                this.oscillator.frequency.linearRampToValueAtTime(s[0], time + timer);
                break;

            case Ramp.Exponential:
                this.oscillator.frequency.exponentialRampToValueAtTime(s[0], time + timer);
                break;

            default:
                break;
            }
            timer += 1.0/60.0 * s[1];
        }
        this.gain.gain.exponentialRampToValueAtTime(volume * this.fadeVolumeFactor, time + timer);

        this.oscillator.connect(this.gain).connect(this.ctx.destination);
        this.oscillator.start(time);
        this.oscillator.stop(time + timer);
    }
}
