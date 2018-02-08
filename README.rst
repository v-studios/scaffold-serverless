=============================
 README: Scaffold Serverless
=============================

This is a scaffold for Serverless projects using AWS and the
Serverless Framework. It's intended to be a base for creating other
projects, with all the tools you usually don't add until the very end
-- when it's too late.  To that end, this includes:

* test runner: py.test
* multiple stages: local, feature-branch, dev, qa, prod
* CI/CD: with CircleCI since that's what we use
* documentation: compiled from RST with Sphinx to HTML and PDF

The application isn't terribly important but ideally should include
common use cases, so here are a few features I can think of:

* authentication: with Cognito, so we get social media auth
* modern web ui: with Angular2+ served from S3
* api: allowing GET, POST
* uploading media: to S3, perhaps with presigned URL
* uploading form data: to DynamoDB

To show the features of Serverless, we probably should include some
triggers from (say) S3 uploads to populate the database.

The WebUI should allow login then show some metadata from the DB with
links to the media in S3, and allow editing of both.

This will evolve over time and grow features, I hope. But the main
point is to get the exostructure (tests, CI/CD, docs) working, since
that's the boring stuff everyone avoids.

For details on each feature, head to the docs/ directory.

.. image:: scaffolding-pompei.jpg
   :width: 100%
