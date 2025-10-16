import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { CreateTodoDTO } from '../../dtos/create-todo.dto';

@Injectable()
export class CreateTodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async create(createTodoDTO: CreateTodoDTO): Promise<Todo> {
    if (!createTodoDTO.title || createTodoDTO.title.trim() === '') {
      throw new BadRequestException('Título é obrigatório');
    }

    const todo = this.todoRepository.create(createTodoDTO);
    return await this.todoRepository.save(todo);
  }
}
