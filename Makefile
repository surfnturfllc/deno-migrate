.PHONY: test coverage clean install run refresh-deps;

PERMISSIONS = --allow-env --allow-net

test:
	deno test

coverage:
	rm -rf .coverage
	mkdir -p .coverage
	deno test --coverage=.coverage
	deno coverage .coverage --exclude=\.mock --exclude=cli --exclude=deps

clean:
	rm ~/.deno/bin/migrate

install: clean
	deno install ${PERMISSIONS} --name migrate cli.ts

bin/migrate:
	mkdir -p bin
	deno compile ${PERMISSIONS} --output "bin/migrate" cli.ts

run:
	deno run ${PERMISSIONS} cli.ts

refresh-deps:
	deno cache --reload mod.ts
