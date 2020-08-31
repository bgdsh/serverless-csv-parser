import { Writable } from "stream";
import * as AWS from "aws-sdk";
import * as ddbGeo from 'dynamodb-geo';


export class DynamoDBWriter extends Writable {
  ddbGeoManager: ddbGeo.GeoDataManager;
  ddbGeoConfig: ddbGeo.GeoDataManagerConfiguration;
  ddb: AWS.DynamoDB;

  constructor() {
    super();
    this.ddb = new AWS.DynamoDB();
    this.ddbGeoConfig = new ddbGeo.GeoDataManagerConfiguration(this.ddb, process.env.TABLE_NAME);
    this.ddbGeoConfig.hashKeyLength = 12;
    this.ddbGeoManager = new ddbGeo.GeoDataManager(this.ddbGeoConfig);
  }

  _write(row: string, encoding: string, next: (error?: Error | null) => void) {
    (async () => {
      console.log('prepare to write row %s to db, ecoding is: %s', row, encoding)
      const parsed: { latitude: string, longitude: string, address: string } = JSON.parse(row);
      const putPointInput = {
        RangeKeyValue: { S: '5432' },
        GeoPoint: {
          latitude: parseFloat(parsed.latitude),
          longitude: parseFloat(parsed.longitude),
        },
        PutItemInput: {
          Item: {
            address: { S: parsed.address }
          }
        }
      };
      console.log('put point input: %j', putPointInput);
      await this.ddbGeoManager.putPoint(putPointInput).promise();
      next();
    })();
  }
}