import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { LambdaEventParser } from './common/lambda-event-parser';
import { S3CsvParser } from './common/s3-csv-parser';
import { DynamoDBWriter } from './common/ddb-writer';
import { SNSErrorReporter } from './common/error-reporter';
import { buildResponse } from './common/helpers';

export const parser: APIGatewayProxyHandler = async (event, _context) => {
  const errorReportor = new SNSErrorReporter();
  const key = LambdaEventParser.getS3Key(event);
  const parser = new S3CsvParser();
  const valid = await parser.validate(key);
  if (!valid) {
    errorReportor.publish(`invalid data file: ${key}`)
    return buildResponse(200, {
      error: {
        code: 'INVALID_FILE',
        message: 'invalid csv file',
      }
    })
  }
  try {
    await new Promise((resolve, reject) => {
      const dbWritter = new DynamoDBWriter();
      parser
        .getParsedStream(key)
        .pipe(dbWritter)
        .on('finish', () => {
          resolve();
        })
        .on('error', (error) => {
          const errorMsg = `data transformation error, ${JSON.stringify(error)}`
          console.error(errorMsg);
          errorReportor.publish(errorMsg);
          reject(error);
        });
    });
    return buildResponse(200);
  } catch (error) {
    console.error('error: %j', error)
    return buildResponse(500);
  }
}
