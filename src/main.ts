import { Canvas } from "./canvas.js";
import { Core, CoreEvent } from "./core.js"
import { Game } from "./game.js";


window.onload = () => {

    let game : Game;

    (new Core(160, 144)).run((event : CoreEvent) => {

        event.keyboard
            .addAction("right", "ArrowRight", "KeyD")
            .addAction("up", "ArrowUp", "KeyW")
            .addAction("left", "ArrowLeft", "KeyA")
            .addAction("down", "ArrowDown", "KeyS")
            .addAction("fire1", "KeyZ")
            .addAction("fire2", "KeyX")
            .addAction("start", "Enter")
            .addAction("select", "Space");
            
        event.audio.setGlobalVolume(0.50);

        game = new Game(event);

    }, (event : CoreEvent) => game.update(event), 
       (canvas : Canvas) => game.redraw(canvas));
}
