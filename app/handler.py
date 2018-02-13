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
table = dynamodb.Table('uploads-info-dev')


def s3upload(event, context):
    for record in event['Records']:
        log.debug('event={}'.format(event))
        s3name = record['s3']['bucket']['name']
        obj = record['s3']['object']
        key = unquote_plus(obj['key'])
        size = int(obj['size'])
        etag = obj.get('eTag')  # upload gives eTag but copy does not
        log.info('bucket={} key={} size={} etag={}'.format(s3name, key, size, etag))
        res = table.put_item(Item={'id': key, 'size': size, 'etag': etag})
        if res['ResponseMetadata']['HTTPStatusCode'] != 200:
            log.error('Putting item to DynamoDB res={}'.format(res))
