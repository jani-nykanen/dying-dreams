

export const enum KeyState {

    Up = 0,
    Down = 1,
    Released = 2,
    Pressed = 3,

    DownOrPressed = 1
};



export class Keyboard {


    private states : Map<string, KeyState>;
    private prevent : Array<string>;
    private actions : Map<string, [string, string | undefined]>;

    private anyPressed : boolean = false;


    constructor() {

        this.states = new Map<string, KeyState> ();
        this.prevent = new Array<string> ();
        this.actions = new Map<string, [string, string | undefined]> ();

        window.addEventListener("keydown", (e : any) => {

            this.keyEvent(true, e.code);
            if (this.prevent.includes(e.code))
                e.preventDefault();
            
        });
        window.addEventListener("keyup", (e : any) => {

            this.keyEvent(false, e.code);
            if (this.prevent.includes(e.code))
                e.preventDefault();
        });  


        window.addEventListener("contextmenu", (e : MouseEvent) => e.preventDefault());
        window.addEventListener("mousemove",   (_ : MouseEvent) => window.focus());
        window.addEventListener("mousedown",   (_ : MouseEvent) => window.focus());
    }


    public keyEvent(down : boolean, key : string) : void {

        if (down) {

            if (this.states.get(key) === KeyState.Down)
                return;
            this.states.set(key, KeyState.Pressed);
            this.anyPressed = true;
            return;
        }

        if (this.states.get(key) === KeyState.Up)
            return;
        this.states.set(key, KeyState.Released);
    }


    public update() : void {

        for (let k of this.states.keys()) {

            if (this.states.get(k) === KeyState.Pressed)
                this.states.set(k, KeyState.Down);
            else if (this.states.get(k) === KeyState.Released)
                this.states.set(k, KeyState.Up);
        }

        this.anyPressed = false;
    }


    public addAction(name : string, key1 : string, key2 : string | undefined = undefined) : Keyboard {

        this.actions.set(name, [key1, key2]);
        this.prevent.push(key1);
        if (key2 !== undefined) 
            this.prevent.push(key2);

        return this;
    }


    public getState(name : string) : KeyState {

        let state = this.states.get(name);
        if (state == undefined)
            return KeyState.Up;

        return state;
    }


    public getActionState(name : string) : KeyState {

        let a = this.actions.get(name);
        if (a === undefined)
            return KeyState.Up;

        let state = this.getState(a[0]);
        if (state == KeyState.Up && a[1] !== undefined) {

            return this.getState(a[1]);
        }
        return state;
    }


    public isAnyPressed = () : boolean => this.anyPressed;
    
}
