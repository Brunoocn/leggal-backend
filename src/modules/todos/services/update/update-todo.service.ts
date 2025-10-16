import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { UpdateTodoDTO } from '../../dtos/update-todo.dto';
import { GetOneTodoService } from '../get-one/get-one-todo.service';

@Injectable()
export class UpdateTodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private getOneTodoService: GetOneTodoService,
  ) {}

  async update(id: string, updateTodoDTO: UpdateTodoDTO): Promise<Todo> {
    const todo = await this.getOneTodoService.findOne(id);

    if (
      updateTodoDTO.title !== undefined &&
      updateTodoDTO.title.trim() === ''
    ) {
      throw new BadRequestException('Título não pode ser vazio');
    }

    Object.assign(todo, updateTodoDTO);
    return await this.todoRepository.save(todo);
  }
}
