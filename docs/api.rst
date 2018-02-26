=====
 API
=====

We've added an API, using `API Gateway
<https://aws.amazon.com/api-gateway/>`_ so we can handle web
requests. These endpoints are defined in the serverless.yml file, and
specify the URL path, method, and handler to invoke.

GET /upload_url
===============

Get a presigned key URL that we can use to PUT the file to do an upload.

Ideally we would like a web page that presents an upload form. It
would first GET a presigned URL from the API, then the browser would
directly PUT the file to that URL. This prevents tying up the API
server with potentially long and large upload files.

Until we have a web page and Angular code to handle the form, response
and upload, we'll use ``curl``.

First, find the API endpoint based on your stage::

  \../node_modules/.bin/sls info --stage shentonfreude

I then set a variable for the URL to make it easy to refer to::

  urlget="https://WHATEVER.execute-api.us-east-1.amazonaws.com/shentonfreude/upload_url"

Get a presigned URL from the API, specifying the name of your file as
a querystring param::

  curl $urlget?filename=ALEX.JPG

  {"url": "https://uploads-info-shentonfreude.s3.amazonaws.com/ALEX.JPG?AWSAccessKeyId=..."}

Set a variable to that long URL for convenience::

  url="https://uploads-info-shentonfreude.s3.amazonaws.com/ALEX.JPG?AWSAccessKeyId=..."

Then PUT a file to that URL::

  curl -i --upload-file ~/Pictures/alex.jpg $url


serverless.yml
--------------

We define the function and handler together::

  getUploadPSK:
  handler: handler.get_upload_url
  events:
    - http: GET /upload_url

The Lambda must be given permissions for the presigned URL to allow the upload::

  iamRoleStatements:
    - Effect: Allow
      Resource: arn:aws:s3:::uploads-info-${self:provider.stage}/*
      Action:
        - s3:PutObject
        - s3:PutObjectAcl
        - s3:PutObjectTagging


