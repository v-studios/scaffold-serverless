all:
	@echo "TODO: create default target"
	@echo "For now, you can make 'docs'"

# If we want Makefile to only build when we have new stuff, we have to itemize every .rst file
# and we're likely to not keep up with them, so just force it every time.
#docs docs/_build/html/index.html docs/_build/singlehtml/index.html ScaffoldingServerless.epub: docs/index.rst docs/docs.rst
.PHONY: docs

docs:
	cd docs && make html singlehtml epub
