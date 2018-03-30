=======
 Intro
=======

This is a "Scaffolding", or a starter app for Serverless-based
applications. Specifically, it uses AWS Lambda (and other services)
with an Angular5 web front-end to make a simple -- but nontrivial --
CRUD app.

CRUD App
========

The CRUD app allows users to upload files to S3, with a direct upload
from browser using S3 presiged URLs. They can then see a sample of the
uploads on the Details page, all the assets on the Uploads page, and
whatever we have about each on the Detail page.

We wanted something that had behaviours common to many apps, so we
have S3 storage, API Gateways, Lambda functions, and a DynamoDB.
Uploads trigger Lambdas that update the DB; deletions remove from S3
which triggers Lambdas to remove the info from the DB; updates to an
asset update the DB.

We expect you'll replace most of the Serverless app and web front-end
with your own, but can leverage what's here as a starting point.

Support Services
================

The main goal of this project was to provide a framework with all the
boring stuff already provided and running to do the work typically
saved for the end -- too late.

* Docs: Generate beautiful HTML and ePub docs from source in RST files
* Tests: run test frameworks against the backend app and frontend web UI
* CI/CD: build, test, make docs, and deploy to separate AWS infrastructure

There's a Python bias to this work, as that's my comfort zone, but
certainly the Docs can be built using Python-based Sphinx without
needing the app to be python. We're using CircleCI, but you could use
Travis or anything else. The patterns here will still apply and can be
adapted.

