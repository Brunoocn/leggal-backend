import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTodoService } from './create-todo.service';
import { BadRequestException } from '@nestjs/common';
import { CreateTodoDTO } from '../../dtos/create-todo.dto';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';

describe('CreateTodoService', () => {
  let sut: CreateTodoService;
  let todoRepository: InMemoryTodoRepository;
  let generateEmbeddingService: GenerateEmbeddingService;

  const mockEmbedding = Array(1536).fill(0.1);

  const makeFakeTodoData = (
    overrides: Partial<CreateTodoDTO> = {},
  ): CreateTodoDTO => ({
    title: 'Finalizar relatório',
    description: 'Finalizar o relatório mensal',
    urgency: TodoUrgency.HIGH,
    ...overrides,
  });

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();

    generateEmbeddingService = {
      generateForTodo: vi.fn().mockResolvedValue(mockEmbedding),
      generateFromText: vi.fn(),
    } as any;

    sut = new CreateTodoService(
      todoRepository as any,
      generateEmbeddingService,
    );
  });

  it('should successfully create a new todo', async () => {
    const todoData = makeFakeTodoData();

    const result = await sut.create(todoData);

    expect(result).toMatchObject({
      id: expect.any(String),
      title: todoData.title,
      description: todoData.description,
      urgency: todoData.urgency,
    });
  });

  it('should throw BadRequestException when title is empty', async () => {
    const todoData = makeFakeTodoData({ title: '' });

    await expect(sut.create(todoData)).rejects.toThrow(
      new BadRequestException('Título é obrigatório'),
    );
  });

  it('should throw BadRequestException when title is only whitespace', async () => {
    const todoData = makeFakeTodoData({ title: '   ' });

    await expect(sut.create(todoData)).rejects.toThrow(
      new BadRequestException('Título é obrigatório'),
    );
  });

  it('should create todo without urgency when not provided', async () => {
    const todoData: CreateTodoDTO = {
      title: 'Test Todo',
      description: 'Test description',
    };

    const result = await sut.create(todoData);

    expect(result.title).toBe('Test Todo');
    expect(result.description).toBe('Test description');
  });
});
