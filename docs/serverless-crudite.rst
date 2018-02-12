====================
 Serverless Crudite
====================

We create a sample CRUD app that should allow file upload, extraction
of simple metadata, publishing the metadata to a database, viewing and
editing the information.

Pick a recent Node version::

  nvm use 9.2.0

I created an initial ``package.json``::

  npm init

then installed the Serverles framework locally::

  npm install --save serverless

Perhaps I'm using ``npm`` wrong but it feels dangerous doing a global
install of serverless to get the ``sls`` command (which is installed
in /usr/local/bin/).  Instead, we'll have to drill into our
``node_modules`` directory. Create a new `Serverless service
<https://serverless.com/framework/docs/providers/aws/cli-reference/create/>`_::

  ./node_modules/serverless/bin/serverless create --template aws-python3 --path crudite
  
