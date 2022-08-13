import { CoreEvent } from "./core.js";
import { Ramp, Sample } from "./sample.js";


export class AudioPlayer {


    private ctx : AudioContext;

    private globalVolume : number;
    private enabled : boolean;


    constructor(globalVolume = 1.0) {

        this.ctx = new AudioContext();

        this.enabled = true;
        this.globalVolume = globalVolume;
    }


    public createSample = (sequence : number[][], 
        baseVolume = 1.0,
        type : OscillatorType = "square",
        ramp : Ramp = Ramp.Exponential,
        fadeVolumeFactor : number = 0.5) : Sample => (new Sample(this.ctx, sequence, baseVolume, type, ramp, fadeVolumeFactor));


    public playSample(s : Sample, volume = 1.0) : void {

        s.play(volume * this.globalVolume);
    }


    public toggle(state : boolean) : void {

        this.enabled = state;
    }


    public setGlobalVolume(vol : number) : void {

        this.globalVolume = vol;
    }


    public isEnabled = () : boolean => this.enabled;
}
