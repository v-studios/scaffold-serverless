==============
 Architecture
==============

The architecture uses an Angular front-end to communicate via API
Gateway to Lambdas. We do direct uploads of files from the browser
into S3 using pre-signed S3 URLs. Some Lambdas fire in response to
non-API events.

.. image:: Serverless\ Scaffolding\ Architecture_\ web,\ app.png
   :width: 100%


Dashboard
=========

The main page, redirected from ``/`` goes to the ``/dashboard``. It,
followig the Angular Tour of Heros app, shows a few of the uploaded
items as "cards".

It invokes the API with ``/assets`` to get a list of all assets and then
limits the ones it shows.

Search
------

A search box is available. It invokes the API with a search term with
``/assets?term=...``.  The Lambda notices the ``term`` portion and filters
the all-assets from the DynamoDB to those whose ``id`` matches the term.

This could be more efficient, making a DynamoDB query filter results
to those matching the ``id``, but best would be to create a Global
Secondary Index so we can query DDB on the search term directly,
eliminating excess work. That's what you should do for a real app, but
this is supposed to be simple, so is not done here.

Uploads
=======

Queries the API for ``/assets`` which queries the DynmoDB for all assets
and displays them as a list with minimal details, the ``id`` (filename)
and size of the media.

Upload Asset
------------

A little form has a file picker to select a local file.  The Angular
code reads the file into a ``File`` object; it then asks the API
``/getUploadUrl`` for a presigned S3 URL, then PUTs the File to that S3
URL directly, without going through the API.  This direct upload means
we don't have to tie up an API, and the presigned URL has a limited
lifetime.

Delete
------

Each listed asset has an "X" button to delete the asset. It does a
``DELETE`` to ``/assets/id``. The Lambda removes the item from S3, which
causes another Lambda to also remove it from the DynamoDB (see below)

Detail
======

Clicking on a asset, in the Dashboard or Uploads views goes to a
detail page which shows all we know of the object. It does a ``GET`` to
``/assets/id``, which triggers a Lambda to query the DynamoDB for
that ID.

Update Comment
--------------

The page has a box to enter a new comment. When "Save" is hit, it
invokes a ``PUT`` against ``/assets/id`` with the body being the entire
``Upload`` asset object, including the commet and also id, size, etc.
The Lambda gets the ID from the URL and the updates the corresponding
DynamoDB entry with the body, which includes the new comment.

Event Triggers
==============

Some Lambdas are invoked by non-API events. We leverage these to keep
the DynamoDB in sync with what's been added to and deleted from S3.

(This is a very comfortable pattern we can exploit in more
sophisticated systems where, for example, an object removed from S3
triggers a lambda to remove it from a database, and that in turn
triggers a lambda to remove it from an Elasticsearch instance.)

s3ObjectCreated
---------------

When S3 filres this event, the invoked Lambda grabs some info about
the uploaded file -- key (filename), size, etag, etc -- and puts them
into the DynamoDB.

It could do more interesting things, like downloading the file,
running ``exiftool`` against an image file, and posting that additional
data to DynamoDB, but that's beyond the scope of this scaffolding app.

s3ObjectRemoved
---------------

When an object is removed from S3, we trigger a Lambda that removes
the corresponding item from the DynamoDB. This gives us a loose
coupling, so we don't have to do it in the Lambda that deletes from
S3.

It also allows even a human removal from S3 via AWS console to
keep the DDB synchronized.
