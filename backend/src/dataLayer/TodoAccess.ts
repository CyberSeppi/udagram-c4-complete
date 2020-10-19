import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {


  private docClient: DocumentClient
  private todoTable: string
  private userIdIndex: string

  constructor() {
    this.docClient = createDynamoDBClient()
    this.todoTable = process.env.TODOS_TABLE
    this.userIdIndex = process.env.USER_ID_INDEX

  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo
  }

  async getTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.userIdIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    console.log('DATALAYER GETTODOS-result', result)
    return result.Items as TodoItem[]
  }

  async getTodoById(todoId: string): Promise<TodoItem> {

    const params = {
      Key: {
        todoId: todoId
      },
      TableName: this.todoTable
    }

    console.log('DATALAYER PARAMS', params)

    const result = await this.docClient.get(params).promise()

    console.log('DATALAYER RESULT ', result)
    if (result.Item) {
      return result.Item as TodoItem
    } else {
      return undefined
    }

  }

  async deleteTodo(todoId: string) {
    const result = await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        "todoId": todoId,
      }
    }).promise()

    console.log('DATALAYER DELETETODOS-result', result)
    return result
  }

  async updateWithRequest(todoId: string, todoUpdateRequest: UpdateTodoRequest) {
    const params = {
      TableName: this.todoTable,
      Key: {
        todoId: todoId
      },
      UpdateExpression: 'set #namefield = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ":name": todoUpdateRequest.name,
        ":dueDate": todoUpdateRequest.dueDate,
        ":done": todoUpdateRequest.done
      },
      ExpressionAttributeNames:
        { "#namefield": "name" },
      ReturnValues: 'UPDATED_NEW'
    }

    console.log('DATALAYER UPDATEITEM PARAMS ', params)

    try {
      // const result = await this.docClient.update(params).promise()
      const result = await this.docClient.update(params).promise()

      console.log('DATALAYER UPDATETODO-result', result)
      return result
    }
    catch (e) {
      console.log('ERROR OCCURED IN DATALAYER ', e)
    }


  }
  async updateAttachmentUrl(todoId: string, attachmentUrl: string) {
    const params = {
      TableName: this.todoTable,
      Key: {
        todoId: todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ":attachmentUrl": attachmentUrl,
      },
      ReturnValues: 'UPDATED_NEW'
    }

    console.log('DATALAYER updateAttachmentUrl PARAMS ', params)

    try {
      // const result = await this.docClient.update(params).promise()
      const result = await this.docClient.update(params).promise()

      console.log('DATALAYER updateAttachmentUrl-result', result)
      return result
    }
    catch (e) {
      console.log('ERROR OCCURED IN DATALAYER ', e)
    }


  }

}



function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
