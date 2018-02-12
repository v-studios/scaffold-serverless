=====================
 Linting with Flake8
=====================

We use ``Flake8 <http://flake8.pycqa.org/en/latest/index.html>`_ to
"lint" our code. Linting, from the ``C`` language, is an automatic
inspection of code that looks for sloppy technique or other suspicious
things.  It's frequently used to enforce compliance to standard Python
coding guidelines like `PEP8
<https://www.python.org/dev/peps/pep-0008/>`_.

The run of Flake8 is configured by a ``.flake8`` file in the top
directory.  We've tweaked it to allow 96-character long lines instead
of the more restricive (and less readable) 72 characters PEP8
recommends; in a world of big screens, 72 decreases readability.
