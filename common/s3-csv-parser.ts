import * as AWS from 'aws-sdk';
import { getIntEnvValue } from './helpers';
import { BYTES_1_MB } from './constants';
import { PromiseResult } from 'aws-sdk/lib/request';
import * as downloader from 's3-download-stream';
import * as csvParser from 'csv-parser';
import { ObjectToStringTransform } from './obj-to-string-transform';

export class S3CsvParser {
    public readonly maxContentLength = getIntEnvValue('MAX_CONTENT_LENGTH', BYTES_1_MB * 10);
    public readonly headerLine = process.env.CSV_HEADER_LINE || 'latitude,longitude,address';
    public readonly bucket = process.env.S3_BUCKET;
    public s3: AWS.S3;
    constructor(s3?: AWS.S3) {
        this.s3 = s3 || new AWS.S3();
    }

    /**
     * Check if the specific S3 key is a valid CSV file
     * @param key s3 key
     */
    public async validate(key: string) {
        let headRes: PromiseResult<AWS.S3.HeadObjectOutput, AWS.AWSError>;
        try {
            headRes = await this.s3.headObject({
                Bucket: process.env.S3_BUCKET,
                Key: key,
            }).promise();
        } catch (error) {
            return false;
        }
        const headRespone = headRes.$response ? (headRes.$response.data as AWS.S3.HeadObjectOutput) : headRes;
        const contentType = headRespone.ContentType;
        if (contentType && contentType !== 'text/csv') {
            return false;
        }
        const fileSize = headRespone.ContentLength;
        if (fileSize > this.maxContentLength) {
            return false;
        }

        let headContentRes: PromiseResult<AWS.S3.GetObjectOutput, AWS.AWSError>
        try {
            headContentRes = await this.s3.getObject({
                Bucket: this.bucket,
                Range: `bytes=0-${this.headerLine.length}`,
                Key: key,
            }).promise();
        } catch (error) {
            return false;
        }
        const headContentResponse = headContentRes.$response ? (headContentRes.$response.data as AWS.S3.GetObjectOutput) : headContentRes;
        const headerLine = headContentResponse.Body.toString()
        if (!headerLine.startsWith(this.headerLine)) {
            return false;
        }
        return true;
    }

    getParsedStream(key: string) {
        return downloader({
            client: this.s3,
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