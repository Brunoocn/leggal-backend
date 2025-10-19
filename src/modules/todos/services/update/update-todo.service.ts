import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { UpdateTodoDTO } from '../../dtos/update-todo.dto';
import { GetOneTodoService } from '../get-one/get-one-todo.service';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';

@Injectable()
export class UpdateTodoService {
  private readonly logger = new Logger(UpdateTodoService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly getOneTodoService: GetOneTodoService,
    private readonly generateEmbeddingService: GenerateEmbeddingService,
  ) {}

  async update(id: string, updateTodoDTO: UpdateTodoDTO): Promise<Todo> {
    const todo = await this.getOneTodoService.findOne(id);

    Object.assign(todo, updateTodoDTO);

    try {
      todo.embedding = await this.generateEmbeddingService.generateForTodo(
        todo,
      );
      return await this.todoRepository.save(todo);
    } catch (error) {
      this.logger.error(`Failed to update todo: ${error.message}`);
      throw new BadRequestException('Failed to update todo with embedding');
    }
  }
}
