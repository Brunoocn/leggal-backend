import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from '../database/entities/todo.entity';
import { TodosController } from './controllers/todos.controller';
import { CreateTodoService } from './services/create/create-todo.service';
import { GetAllTodosService } from './services/get-all/get-all-todos.service';
import { GetOneTodoService } from './services/get-one/get-one-todo.service';
import { UpdateTodoService } from './services/update/update-todo.service';
import { DeleteTodoService } from './services/delete/delete-todo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodosController],
  providers: [
    CreateTodoService,
    GetAllTodosService,
    GetOneTodoService,
    UpdateTodoService,
    DeleteTodoService,
  ],
  exports: [
    CreateTodoService,
    GetAllTodosService,
    GetOneTodoService,
    UpdateTodoService,
    DeleteTodoService,
  ],
})
export class TodosModule {}
