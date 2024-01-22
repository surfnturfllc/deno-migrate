.PHONY: test coverage install run;

test:
	deno test

coverage:
	rm -rf .coverage
	mkdir -p .coverage
	deno test --coverage=.coverage
	deno coverage .coverage --exclude=\.mock --exclude=cli

install:
	deno install --allow-env --name migrate src/cli.ts

bin/migrate:
	mkdir -p bin
	deno compile --allow-env --output "bin/migrate" src/cli.ts

run:
	deno run --allow-env src/cli.ts
