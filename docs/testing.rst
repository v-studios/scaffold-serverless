=========
 Testing
=========

We prefer `pytest <https://docs.pytest.org/en/latest/>`_ to the
built-in unit tests as they're shorter to write and have more
capabilities.  It's installed as part of the `requirements.txt
<requirements.txt>`_ file.

You should write your tests, organized into different ``test_\*.py``
or ``*_test.py`` files under the ``tests/`` directory.  For example,
you might have ``test_apig.py``, ``test_dynamodb.py``,
``test_authentication.py`` and so on.  You can use this for unit tests
or integration tests.

For info on writing tests, see the `pytest` docs.

To run the tests, with virtualenv activated, in the top level
directory, do::

  make tests

We also installed ``pytest-cov`` to measure code test coverage. You
can run that with::

  make coverage

It's settings are configured in ``.coveragerc``.  It stores state
information in ``.coverage`` and output a HTML report under
``htmlcov/``; don't check these into source control (these are
gitignored here).


