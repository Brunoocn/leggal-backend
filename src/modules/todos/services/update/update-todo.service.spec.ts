import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateTodoService } from './update-todo.service';
import { GetOneTodoService } from '../get-one/get-one-todo.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateTodoDTO } from '../../dtos/update-todo.dto';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

describe('UpdateTodoService', () => {
  let sut: UpdateTodoService;
  let todoRepository: InMemoryTodoRepository;
  let getOneTodoService: GetOneTodoService;

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();
    getOneTodoService = new GetOneTodoService(todoRepository as any);
    sut = new UpdateTodoService(todoRepository as any, getOneTodoService);
  });

  it('should successfully update a todo', async () => {
    const todo = todoRepository.create({
      title: 'Original Title',
      description: 'Original description',
      urgency: TodoUrgency.LOW,
    });
    await todoRepository.save(todo);

    const updateData: UpdateTodoDTO = {
      title: 'Updated Title',
      urgency: TodoUrgency.URGENT,
    };

    const result = await sut.update(todo.id, updateData);

    expect(result.title).toBe('Updated Title');
    expect(result.urgency).toBe(TodoUrgency.URGENT);
  });

  it('should throw NotFoundException when updating non-existent todo', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';
    const updateData: UpdateTodoDTO = {
      title: 'Updated Title',
    };

    await expect(sut.update(fakeId, updateData)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException when title is empty string', async () => {
    const todo = todoRepository.create({
      title: 'Original Title',
      description: 'Original description',
      urgency: TodoUrgency.LOW,
    });
    await todoRepository.save(todo);

    const updateData: UpdateTodoDTO = {
      title: '',
    };

    await expect(sut.update(todo.id, updateData)).rejects.toThrow(
      new BadRequestException('Título não pode ser vazio'),
    );
  });

  it('should throw BadRequestException when title is only whitespace', async () => {
    const todo = todoRepository.create({
      title: 'Original Title',
      description: 'Original description',
      urgency: TodoUrgency.LOW,
    });
    await todoRepository.save(todo);

    const updateData: UpdateTodoDTO = {
      title: '   ',
    };

    await expect(sut.update(todo.id, updateData)).rejects.toThrow(
      new BadRequestException('Título não pode ser vazio'),
    );
  });
});
