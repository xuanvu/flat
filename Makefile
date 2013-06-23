all: coverage
coverage:
	jscoverage --no-highlight common common-cov
	jscoverage --no-highlight lib lib-cov
	jscoverage --no-highlight routes routes-cov
	node_modules/.bin/mocha --reporter html-cov tests/api > coverage-api.html
	node_modules/.bin/mocha --reporter html-cov tests/lib > coverage-lib.html
	rm -rf *-cov
