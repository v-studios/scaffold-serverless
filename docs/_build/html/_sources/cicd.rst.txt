=======
 CI/CD
=======

Continuous Integration / Continuous Deployment helps find bugs faster
and helps prevent bad code from getting out into the world.

We use commercial SaaS `CircleCI <https://circleci.com/>`_ as it's
reasonably priced, pretty easy to use, and featureful with good
integrations into GitHub, AWS, etc.

To create a new "project", login to CircleCI with your GitHub
credentials, select your group from the list of GitHub groups you
belong to(e.g., v-studios) from the top left pulldown, then click into
PROJECTS on the left nav bar. Add Project from the top right: it will
list your GitHub repos. I picked "scaffold-serverless", strangely
enough, and select "Setup project".

Next pick Operating System "Linux" and Language "Python"

TODO: we have to pick a different language container for Serverless,
because we need Node and Python; I'm trying Node this time to see if
it might have python.

I followed the directions to create a .circleci/config.yml file and
then started to populate it.

I'll first make it create a virtualenv, pip install the requirements,
then run the tests.  It should test our (serverless) python code.

Later, I'll add a workflow step that deploys the serverless app to our
AWS "stage" (feature-branch, dev, qa, prod). Then run integration tests.

Instead of hard-coding all the virtualenv and pytest command line goo
in the CircleCI config, we use targets in the Makefile. That way, we
can give the developer easy "make ..." commands that are identical to
what the CI system uses.

When you commit and push -- to any branch -- CircleCI will build. You
can check the status on the `CircleCI Dashboard
<https://circleci.com/gh/v-studios/scaffold-serverless>`_.
