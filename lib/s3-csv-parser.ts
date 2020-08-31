import * as AWS from 'aws-sdk';
import { getIntEnvValue } from './helpers';
import { BYTES_1_MB } from './constants';
import { PromiseResult } from 'aws-sdk/lib/request';
import * as downloader from 's3-download-stream';
import * as csvParser from 'csv-parser';
import { ObjectToStringTransform } from './obj-to-string-transform';

const s3 = new AWS.S3();

export class S3CsvParser {
    public static readonly maxContentLength = getIntEnvValue('', BYTES_1_MB * 10);
    public static readonly headerLine = process.env.CSV_HEADER_LINE || 'latitude,longitude,address';
    public static readonly bucket = process.env.S3_BUCKET;
    /**
     * Check if the specific S3 key is a valid CSV file
     * @param key s3 key
     */
    public static async validate(key: string) {
        let headRes: PromiseResult<AWS.S3.HeadObjectOutput, AWS.AWSError>;
        try {
            headRes = await s3.headObject({
                Bucket: process.env.S3_BUCKET,
                Key: key,
            }).promise();
        } catch (error) {
            return false;
        }
        // FIXME: catch the errors
        const headRespone = (headRes.$response.data as AWS.S3.HeadObjectOutput);
        const contentType = headRespone.ContentType;
        if (contentType !== 'text/csv') {
            console.log('file content type is not valid');
            return false;
        }
        const fileSize = headRespone.ContentLength;
        if (fileSize > this.maxContentLength) {
            console.log('file size is not valid');
            return false;
        }

        let headContentRes: PromiseResult<AWS.S3.GetObjectOutput, AWS.AWSError>
        try {
            headContentRes = await s3.getObject({
                Bucket: this.bucket,
                Range: `bytes=0-${this.headerLine.length}`,
                Key: key,
            }).promise();
        } catch (error) {
            return false;
        }
        const headContentResponse = headContentRes.$response.data as AWS.S3.GetObjectOutput;
        const headerLine = headContentResponse.Body.toString()
        if (!headerLine.startsWith(this.headerLine)) {
            console.log('file headline is not valid: %j', { headerLine, expected: this.headerLine });
            return false;
        }
        return true;
    }

    static getDownloadStream(key: string) {
        return downloader({
            client: s3,
            params: {
                Key: key,
                Bucket: this.bucket,
            }
        }).pipe(csvParser({
            skipLines: 1, // TODO: make it configurable
            headers: this.headerLine.split(','),
        })).pipe(new ObjectToStringTransform())
    }
}