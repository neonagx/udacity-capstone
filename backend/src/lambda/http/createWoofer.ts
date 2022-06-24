import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
// import * as middy from 'middy'
// import { cors } from 'middy/middlewares'
// import { getUserId } from '../utils';
import { createWoofer } from '../../businessLogic/WooferBusinessLayer'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newWoofer = await createWoofer(event);
    // TODO: Implement creating a new TODO item

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: newWoofer
      })
    }
}
