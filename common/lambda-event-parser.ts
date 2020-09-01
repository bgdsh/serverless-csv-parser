export class LambdaEventParser {

    /**
     * infer S3 key from event
     * @param event the lambda event
     */
    public static getS3Key(event: any): string {
        if (event.resource === '/actions/parse') {
            const reqBody = JSON.parse(event.body);
            return reqBody.key as string || ''
        }
        if (Array.isArray(event.Records) && event.Records.length > 0) {
            return event.Records[0].s3.object.key as string || '';
        }
        return '';
    }
}