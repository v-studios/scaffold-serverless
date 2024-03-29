all:
	@echo "TODO: create default target"
	@echo "For now, you can make: docs, tests, coverage"

# HOW TO DETECT AND SET PYENV?

venv virtualenv .venv3 .venv3/bin/pip:
	@echo CREATING VIRTUALENV .venv3
	whereis python
	which python
	python --version
	python -m venv .venv3

pipinstall .venv3/bin/pytest .venv3/bin/coverage .venv3/bin/sphinx-build: .venv3/bin/pip requirements.txt
	@echo PIP INSTALLING REQUIREMENTS
	.venv3/bin/pip install -r requirements.txt

# If we want Makefile to only build when we have new stuff, we have to itemize every .rst file
# and we're likely to not keep up with them, so just force it every time.
.PHONY: docs
docs doc: .venv3/bin/sphinx-build
	cd docs && make SPHINXBUILD=../.venv3/bin/sphinx-build html singlehtml epub

# .PHONY forces it to run, instead of treating the `tests` directory as a built thing
.PHONY: tests
tests test: .venv3/bin/pytest .venv3/bin/coverage
	.venv3/bin/pytest --junit-xml=test-results/junit/junit.xml --cov=app --cov-report=term --cov-report=html 

# For now, just flake the tests until we have actual source code
lint flake flake8:
	.venv3/bin/flake8 app/
