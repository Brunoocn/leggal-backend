import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SemanticSearchService } from './semantic-search.service';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

describe('SemanticSearchService', () => {
  let sut: SemanticSearchService;
  let todoRepository: InMemoryTodoRepository;
  let generateEmbeddingService: GenerateEmbeddingService;

  const mockEmbedding = Array(1536).fill(0.1);
  const mockQueryEmbedding = Array(1536).fill(0.2);
  const mockUserId = 'user-123';

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();

    generateEmbeddingService = {
      generateFromText: vi.fn().mockResolvedValue(mockQueryEmbedding),
      generateForTodo: vi.fn().mockResolvedValue(mockEmbedding),
    } as any;

    sut = new SemanticSearchService(
      todoRepository as any,
      generateEmbeddingService,
    );
  });

  it('should return empty array when no todos exist', async () => {
    const results = await sut.search('test query', 10);

    expect(results).toEqual([]);
  });

  it('should return empty array when no todos have embeddings', async () => {
    const todo = todoRepository.create({
      title: 'Test Todo',
      description: 'Test description',
      urgency: TodoUrgency.LOW,
    });
    todo.embedding = null;
    await todoRepository.save(todo);

    const results = await sut.search('test query', 10, mockUserId);

    expect(results).toEqual([]);
  });

  it('should successfully perform semantic search with valid embeddings', async () => {
    const highSimilarityEmbedding = Array(1536).fill(0.9);

    const todo1 = todoRepository.create({
      title: 'Comprar frutas',
      description: 'Ir ao mercado',
      urgency: TodoUrgency.LOW,
    });
    todo1.embedding = highSimilarityEmbedding;
    await todoRepository.save(todo1);

    const todo2 = todoRepository.create({
      title: 'Fazer exercícios',
      description: 'Academia',
      urgency: TodoUrgency.MEDIUM,
    });
    todo2.embedding = highSimilarityEmbedding;
    await todoRepository.save(todo2);

    const results = await sut.search('comprar alimentos', 10, mockUserId);

    expect(results).toHaveLength(2);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('similarity');
    expect(results[0]).not.toHaveProperty('embedding');
  });

  it('should respect the limit parameter', async () => {
    const highSimilarityEmbedding = Array(1536).fill(0.9);

    for (let i = 0; i < 5; i++) {
      const todo = todoRepository.create({
        title: `Todo ${i}`,
        description: `Description ${i}`,
        urgency: TodoUrgency.LOW,
      });
      todo.embedding = highSimilarityEmbedding;
      await todoRepository.save(todo);
    }

    const results = await sut.search('test query', 3, mockUserId);

    expect(results).toHaveLength(3);
  });

  it('should order results by similarity (descending)', async () => {
    const highSimilarityEmbedding = Array(1536).fill(0.9);
    const mediumSimilarityEmbedding = Array(1536).fill(0.7);

    const todo1 = todoRepository.create({
      title: 'Medium similarity',
      description: 'Test',
      urgency: TodoUrgency.LOW,
    });
    todo1.embedding = mediumSimilarityEmbedding;
    await todoRepository.save(todo1);

    const todo2 = todoRepository.create({
      title: 'High similarity',
      description: 'Test',
      urgency: TodoUrgency.LOW,
    });
    todo2.embedding = highSimilarityEmbedding;
    await todoRepository.save(todo2);

    const results = await sut.search('test query', 10, mockUserId);

    expect(results).toHaveLength(2);
    expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    expect(results[0].title).toBe('High similarity');
  });

  it('should filter out todos with invalid embedding dimensions', async () => {
    const highSimilarityEmbedding = Array(1536).fill(0.9);

    const validTodo = todoRepository.create({
      title: 'Valid todo',
      description: 'Test',
      urgency: TodoUrgency.LOW,
    });
    validTodo.embedding = highSimilarityEmbedding;
    await todoRepository.save(validTodo);

    const invalidTodo = todoRepository.create({
      title: 'Invalid todo',
      description: 'Test',
      urgency: TodoUrgency.LOW,
    });
    invalidTodo.embedding = Array(100).fill(0.1);
    await todoRepository.save(invalidTodo);

    const results = await sut.search('test query', 10, mockUserId);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Valid todo');
  });

  it('should call generateFromText with the search query', async () => {
    const query = 'find something';

    await sut.search(query, 10, mockUserId);

    expect(generateEmbeddingService.generateFromText).toHaveBeenCalledWith(
      query,
    );
  });

  it('should throw error when embedding generation fails', async () => {
    vi.spyOn(generateEmbeddingService, 'generateFromText').mockRejectedValue(
      new Error('OpenAI API error'),
    );

    await expect(sut.search('test query', 10, mockUserId)).rejects.toThrow(
      'Semantic search failed',
    );
  });

  it('should use default limit when not provided', async () => {
    const highSimilarityEmbedding = Array(1536).fill(0.9);

    for (let i = 0; i < 15; i++) {
      const todo = todoRepository.create({
        title: `Todo ${i}`,
        description: `Description ${i}`,
        urgency: TodoUrgency.LOW,
      });
      todo.embedding = highSimilarityEmbedding;
      await todoRepository.save(todo);
    }

    const results = await sut.search('test query');

    expect(results).toHaveLength(10);
  });

  it('should filter out todos with similarity below threshold', async () => {
    const highSimilarityEmbedding = Array(1536).fill(0.2);

    const lowSimilarityEmbedding = Array(1536)
      .fill(0)
      .map((_, i) => (i % 2 === 0 ? -1 : 1));

    const todo1 = todoRepository.create({
      title: 'High similarity todo',
      description: 'Very similar',
      urgency: TodoUrgency.LOW,
    });
    todo1.embedding = highSimilarityEmbedding;
    await todoRepository.save(todo1);

    const todo2 = todoRepository.create({
      title: 'Low similarity todo',
      description: 'Not similar',
      urgency: TodoUrgency.LOW,
    });
    todo2.embedding = lowSimilarityEmbedding;
    await todoRepository.save(todo2);

    const results = await sut.search('test query', 10, mockUserId);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('High similarity todo');
    expect(results[0].similarity).toBeGreaterThanOrEqual(0.3);
  });

  it('should return empty array when all todos have similarity below threshold', async () => {
    const lowSimilarityEmbedding = Array(1536)
      .fill(0)
      .map((_, i) => (i % 2 === 0 ? -1 : 1));

    const todo1 = todoRepository.create({
      title: 'Todo 1',
      description: 'Test',
      urgency: TodoUrgency.LOW,
    });
    todo1.embedding = lowSimilarityEmbedding;
    await todoRepository.save(todo1);

    const todo2 = todoRepository.create({
      title: 'Todo 2',
      description: 'Test',
      urgency: TodoUrgency.LOW,
    });
    todo2.embedding = lowSimilarityEmbedding;
    await todoRepository.save(todo2);

    const results = await sut.search('test query', 10, mockUserId);

    expect(results).toEqual([]);
  });
});
