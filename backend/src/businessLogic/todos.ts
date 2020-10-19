import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/TodoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
//import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'


const todoAccess = new TodoAccess()

export class TodoActivities {


    private bucketName: string

    constructor(){
        this.bucketName = process.env.IMAGES_S3_BUCKET
    }

    async createTodo(todoRequest: CreateTodoRequest, userId): Promise<TodoItem> {
        const todo = await this.covertRequestToItem(todoRequest, userId)
        const todoItem = await todoAccess.createTodo(todo)
        
        console.log('Todo Item created', todoItem)
        return todoItem

    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {

        const todoItems = await todoAccess.getTodos(userId)

        console.log('BUISNESSLAYER GETALLTODOS RESULT', todoItems)
        return todoItems
    }

    async getTodoById(todoId: string): Promise<TodoItem> {

            const todoItem = await todoAccess.getTodoById(todoId)

            console.log('BUISNESSLAYER getTodoById RESULT', todoItem)
            return todoItem
    
    }

    async deleteTodo(todoId: string) {

        const todoItems = await todoAccess.deleteTodo(todoId)

        console.log('BUISNESSLAYER DELETETODO RESULT', todoItems)
        return todoItems
    }

    async updateTodo(todoId: string, todoRequest: UpdateTodoRequest) {

        try {
            const updatedItem = await todoAccess.updateWithRequest(todoId, todoRequest)
            console.log('BUISNESSLAYER UPDATETODO RESULT', updatedItem)
            return updatedItem
        }
        catch (e) {
            console.log('ERROR OCCURED IN BUSINESSLAYER ', e)
        }        
    }

    async updateAttachmentUrl(todoId: string, imageId: string) {
        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${imageId}`

        console.log('BUSINESSLAYER UPDATEATTACHMENTURL URL:', attachmentUrl)

        try {
            const updatedItem = await todoAccess.updateAttachmentUrl(todoId, attachmentUrl)
            console.log('BUISNESSLAYER updateAttachmentUrl RESULT', updatedItem)
            return updatedItem
        }
        catch (e) {
            console.log('ERROR OCCURED IN BUSINESSLAYER ', e)
        }        
    }


    private covertRequestToItem(todoRequest: CreateTodoRequest, userId: string): TodoItem {

        const actDate = new Date().toISOString()
        const newId = uuid.v4()

        const newTodoItem: TodoItem = {
            createdAt: actDate,
            done: false,
            todoId: newId,
            userId,
            ...todoRequest
        }

        console.log('newly created todo item - unsaved', newTodoItem)

        return newTodoItem
    }


}