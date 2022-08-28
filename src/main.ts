import { Core, CoreEvent } from "./core.js"
import { Game } from "./game.js";
import { TitleScreen } from "./titlescreen.js";


window.onload = () => (new Core(160, 144))
        .addScene("game", new Game())
        .addScene("titlescreen", new TitleScreen())
        .run("titlescreen", (event : CoreEvent) => {

            // TODO: Construct here!
            event.assets.construct(event);

            event.keyboard
                .addAction("right", "ArrowRight", "KeyD")
                .addAction("up", "ArrowUp", "KeyW")
                .addAction("left", "ArrowLeft", "KeyA")
                .addAction("down", "ArrowDown", "KeyS")
                .addAction("undo", "Backspace", "KeyZ")
                .addAction("restart", "KeyR")
                .addAction("start", "Enter")
                .addAction("pause", "Enter")
                .addAction("select", "Space");  
            event.audio.setGlobalVolume(0.50);
        });
