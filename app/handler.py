import json
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
    log.debug('event={}'.format(json.dumps(event)))
    log.debug('context aws_request_id={}'.format(context.aws_request_id))
    filename = event['queryStringParameters'].get('filename')
    if not filename:
        return {'statusCode': 400,
                'body': 'Must supply query string "filename=..."'}
    url = s3.generate_presigned_url('put_object',
                                    Params={'Bucket': UPLOAD_BUCKET_NAME,
                                            'Key': filename,
                                            # 'ContentType': content_type, from upload
                                            },
                                    ExpiresIn=3600)
    log.info('url={}'.format(url))
    return {'statusCode': 200,
            'body': json.dumps({'url': url})}

