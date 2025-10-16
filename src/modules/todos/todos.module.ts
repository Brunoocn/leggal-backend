import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from '../database/entities/todo.entity';
import { TodosController } from './controllers/todos.controller';
import { CreateTodoService } from './services/create/create-todo.service';
import { GetAllTodosService } from './services/get-all/get-all-todos.service';
import { GetOneTodoService } from './services/get-one/get-one-todo.service';
import { UpdateTodoService } from './services/update/update-todo.service';
import { DeleteTodoService } from './services/delete/delete-todo.service';
import { CreateTodoWithAiService } from './services/create-with-ai/create-todo-with-ai.service';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodosController],
  providers: [
    CreateTodoService,
    GetAllTodosService,
    GetOneTodoService,
    UpdateTodoService,
    DeleteTodoService,
    CreateTodoWithAiService,
  ],
  exports: [
    CreateTodoService,
    GetAllTodosService,
    GetOneTodoService,
    UpdateTodoService,
    DeleteTodoService,
    CreateTodoWithAiService,
  ],
})
export class TodosModule {}
