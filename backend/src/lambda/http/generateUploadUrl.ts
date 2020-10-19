import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoActivities } from '../../businessLogic/todos'
import * as uuid from 'uuid'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as logUtils from '../../utils/logger'




//creating AWS Client
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todoActivities = new TodoActivities()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logUtils.logInfo("generateUploadUrl lambda", "todoId", todoId)
  const todoItem = await todoActivities.getTodoById(todoId)

  if (!todoItem) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Todo not found'
      })
    }
  }

  const imageId = uuid.v4()


  try {
    const updatedTodo = await todoActivities.updateAttachmentUrl(todoId, imageId)
    console.log('LAMBDA updatedTodo',updatedTodo)
    const signedUrl = getUploadUrl(imageId)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: signedUrl
      })
    }
    
  } catch (e) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Todo not found'
      })
    }
  }
})



function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: parseInt(urlExpiration)
  })
}




handler.use(
  cors({
    credentials: true
  })
)
