import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { LambdaEventParser } from './lib/lambda-event-parser';
import { S3CsvParser } from './lib/s3-csv-parser';
import { DynamoDBWriter } from './lib/ddb-writer';

export const parser: APIGatewayProxyHandler = async (event, _context) => {
  const key = LambdaEventParser.getS3Key(event);
  console.log('bucket: %s, key: %s', process.env.S3_BUCKET, key);
  const valid = await S3CsvParser.validate(key);
  if (!valid) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'INVALID_FILE',
          message: 'invalid csv file',
        }
      }),
    };
  }
  console.log('file %s is valid', key);
  try {
    await new Promise((resolve, reject) => {
      const dbWritter = new DynamoDBWriter();
      S3CsvParser
        .getDownloadStream(key)
        .pipe(dbWritter)
        .on('finish', () => {
          resolve();
        })
        .on('error', (error) => {
          console.error('stream error', error);
          reject(error);
        });
    });
    console.log('done, going to return success')
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
      }),
    };
  } catch (error) {
    console.error('error: %j', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
      }),
    };
  }
}
