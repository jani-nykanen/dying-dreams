## Dying Dreams

...is a puzzle game made for [js13k competition](https://js13kgames.com/) (2022). 


------


## Compiling

Tools you need:
- TypeScript (**mandatory**)
- [Closure compiler](https://developers.google.com/closure/compiler) (*optional*)
- advzip (*optional*)
- python3 (*optinal*, for converting .tmx tilemaps to the proper format)
- [git lfs](https://git-lfs.github.com/) (large file support), otherwise you probably cannot clone .png files properly?
- Some tool to interact with `makefile`s.

To build the project, run `make js_full`. If you are making changes to the code, then you can run `make js` to compile the project in watch mode. To build and minify the project, run `make minify`. To build, minify and create a compressed zip file that should be under 13kB, run `make pack`.

The command `make levels` will convert the levels to the source code format.


-------


## License

I... don't know. Do not steal if you really don't have to? Not for commercial use, that's for sure.


------


(c) 2022 Jani Nykänen
