======================
 Angular Web Frontend
======================

We are using Angular to build a web front-end. It was created with the
Angular CLI, following the `quickstart
<https://angular.io/guide/quickstart>`_::

  ng new web

Disclaimer: I'm pretty new to NG, having taken one class on it, and
witten one prototype... a year ago :-(.  I chose Angular as it seems
more "batteries included" than React, and Vue looked a bit too new.

It has three pages:

* Dashboard: with Seach box
* Uploads: with Delete and Upload File features
* Detail: with Update Comment feature

The Angular front-end is under the `web <web/>`_ directory, mostly in
`web/src/app/ <web/src/app/>`_ as is conventional.

The pages are handled by typical NG `components`, and API interactions
are handed by `services` in `upload.service.ts`.

The most interesting part may be the fact that uploads from the web
app are made directly by the browser into S3, without an API
intermediary.  The NG app does this by using a `File` object which
`onloadend` invokes the API to get a pre-signed URL, which it then
does a HTTP PUT to.


