# Serverless CSV parser

## Features

- Lambda function can be triggered by either restful API or `s3:ObjectCreated:Put` event.
- Read and parse data from S3 in stream mode.
- Save data to DB, coordinates as the key.
- `serverless` config file describes the deployment.
- A SNS topic will be published when an error occur.
- Unit test and e2e test code.

## .env example

``` yaml
ENDPOINT=https://xxxx.execute-api.ap-northeast-2.amazonaws.com/dev/actions/parse
TABLE_NAME=geoAddress
MAX_CONTENT_LENGTH=1000
S3_BUCKET=data
```
