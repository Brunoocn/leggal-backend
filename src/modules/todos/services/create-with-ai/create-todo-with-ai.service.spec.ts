import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateTodoWithAiService } from './create-todo-with-ai.service';
import { BadRequestException } from '@nestjs/common';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';
import { OpenAiProvider } from 'src/core/providers/openai/implementations/openai-provider';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';

describe('CreateTodoWithAiService', () => {
  let sut: CreateTodoWithAiService;
  let todoRepository: InMemoryTodoRepository;
  let openAiProvider: OpenAiProvider;
  let generateEmbeddingService: GenerateEmbeddingService;

  const mockEmbedding = Array(1536).fill(0.1);

  const mockAiResponse = JSON.stringify({
    title: 'Fazer um bolo',
    description: 'Preparar e assar um bolo de chocolate',
    urgency: 'low',
  });

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();

    openAiProvider = {
      generateCompletion: vi.fn().mockResolvedValue(mockAiResponse),
    } as any;

    generateEmbeddingService = {
      generateForTodo: vi.fn().mockResolvedValue(mockEmbedding),
      generateFromText: vi.fn(),
    } as any;

    sut = new CreateTodoWithAiService(
      todoRepository as any,
      openAiProvider,
      generateEmbeddingService,
    );
  });

  it('should successfully create a todo from AI input', async () => {
    const userMessage = 'fazer um bolo';

    const result = await sut.createWithAi(userMessage);

    expect(result).toMatchObject({
      id: expect.any(String),
      title: 'Fazer um bolo',
      description: 'Preparar e assar um bolo de chocolate',
      urgency: TodoUrgency.LOW,
    });
    expect(result.embedding).toBe(mockEmbedding);
  });

  it('should call OpenAI provider with correct prompt and message', async () => {
    const userMessage = 'fazer um bolo';

    await sut.createWithAi(userMessage);

    expect(openAiProvider.generateCompletion).toHaveBeenCalledWith(
      expect.any(String),
      userMessage,
    );
  });

  it('should call generateEmbedding for the created todo', async () => {
    const userMessage = 'fazer um bolo';

    await sut.createWithAi(userMessage);

    expect(generateEmbeddingService.generateForTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Fazer um bolo',
        description: 'Preparar e assar um bolo de chocolate',
      }),
    );
  });

  it('should save todo with embedding to repository', async () => {
    const userMessage = 'fazer um bolo';

    await sut.createWithAi(userMessage);

    const todos = await todoRepository.find();
    expect(todos).toHaveLength(1);
    expect(todos[0].embedding).toBe(mockEmbedding);
  });

  it('should handle AI response with minimal data', async () => {
    const minimalResponse = JSON.stringify({
      title: 'Simple task',
    });

    vi.spyOn(openAiProvider, 'generateCompletion').mockResolvedValue(
      minimalResponse,
    );

    const result = await sut.createWithAi('simple task');

    expect(result).toMatchObject({
      title: 'Simple task',
      description: '',
      urgency: 'low',
    });
  });

  it('should handle different urgency levels from AI', async () => {
    const urgentResponse = JSON.stringify({
      title: 'Urgent task',
      description: 'Very important',
      urgency: 'urgent',
    });

    vi.spyOn(openAiProvider, 'generateCompletion').mockResolvedValue(
      urgentResponse,
    );

    const result = await sut.createWithAi('urgent task');

    expect(result.urgency).toBe(TodoUrgency.URGENT);
  });

  it('should throw BadRequestException when AI returns invalid JSON', async () => {
    vi.spyOn(openAiProvider, 'generateCompletion').mockResolvedValue(
      'Invalid JSON response',
    );

    await expect(sut.createWithAi('test')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when AI response is missing title', async () => {
    const invalidResponse = JSON.stringify({
      description: 'No title here',
      urgency: 'low',
    });

    vi.spyOn(openAiProvider, 'generateCompletion').mockResolvedValue(
      invalidResponse,
    );

    await expect(sut.createWithAi('test')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when OpenAI provider fails', async () => {
    vi.spyOn(openAiProvider, 'generateCompletion').mockRejectedValue(
      new Error('OpenAI API error'),
    );

    await expect(sut.createWithAi('test')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when embedding generation fails', async () => {
    vi.spyOn(generateEmbeddingService, 'generateForTodo').mockRejectedValue(
      new Error('Embedding generation failed'),
    );

    await expect(sut.createWithAi('fazer um bolo')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should handle AI response with special characters', async () => {
    const specialCharsResponse = JSON.stringify({
      title: 'Tarefa com "aspas" e \'apostrofos\'',
      description: 'Descrição com caracteres especiais: @#$%',
      urgency: 'medium',
    });

    vi.spyOn(openAiProvider, 'generateCompletion').mockResolvedValue(
      specialCharsResponse,
    );

    const result = await sut.createWithAi('special task');

    expect(result.title).toBe('Tarefa com "aspas" e \'apostrofos\'');
    expect(result.description).toContain('caracteres especiais');
  });

  it('should handle AI response with long description', async () => {
    const longDescription = 'A'.repeat(5000);
    const longResponse = JSON.stringify({
      title: 'Long task',
      description: longDescription,
      urgency: 'high',
    });

    vi.spyOn(openAiProvider, 'generateCompletion').mockResolvedValue(
      longResponse,
    );

    const result = await sut.createWithAi('long task');

    expect(result.description).toBe(longDescription);
  });

  it('should preserve all urgency levels', async () => {
    const urgencyLevels = [
      { urgency: 'low', expected: TodoUrgency.LOW },
      { urgency: 'medium', expected: TodoUrgency.MEDIUM },
      { urgency: 'high', expected: TodoUrgency.HIGH },
      { urgency: 'urgent', expected: TodoUrgency.URGENT },
    ];

    for (const { urgency, expected } of urgencyLevels) {
      const response = JSON.stringify({
        title: `Task with ${urgency} urgency`,
        description: 'Test',
        urgency,
      });

      vi.spyOn(openAiProvider, 'generateCompletion').mockResolvedValue(
        response,
      );

      const result = await sut.createWithAi('test');
      expect(result.urgency).toBe(expected);
    }
  });

  it('should not include embedding in the returned todo', async () => {
    const result = await sut.createWithAi('test task');

    expect(result.embedding).toBeDefined();
  });
});
