import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { CreateTodoDTO } from '../../dtos/create-todo.dto';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';

@Injectable()
export class CreateTodoService {
  private readonly logger = new Logger(CreateTodoService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly generateEmbeddingService: GenerateEmbeddingService,
  ) {}

  async create(createTodoDTO: CreateTodoDTO, userId: string): Promise<Todo> {
    this.validateTitle(createTodoDTO.title);

    const formattedCreateTodoDTO = {
      ...createTodoDTO,
      user: { id: userId },
    };
    const todo = this.todoRepository.create(formattedCreateTodoDTO);

    try {
      todo.embedding = await this.generateEmbeddingService.generateForTodo(
        todo,
      );
      return await this.todoRepository.save(todo);
    } catch (error) {
      this.logger.error(`Failed to create todo: ${error.message}`);
      throw new BadRequestException('Failed to create todo with embedding');
    }
  }

  private validateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new BadRequestException('Título é obrigatório');
    }
  }
}
