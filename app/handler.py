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


def s3upload(event, context):
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


def get_upload_url(event, context):
    """Return a presigned URL to PUT a file to in our S3 bucket.

    Test like:
        curl -i  "$urlget"?filename=ALEX.JPG

    then set a variable 'url' to the returned value, and upload:
        curl -v --upload-file ~/Pictures/alex.jpg "$url"
    """
    log.debug('event={}'.format(dumps(event)))
    log.debug('context aws_request_id={}'.format(context.aws_request_id))
    filename = event['queryStringParameters'].get('filename')
    if not filename:
        return {'statusCode': 400,
                'body': 'Must supply query string "filename=..."'}
    url = s3.generate_presigned_url('put_object',
                                    Params={'Bucket': UPLOAD_BUCKET_NAME,
                                            'Key': filename,
                                            },
                                    ExpiresIn=3600)
    log.info('url={}'.format(url))
    return {'statusCode': 200,
            'body': dumps({'url': url})}


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
