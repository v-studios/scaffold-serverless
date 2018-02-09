======
 Docs
======


We use `Sphinx <http://www.sphinx-doc.org/en/stable/index.html>`_ for
documentation, and it's written in Python, so we'll setup a Python
virtual environment.

Install
=======

If you are using `pyenv <https://github.com/pyenv/pyenv>`_ to manage
python versions, pick a python3 like::

  pyenv local 3.6.3

Create a virtual environment::

  virtualenv --python=python3 .venv3

Activate your virtual environment::

  source .venv3/bin/activate


I manually installed Sphinx, then created a requirements
`<requirements.txt>`_ file so you don't have install it; instead,
install all the listed and versioned dependencies::

  pip install -r requirements.txt

Then I ran the quickstart and took the defaults, except I used
``docs`` as my root path, and gave it my name and version number::

  sphinx-quickstart

You won't have to run the quickstart, everything's in ``docs``.


Building Docs
=============

To do it manually, you can build the docs by going into the ``docs``
directory (with virtualenv activated) and use its Makefile to create a
HTML version::

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

As a convenience (with virtualenv activated), in the top level
directory, you can build all versions::

  make docs


Editing Docs
============

Edit the RST pages, as you wish, rebuild, and commit your builds if
you wish. If you add a new page, reference it from the `index.rst
<index.rst>`_ file, omitting the ``.rst`` extension.

Syntax and Configuration (in ``conf.py`` are beyond the scope of this doc).
