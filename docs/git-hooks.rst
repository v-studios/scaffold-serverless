===========
 Git Hooks
===========

We use a git Pre-Push hook `.git/hooks/pre-push
<.git/hooks/pre-push>`_. Unsurprisingly, it's run right before pushing
code to the repo.  That hook does things like runs our test suite and
Flake8 lint checks.

If any of the tests or the flake8 process fail, the script exits with
a non-zero status and this prevents the git push from going
through. Fix your code, commit, and try again.

If you want to force a push, of untested, unlinted code, use the flag like::

  git push --no-verify

and hang your head shame in.

I've created a build-badge for the top ``README.rst``.  On the
CircleCI's projects page hit Settings for this project then Status
Badges. Since this is a private repo, I had to crate a new token,
which I called ``scaffold-serverless-build-badge``, then selected
``reStructuredText`` and pasted the generated code in the README file.


