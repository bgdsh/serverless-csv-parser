import * as AWS from "aws-sdk";

export class SNSErrorReporter {
    sns: AWS.SNS;
    constructor() {
        this.sns = new AWS.SNS({});
    }

    async publish(message: string) {
        try {
            await this.sns.publish({
                Message: message,
                TopicArn: process.env.SNS_TOPIC_ARN,
            }).promise()
            return {
                success: true
            }
        } catch (error) {
            console.error('publish sns message failed', error)
            return {
                success: false,
            }
        }
    }
}