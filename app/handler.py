"""Handler for uploaded assets."""

import decimal
from json import dumps, loads
import logging
from os import environ
from urllib.parse import unquote_plus

import boto3

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)
log.setLevel(logging.INFO)
for b in ('boto', 'boto3', 'botocore'):
    logging.getLogger(b).setLevel(logging.WARNING)

DYNAMODB_UPLOAD_INFO_TABLE = environ['DYNAMODB_UPLOAD_INFO_TABLE']
log.info('DYNAMODB_UPLOAD_INFO_TABLE={}'.format(DYNAMODB_UPLOAD_INFO_TABLE))
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_UPLOAD_INFO_TABLE)

UPLOAD_BUCKET_NAME = environ['UPLOAD_BUCKET_NAME']
s3 = boto3.client('s3')


###############################################################################
# Triggers (non-API)

def s3_object_created(event, context):
    for record in event['Records']:
        log.info('event={}'.format(event))
        log.info('context={}'.format(context))
        s3name = record['s3']['bucket']['name']
        obj = record['s3']['object']
        key = unquote_plus(obj['key'])
        size = int(obj['size'])
        etag = obj.get('eTag')  # upload gives eTag but copy does not
        log.info('bucket={} key={} size={} etag={}'.format(s3name, key, size, etag))
        res = table.put_item(Item={'id': key, 'bucket': s3name, 'size': size, 'etag': etag})
        if res['ResponseMetadata']['HTTPStatusCode'] != 200:
            log.error('Putting item to DynamoDB res={}'.format(res))


def s3_object_removed(event, _context):
    """When we see an object deleted from S3, remove it from DynamoDB."""
    for record in event['Records']:
        log.info('event=%s', event)
        obj = record['s3']['object']
        key = unquote_plus(obj['key'])
        log.info('S3 object removed, deleting from DynamoDB key=%s', key)
        res = table.delete_item(Key={'id': key})
        # what if it's already been removed?
        if res['ResponseMetadata']['HTTPStatusCode'] != 200:
            log.error('Deleting key=%s to DynamoDB res=%s', key, res)


###############################################################################
# API endpoints

def get_upload_url(event, _context):
    """Return a presigned URL to PUT a file to in our S3 bucket, with read access.

    Test like:
        curl -i  "$urlget"?filename=ALEX.JPG

    then set a variable 'url' to the returned value, and upload:
        curl -v --upload-file ~/Pictures/alex.jpg "$url"

    We get the Content-Type from HTTP headers.
    TODO: is this the right way? it's not like our GET 'content' is that type;
    maybe it should also be a URL query-string parameter.
    """
    log.info('event=%s', dumps(event))
    content_type = event['headers'].get('content-type')  # APIG downcases this
    log.info('get_upload_url content-type=%s', content_type)
    filename = event['queryStringParameters'].get('filename')
    if not filename:
        return {'statusCode': 400,
                'body': 'Must supply query string "filename=..."'}
    # We need to spec content-type since NG sets this header
    # ContentType is proper boto3 spelling, no dash; value must be lowercase.
    # ACL=public-read so NG can read it and display directly, without API
    params = {'Bucket': UPLOAD_BUCKET_NAME, 'Key': filename, 'ACL': 'public-read'}
    if content_type:
        # Boto3 spelling of Content-Type; value must be lower case for signature to match NG
        params['ContentType'] = content_type
    url = s3.generate_presigned_url('put_object', Params=params, ExpiresIn=3600)
    log.info('url=%s', url)
    body_json = {'url': url}
    if not content_type:
        body_json['warning'] = 'No Content-Type that AWS signature calculation may require'
    return {'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': dumps(body_json)}


def get_assets(event, _contex):
    """Return assets listed in DB as JSON, limited by optional ?term=TERM.

    Return everything:                /assets
    Return assets with 'alex' in id:  /assets?term=alex

    Return HTML if the request wanted text/html.

    This uses a `scan` which is expensive and evil,
    but for this toy project, no biggie.
    We're not going to exhaustively scan if we hit DDB 1MB limit.

    We MUST return CORS header Access-Control-Allow-Origin for NG front-end,
    but we don't need that for HTML output.
    """
    # Test CORS on OPTIONS, then GET with both JSON and HTML output:
    # curl -i -X OPTIONS -H 'Accept: application/json' $URL
    # curl -i -X GET     -H 'Accept: application/json' $URL
    # curl -i -X GET     -H 'Accept: text/html'        $URL
    log.debug('event=%s', event)
    res = table.scan()
    if res['ResponseMetadata']['HTTPStatusCode'] not in (200, 201):
        return {'statusCode': 503,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': dumps({'error': res}, default=_undecimal)}
    assets = res['Items']
    # If there's no QS we get {'queryStringParameters': None} which we can't index
    qs = event['queryStringParameters']
    term = qs.get('term') if qs else None
    if term:
        assets = [asset for asset in assets if term in asset['id']]
    if 'text/html' not in event['headers']['Accept']:
        return {'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': dumps(assets, default=_undecimal)}

    # We really shouldn't bother with this HTML return nonsense
    # Hack out some html, ick
    html = '<table>\n'
    for item in res['Items']:
        html += '<tr><td>{id}</td><td>{size}</td></tr>\n'.format(**item)
    html += '</table>'
    return {'statusCode': 200,
            'headers': {'Content-Type': 'text/html'},
            'body': html}


def get_asset(event, _contex):
    """Return details record of a specific asset by it's id as JSON."""
    log.debug('event=%s', event)
    id = event['pathParameters']['id']
    res = table.get_item(Key={'id': id})
    if res['ResponseMetadata']['HTTPStatusCode'] not in (200, 201):
        return {'statusCode': 503,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': dumps({'error': res}, default=_undecimal)}
    try:
        item = res['Item']
    except KeyError:
        return {'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': dumps({'error': 'not found id={}'.format(id)})}
    return {'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': dumps(item, default=_undecimal)}


def delete_asset(event, _contex):
    """Delete the asset by 'id' by deleting the S3 object; trigger will remove from DDB."""
    log.debug('event=%s', event)
    id = event['pathParameters']['id']
    res = s3.delete_object(Bucket=UPLOAD_BUCKET_NAME, Key=id)
    if res['ResponseMetadata']['HTTPStatusCode'] not in (200, 201):
        return {'statusCode': 503,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': dumps({'error': res}, default=_undecimal)}
    log.info('deleted bucket=%s id=%s', UPLOAD_BUCKET_NAME, id)
    return {'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': dumps({})}  # nothing to say


def put_asset_comment(event, _context):
    """Update just the comment of asset in the DB; we get the entire asset.

    Invoked by APIG: PUT /asset
    """
    # We probably want to be able to update everything about it, generally,
    # but that requires hairy UpdateExpression and ExpressionAttributeValues. If
    # we are going to update an entire object, might as well just overwrite the
    # old one.
    log.debug('event=%s', event)
    asset = loads(event['body'])
    res = table.update_item(Key={'id': asset['id']},
                            UpdateExpression='SET #c = :c',
                            ExpressionAttributeNames={'#c': 'comment'},
                            ExpressionAttributeValues={':c': asset['comment']})
    if res['ResponseMetadata']['HTTPStatusCode'] not in (200, 201):
        return {'statusCode': 503,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': dumps({'error': res}, default=_undecimal)}
    return {'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': dumps({})}


def _undecimal(obj):
    """Work around: Object of type 'Decimal' is not JSON serializable: TypeError.
    This is due to Dynamo returning things like 'size' as Decimal rather than int.
    """
    if isinstance(obj, decimal.Decimal):
        return int(obj)
    raise TypeError
