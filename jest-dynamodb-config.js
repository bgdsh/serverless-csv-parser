module.exports = {
    tables: [{
        TableName: "geoAddress",
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
    }]
}
