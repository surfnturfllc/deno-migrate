.PHONY: unit-test unit-test-coverage system-test clean install run refresh-deps;

PERMISSIONS = --allow-env --allow-net --allow-read
EXCLUDE_FROM_COVERAGE = --exclude=\.mock --exclude=cli --exclude=deps

bin/migrate:
	mkdir -p bin
	deno compile ${PERMISSIONS} --output "bin/migrate" cli.ts

unit-test:
	deno test --ignore=system-test

unit-test-coverage:
	rm -rf .coverage
	mkdir -p .coverage
	deno test --ignore=system-test --coverage=.coverage
	deno coverage .coverage --detailed ${EXCLUDE_FROM_COVERAGE}

system-test:
	-docker-compose --file system-test/compose.yaml up --build --abort-on-container-exit --remove-orphans
	docker-compose --file system-test/compose.yaml down --volumes

clean:
	rm -f ~/.deno/bin/migrate

install: clean
	deno install ${PERMISSIONS} --name migrate cli.ts

run:
	deno run ${PERMISSIONS} cli.ts

refresh-deps:
	deno cache --reload mod.ts
