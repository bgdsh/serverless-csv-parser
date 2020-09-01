import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();

import { createReadStream } from 'fs';
import * as csvParser from 'csv-parser';
import { ObjectToStringTransform } from './obj-to-string-transform';
import { DynamoDBWriter } from './ddb-writer';
import * as csv from 'csvtojson';


describe('DynamoDB Writer should work', () => {
    it('it works when piped from fs stream', async () => {
        const dbWritter = new DynamoDBWriter({
            endpoint: 'localhost:8000',
            sslEnabled: false,
            region: 'local-env'
        });
        const dataFile = './data/test-data.csv';
        const res = await new Promise((resolve, reject) => {
            createReadStream(dataFile)
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
        const jsonData = await csv().fromFile(dataFile)
        console.log('jsonData: %j', jsonData);
        const scanRes = await dbWritter.ddb.scan({ TableName: process.env.TABLE_NAME }).promise()
        for (const item of scanRes.Items) {
            const address = item['address']['S'];
            const { coordinates } = JSON.parse(item['geoJson']['S']);
            const longitude = coordinates[0];
            const latitude = coordinates[1];
            expect(jsonData.findIndex(row => 
                row.latitude === latitude.toString() &&
                row.longitude === longitude.toString() &&
                row.address === address
            )).toBeGreaterThan(-1);
        }
        expect(res).toBe('success');
    })
})