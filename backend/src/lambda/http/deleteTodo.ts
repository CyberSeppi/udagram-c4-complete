import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { TodoActivities } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as logUtils from '../../utils/logger'

import { warmup } from 'middy/middlewares'


const isWarmingUp = (event) => event.source === 'serverless-plugin-warmup'
const onWarmup = (event) => console.log('I am just warming up', event)
const todoActivities = new TodoActivities()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  const todoId = event.pathParameters.todoId


  logUtils.logInfo("deleteTodo Lambda", "Processing event:", event)
  logUtils.logInfo("deleteTodo Lambda", 'TODOID ', todoId)

  await todoActivities.deleteTodo(todoId)



  return {
    statusCode: 201,
    body: JSON.stringify({

    })
  }

}).use(
  cors({
    credentials: true
  })
).use(
  warmup({
    isWarmingUp,
    onWarmup
  })
)



// handler.use(
//   cors({
//     credentials: true
//   })
// )

// handler.use(
//   warmup({
//     isWarmingUp,
//     onWarmup
//   })
// )
