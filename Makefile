.PHONY: test

test:
	deno test

coverage:
	rm -rf .coverage
	mkdir -p .coverage
	deno test --coverage=.coverage
	deno coverage .coverage --exclude=\.mock
