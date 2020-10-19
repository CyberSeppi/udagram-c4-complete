import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { TodoActivities } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as utils from '../utils'
import * as logUtils from '../../utils/logger'


const todoActivities = new TodoActivities()


export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logUtils.logInfo("deleteTodo Lambda", "Processing event:", event)

  const userName = utils.getUserId(event)

  logUtils.logInfo("deleteTodo Lambda", `LAMBDA_HTTP GETTODOS userName: `, userName)
  const items = await todoActivities.getAllTodos(userName)
  logUtils.logInfo("deleteTodo Lambda", `LAMBDA_HTTP GETTODOS result for ${userName}: `, items)
  return {
    statusCode: 201,
    body: JSON.stringify({
      items
    })
  }
}
)

handler.use(
  cors({
    credentials: true
  })
)
