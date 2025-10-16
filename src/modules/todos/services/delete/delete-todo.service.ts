import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { GetOneTodoService } from '../get-one/get-one-todo.service';

@Injectable()
export class DeleteTodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private getOneTodoService: GetOneTodoService,
  ) {}

  async remove(id: string): Promise<void> {
    const todo = await this.getOneTodoService.findOne(id);
    await this.todoRepository.remove(todo);
  }
}
