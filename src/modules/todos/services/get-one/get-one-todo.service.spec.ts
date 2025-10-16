import { describe, it, expect, beforeEach } from 'vitest';
import { GetOneTodoService } from './get-one-todo.service';
import { NotFoundException } from '@nestjs/common';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

describe('GetOneTodoService', () => {
  let sut: GetOneTodoService;
  let todoRepository: InMemoryTodoRepository;

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();
    sut = new GetOneTodoService(todoRepository as any);
  });

  it('should return a todo by id', async () => {
    const todo = todoRepository.create({
      title: 'Test Todo',
      description: 'Test description',
      urgency: TodoUrgency.HIGH,
    });
    await todoRepository.save(todo);

    const result = await sut.findOne(todo.id);

    expect(result).toMatchObject({
      id: todo.id,
      title: 'Test Todo',
    });
  });

  it('should throw NotFoundException when todo does not exist', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    await expect(sut.findOne(fakeId)).rejects.toThrow(
      new NotFoundException(`Todo com ID ${fakeId} não encontrado`),
    );
  });
});
