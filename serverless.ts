import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'mycsvparser',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '>=1.72.0',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      S3_BUCKET: 'my-csv-files-2020-08-30',
      TABLE_NAME: 'geoAddress'
    },
    region: "ap-northeast-2",
    // FIXME: the accurate statements
    iamRoleStatements: [{
      Effect: 'Allow',
      Resource: 'arn:aws:dynamodb:ap-northeast-2:086321337213:table/geoAddress',
      Action: 'dynamodb:PutItem'
    }],
    iamManagedPolicies: [
      'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
    ],
    logs: {
      restApi: {}
    }
  },
  resources: {
    Resources: {
      geoAddress: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:provider.environment.TABLE_NAME}",
          ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 5
          },
          KeySchema: [{
            KeyType: "HASH",
            AttributeName: "hashKey"
          }, {
            KeyType: "RANGE",
            AttributeName: "rangeKey"
          }],
          AttributeDefinitions: [{
            AttributeName: "hashKey",
            AttributeType: "N"
          }, {
            AttributeName: "rangeKey",
            AttributeType: "S"
          }, {
            AttributeName: "geohash",
            AttributeType: "N"
          }],
          LocalSecondaryIndexes: [{
            IndexName: "geohash-index",
            KeySchema: [{
              KeyType: "HASH",
              AttributeName: "hashKey"
            }, {
              KeyType: "RANGE",
              AttributeName: "geohash"
            }],
            Projection: {
              ProjectionType: "ALL"
            }
          }]
        }
      }
    }
  },
  functions: {
    parser: {
      handler: 'handler.parser',
      events: [
        {
          http: {
            method: 'post',
            path: 'actions/parse',
          }
        },
        {
          s3: {
            bucket: '${self:provider.environment.S3_BUCKET}',
            event: 's3:ObjectCreated:Put',
            rules: [{
              suffix: '.csv',
              prefix: ''
            }]
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
