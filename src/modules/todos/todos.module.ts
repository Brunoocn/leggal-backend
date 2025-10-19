import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from '../database/entities/todo.entity';
import { User } from '../database/entities/user.entity';
import { TodosController } from './controllers/todos.controller';
import { CreateTodoService } from './services/create/create-todo.service';
import { GetAllTodosService } from './services/get-all/get-all-todos.service';
import { GetOneTodoService } from './services/get-one/get-one-todo.service';
import { UpdateTodoService } from './services/update/update-todo.service';
import { DeleteTodoService } from './services/delete/delete-todo.service';
import { CreateTodoWithAiService } from './services/create-with-ai/create-todo-with-ai.service';
import { GenerateEmbeddingService } from './services/generate-embedding/generate-embedding.service';
import { SemanticSearchService } from './services/semantic-search/semantic-search.service';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, User])],
  controllers: [TodosController],
  providers: [
    CreateTodoService,
    GetAllTodosService,
    GetOneTodoService,
    UpdateTodoService,
    DeleteTodoService,
    CreateTodoWithAiService,
    GenerateEmbeddingService,
    SemanticSearchService,
  ],
  exports: [
    CreateTodoService,
    GetAllTodosService,
    GetOneTodoService,
    UpdateTodoService,
    DeleteTodoService,
    CreateTodoWithAiService,
    GenerateEmbeddingService,
    SemanticSearchService,
  ],
})
export class TodosModule {}
