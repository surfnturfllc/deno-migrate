.PHONY: test

test_directory := .test

test:
	deno test

coverage:
	mkdir -p .test/coverage
	deno test --coverage=$(test_directory)/coverage
	deno coverage $(test_directory)/coverage
