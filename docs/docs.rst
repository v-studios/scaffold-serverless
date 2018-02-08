======
 Docs
======


We use `Sphinx <http://www.sphinx-doc.org/en/stable/index.html>`_ for
documentation, and it's in Python, so we'll setup python and a virtual
environment.

Install
=======

I'm using `pyenv <https://github.com/pyenv/pyenv>`_ to manage my
python versions, so I pick a python3::

  pyenv local 3.6.3

Then create a virtual environment and activate it::

  virtualenv .venv3
  source .venv3/bin/activate

I manually installed it, then created a requirements
`<requirements.txt>`_file so you don't have to; instead, install
the listed dependencies::

  pip install -r requirements.txt

Then I ran the quickstart and took most of the defaults, except I used
``docs`` as my root path, and gave it my name and version number::

  sphinx-quickstart

You won't have to do this.

Building Docs
=============

Now you can build the docs by going into the ``docs`` directory and (with the virtualenv activated) use the Makefile to create a HTML version::

  cd docs
  make html

Then you can open up the `_build/html/index.html
<_build/html/index.html>`_ file and see your beautiful docs. Ta da!

That creates standalone html files, but you can make a single large HTML with::

  make singlehtml

whose output is in `_build/singlehtml/index.html <_build/singlehtml/index.html>`_.

You can even make ePub with::

  make epub

and find the output in `_build/epub/ScaffoldingServerless.epub <_build/epub/ScaffoldingServerless.epub>`_.

Editing Docs
============

Edit the RST pages, as you wish, rebuild, and commit your builds if
you wish. If you add a new page, reference it from the `index.rst
<index.rst>`_ file, omitting the ``.rst`` extension.

Syntax and Configuration (in ``conf.py`` are beyond the scope of this doc).
