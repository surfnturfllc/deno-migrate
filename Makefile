.PHONY: test coverage install run;

test:
	deno test

coverage:
	rm -rf .coverage
	mkdir -p .coverage
	deno test --coverage=.coverage
	deno coverage .coverage --exclude=\.mock --exclude=cli

install:
	deno install --allow-env --name migrate cli.ts

bin/migrate:
	mkdir -p bin
	deno compile --allow-env --output "bin/migrate" cli.ts

run:
	deno run --allow-env cli.ts
