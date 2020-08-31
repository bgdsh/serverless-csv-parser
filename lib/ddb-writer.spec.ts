import { createReadStream } from 'fs';
import * as csvParser from 'csv-parser';
import { ObjectToStringTransform } from './obj-to-string-transform';
import { DynamoDBWriter } from './ddb-writer';


describe('DynamoDB Writer should work', () => {
    it('it works when piped from fs stream', async () => {
        const dbWritter = new DynamoDBWriter();
        const res = await new Promise((resolve, reject) => {
            createReadStream('./test-data.csv')
            .pipe(csvParser({
                skipLines: 1, // TODO: make it configurable
                headers: ['latitude', 'longitude', 'address'],
            }))
            .pipe(new ObjectToStringTransform())
            .pipe(dbWritter)
            .on('finish', () => {
                resolve('success')
            })
            .on('error', (err) => {
                reject(err);
            })
        })
        expect(res).toBe('success');
    })
})