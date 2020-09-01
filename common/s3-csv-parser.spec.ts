import { config as dotEnvConfig } from 'dotenv';
import * as AWSMock from 'mock-aws-s3';
import { S3CsvParser } from './s3-csv-parser';

dotEnvConfig();
AWSMock.config.basePath = process.cwd();

describe('s3 csv parser should work', () => {
    let parser: S3CsvParser;
    beforeAll(() => {
        const s3 = new AWSMock.S3({
            params: { Bucket: 'data' }
        });
        parser = new S3CsvParser(s3);
    })

    it('should reuturn true when the data file is valid', async () => {
        const valid = await parser.validate('test-data.csv');
        expect(valid).toBe(true);
    });

    it('should return false when the file is too large', async () => {
        const valid = await parser.validate('test-data-too-large.csv');
        expect(valid).toBe(false);
    });

    it('should return false when the header is not same as expected', async () => {
        const valid = await parser.validate('test-data-wrong-header.csv');
        expect(valid).toBe(false);
    });

    it('should return a valid data stream', async () => {
        const records: string[] = await new Promise((resolve) => {
            const rows: string[] = [];
            parser
                .getParsedStream('test-data.csv')
                .on('data', (row) => {
                    rows.push(row.toString())
                })
                .on('end', () => {
                    resolve(rows)
                });
        });
        expect(records.length).toBe(9);
        expect(JSON.parse(records[0])).toHaveProperty('latitude');
        expect(JSON.parse(records[0])).toHaveProperty('longitude');
        expect(JSON.parse(records[0])).toHaveProperty('address');
    });

})
