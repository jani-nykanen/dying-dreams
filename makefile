# Change this before compiling!
CLOSURE_PATH := closure/closure.jar


.PHONY: js
js:
	mkdir -p js
	tsc -w src/main.ts --module es2020 --lib es2020,dom --target es2020 --outDir js

js_full:
	mkdir -p js
	tsc src/main.ts --module es2020 --lib es2020,dom --target es2020 --outDir js

server:
	python3 -m http.server

linecount:
	(cd src; find . -name '*.ts' | xargs wc -l)

dist:
	zip -r dist.zip js
	zip -r dist.zip assets
	zip -r dist.zip index.html

all: js


minify: js_full
	mkdir -p temp
	java -jar $(CLOSURE_PATH) --js js/*.js --js_output_file temp/out.js --compilation_level ADVANCED_OPTIMIZATIONS --language_out ECMASCRIPT_2021
	cat misc/index_top.txt > temp/index.html
	cat temp/out.js >> temp/index.html
	cat misc/index_bottom.txt >> temp/index.html
	cp b.png temp/b.png
	cp f.png temp/f.png
	rm temp/out.js

pack: minify
#	test -f dist.zip && rm dist.zip
	(cd temp; zip -r ../dist.zip .)
	advzip -z dist.zip


playtest: pack
	mkdir -p play
	unzip -d play dist.zip


levels:
	./scripts/mapconv.py
