.PHONY: test build

FIX_IMPORTS=sed -i -E "s/\(import[^]*from[^]*?\)\.ts/\1/"
FIX_IMPORTS=Deno.writeTextFileSync(f, Deno.readTextFileSync(f).replace(/((?:export|import)(?:\n|.)*?from(?:\n|.)*?)\.ts/g, "$$1"));

build:
	cp *.ts ./dist/
	deno eval 'let f="./dist/mod.ts";$(FIX_IMPORTS)'
	deno eval 'let f="./dist/control.ts";$(FIX_IMPORTS)'
	deno eval 'let f="./dist/charwise.ts";$(FIX_IMPORTS)'
	tsc -p .
	# bash -c "( GLOBIGNORE='./dist/*.d.ts'; rm ./dist/*.ts )"

test:
	deno test ./test
