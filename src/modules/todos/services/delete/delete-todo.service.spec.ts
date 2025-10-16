import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteTodoService } from './delete-todo.service';
import { GetOneTodoService } from '../get-one/get-one-todo.service';
import { NotFoundException } from '@nestjs/common';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

describe('DeleteTodoService', () => {
  let sut: DeleteTodoService;
  let todoRepository: InMemoryTodoRepository;
  let getOneTodoService: GetOneTodoService;

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();
    getOneTodoService = new GetOneTodoService(todoRepository as any);
    sut = new DeleteTodoService(todoRepository as any, getOneTodoService);
  });

  it('should successfully remove a todo', async () => {
    const todo = todoRepository.create({
      title: 'Test Todo',
      description: 'Test description',
      urgency: TodoUrgency.HIGH,
    });
    await todoRepository.save(todo);

    await sut.remove(todo.id);

    await expect(getOneTodoService.findOne(todo.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when removing non-existent todo', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await expect(sut.remove(fakeId)).rejects.toThrow(NotFoundException);
  });
});
