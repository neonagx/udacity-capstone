import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { Woofer } from '../models/Woofer';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('WoofersAccess')


export class WooferDataLayer {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly woofersTable = process.env.WOOFER_TABLE,
        private readonly imageBucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private readonly wooferIdIndex = process.env.WOOFER_CREATED_AT_INDEX
    ) {}

    async getAllWoofers(woofer): Promise<Woofer[]> {
        const param = {
            TableName: this.woofersTable,
            IndexName: this.wooferIdIndex,
            KeyConditionExpression: 'dogId = :dogId',
            ExpressionAttributeValues: {
                ':dogId': woofer.dogId
            }
        }

        const result = await this.docClient.query(param).promise();
        const allWoofers = result.Items;

        logger.info('getAllWoofers', allWoofers)
        return allWoofers as Woofer[];
    }

    async createDataWoofer(woofer): Promise<Woofer> {
        const param = {
            TableName: this.woofersTable,
            Item: woofer
        }

        await this.docClient.put(param).promise();
        logger.info('createWoofer', woofer);
        return woofer;
    }

    async deleteDataWoofer (woofer): Promise<String> {
        const param = {
            TableName: this.woofersTable,
            Key: {
                "dogId": woofer.dogId,
                "wooferId": woofer.wooferId
            }
        };

        logger.info('deleteWoofer', param);
        await this.docClient.delete(param).promise();

        return "Woofer has been deleted"
    }

    async updateDataWoofer (woofer): Promise<String>{
        const param = {
            TableName: this.woofersTable,
            Key: {
                "dogId": woofer.dogId,
                "wooferId": woofer.wooferId
            },
            UpdateExpression:"set #tn = :n, dueDate=:dd, done=:d",
            ExpressionAttributeNames: {'#tn': 'name'},
            ExpressionAttributeValues: {
                ":n": woofer.name,
                ":dd": woofer.dueDate,
                ":d": woofer.done
            }
        };
        
        logger.info('updateWoofer', param);

        await this.docClient.update(param).promise();

        return "Updated Woofer"
    }

    async generateUploadUrl(woofer): Promise<String> {

        const signedUrl = await this.s3.getSignedUrl('putObject', {
          Bucket: this.imageBucketName,
          Key: woofer.wooferId,
          Expires: parseInt(this.signedUrlExpiration)
        })
    
        const param = {
          TableName: this.woofersTable,
          Key: {
            "dogId": woofer.dogId,
            "wooferId": woofer.wooferId
          },
          UpdateExpression: "set attachmentUrl = :a",
          ExpressionAttributeValues: {
            ":a": `https://${this.imageBucketName}.s3.amazonaws.com/${woofer.wooferId}`
          }
        }
    
        await this.docClient.update(param).promise();

        logger.info('generateUrl', signedUrl);
    
        return signedUrl
      }

}