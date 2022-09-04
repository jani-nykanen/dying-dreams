## Dying Dreams

...is a puzzle game made for [js13k competition](https://js13kgames.com/) (2022). 


------


## Compiling

Tools you need:
- TypeScript (**mandatory**)
- [Closure compiler](https://developers.google.com/closure/compiler) (*optional*)
- advzip (*optional*)
- Some tool to interact with `makefile`s.
- python3 (*optional*, for converting .tmx tilemaps to the proper format)
- (Possibly required: [git lfs](https://git-lfs.github.com/) (large file support), otherwise you probably cannot clone .png files properly?)

To build the project, run `make js_full`. If you are making changes to the code, then you can run `make js` to compile the project in watch mode. To build and minify the project, run `make minify`. To build, minify and create a compressed zip file that should be under 13kB, run `make pack`.

The command `make levels` will convert the levels to the source code format.


-------


## License

Since I couldn't find a suitable license for this project, let me introduce you "Dying Dreams js13k license":

### Things you can do:
- Use the code or the assets in your own projects, as long as your project is open-source and you remember attribute the original author
- Modify this project and share the modified version, as long as the modified code is open source and you give credit to the original author


### Things you may **not** do:
- Use parts of this project in a commercial product
- Use parts of this project in a closed-source project
- Use parts of this project without attributing the original author


------


(c) 2022 Jani Nykänen
