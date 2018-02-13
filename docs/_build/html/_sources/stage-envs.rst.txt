==============================
 Stage-based AWS Environments
==============================

We are creating separate AWS environmets for each "stage", like "dev",
"qa", and "prod". We also create developer-specific environments that
are used for their feature branches. This allows developers freedom to
tinker without blowing away other developers' work.

The AWS environment -- what Serverless calls "stage" -- is based on the
the `GitFlow model <http://nvie.com/posts/a-successful-git-branching-model/>`_.
The stage name is based on the Git branch that's being processed:

+---------------+-----------------------+-------------------------------+
| Branch        | Stage Environment     | Comment                       |
+===============+=======================+===============================+
| (any)         | local                 | Work on your computer only    |
+---------------+-----------------------+-------------------------------+
| feature/*     | $CIRCLE_USERNAME      | Feature Branches build an     |
|               |                       | environment named for your    |
|               |                       | GitHub username               |
+---------------+-----------------------+-------------------------------+
| develop       | dev                   | Default stage name for the    |
|               |                       | Serverless Framework          |
+---------------+-----------------------+-------------------------------+
| release/*     | qa                    | Quality Assurance checks are  |
|               |                       | done before release to        |
|               |                       | production                    |
+---------------+-----------------------+-------------------------------+
| master        | prod                  | The conventional name for     |
|               |                       | production systems            |
+---------------+-----------------------+-------------------------------+

Note that "master" and "develop" branches get fixed stage names "prod"
and "dev" respectively. "release/" branches use the "qa" stage
config. "feature/" branch, like
"feature/cs/VW-525_create_cicd_framework" uses a stage name based on
the $CIRCLE_USERNAME variable which is the same as the developer's
GitHub username -- in my case, "shentonfreude".

Variables specific to each Serverless "stage" are in
`stagevars.yml <stage_vars.yml>`_. In that file, we have
``.yml`` sections named for each stage. Some tweaks to the
environment are done in `serverless.yml <serverless.yml>`_, like
suffixing the stage name to S3 buckets or DynamoDB tables to ensure
uniqueness across all environments.

The developer-specific stage allows all developers to have their own
AWS environment and prevents one developer from breaking the work of
another. Since Serverless resources -- Lambda, S3 and DynamoDB -- are
very inexpensive to run, this is a minimal cost.  (If we had ELB, EC2,
and RDS resources, we might not do this due to the high cost).

While we expect to use CI/CD to deploy, if you want to deploy the
Serverless code manually, you should use a stage name that equals your
GitHub username. This way, you'll have your own environment, one
that's also used by your feature branches. Like this::

  ../node_modules/serverless/bin/serverless deploy --stage=shentonfreude --verbose

The "qa" stage, based on a "release/\*" branch, allows us to continue
work on the "development" branch while we allow stake holders (e.g.,
customers) to review what we expect to deploy to production soon.

