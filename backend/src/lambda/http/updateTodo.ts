import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { TodoActivities } from '../../businessLogic/todos'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { warmup } from 'middy/middlewares'
import * as utils from '../utils'
import * as logUtils from '../../utils/logger'


const isWarmingUp = (event) => event.source === 'serverless-plugin-warmup'
const onWarmup = (event) => console.log('I am just warming up', event)

const todoActivities = new TodoActivities()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event ', event)

  const todoId = event.pathParameters.todoId
  const updateRequest: UpdateTodoRequest = JSON.parse(event.body)
  const userName = utils.getUserId(event)
  logUtils.logInfo("createTodo lambda", "userid: ", userName)

  console.log('LAMBDA BEFORE GOING DOWN TO BUSINESS - todo Id: ', todoId)
  console.log('LAMBDA BEFORE GOING DOWN TO BUSINESS - updateRequest: ', updateRequest)

  const updateResult = await todoActivities.updateTodo(todoId, userName, updateRequest)

  console.log('LAMBDA RESULT AFTER BUSINESS: ', updateResult)

  return {
    statusCode: 201,
    body: JSON.stringify({
      updateResult
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