import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GenerateEmbeddingService } from './generate-embedding.service';
import { IOpenAiProvider } from 'src/core/providers/openai/IOpenAiProvider';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

describe('GenerateEmbeddingService', () => {
  let sut: GenerateEmbeddingService;
  let openAiProvider: IOpenAiProvider;

  const mockEmbedding = Array(1536).fill(0.1);
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    openAiProvider = {
      generateCompletion: vi.fn(),
      generateEmbedding: vi.fn().mockResolvedValue(mockEmbedding),
    } as any;

    sut = new GenerateEmbeddingService(openAiProvider);
  });

  describe('generateForTodo', () => {
    it('should generate embedding for a complete todo', async () => {
      const todo = {
        title: 'Comprar frutas',
        description: 'Ir ao mercado comprar maçãs e bananas',
        urgency: TodoUrgency.MEDIUM,
        user: { id: mockUserId },
      };

      const result = await sut.generateForTodo(todo);

      expect(result).toEqual(mockEmbedding);
      expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(
        `Título: Comprar frutas\nDescrição: Ir ao mercado comprar maçãs e bananas\nUrgência: medium\nID do Usuário: ${mockUserId}`,
      );
    });

    it('should generate embedding for a todo with all required fields', async () => {
      const todo = {
        title: 'Fazer exercícios',
        description: 'Fazer exercícios de cardio',
        urgency: TodoUrgency.HIGH,
        user: { id: mockUserId },
      };

      const result = await sut.generateForTodo(todo);

      expect(result).toEqual(mockEmbedding);
      expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(
        `Título: Fazer exercícios\nDescrição: Fazer exercícios de cardio\nUrgência: high\nID do Usuário: ${mockUserId}`,
      );
    });

    it('should throw error when todo is missing description', async () => {
      const todo = {
        title: 'Estudar TypeScript',
        urgency: TodoUrgency.LOW,
        user: { id: mockUserId },
      };

      await expect(sut.generateForTodo(todo)).rejects.toThrow(
        'Embedding generation failed: Todo must have title, description, and urgency',
      );
    });

    it('should throw error when todo title is missing', async () => {
      const todo = {
        description: 'Descrição sem título',
        urgency: TodoUrgency.LOW,
        user: { id: mockUserId },
      };

      await expect(sut.generateForTodo(todo)).rejects.toThrow(
        'Embedding generation failed: Todo must have title, description, and urgency',
      );
    });

    it('should throw error when todo urgency is missing', async () => {
      const todo = {
        title: 'Test Title',
        description: 'Descrição',
        user: { id: mockUserId },
      };

      await expect(sut.generateForTodo(todo)).rejects.toThrow(
        'Embedding generation failed: Todo must have title, description, and urgency',
      );
    });

    it('should throw error when openAiProvider fails', async () => {
      vi.spyOn(openAiProvider, 'generateEmbedding').mockRejectedValue(
        new Error('OpenAI API error'),
      );

      const todo = {
        title: 'Test todo',
        description: 'Test description',
        urgency: TodoUrgency.LOW,
        user: { id: mockUserId },
      };

      await expect(sut.generateForTodo(todo)).rejects.toThrow(
        'Embedding generation failed: OpenAI API error',
      );
    });

    it('should throw error when embedding format is invalid (not an array)', async () => {
      vi.spyOn(openAiProvider, 'generateEmbedding').mockResolvedValue(
        null as any,
      );

      const todo = {
        title: 'Test todo',
        description: 'Test description',
        urgency: TodoUrgency.LOW,
        user: { id: mockUserId },
      };

      await expect(sut.generateForTodo(todo)).rejects.toThrow(
        'Embedding generation failed: Invalid embedding format received from AI provider',
      );
    });

    it('should throw error when embedding is empty array', async () => {
      vi.spyOn(openAiProvider, 'generateEmbedding').mockResolvedValue([]);

      const todo = {
        title: 'Test todo',
        description: 'Test description',
        urgency: TodoUrgency.LOW,
        user: { id: mockUserId },
      };

      await expect(sut.generateForTodo(todo)).rejects.toThrow(
        'Embedding generation failed: Invalid embedding format received from AI provider',
      );
    });

    it('should handle all urgency levels correctly', async () => {
      const urgencies = [
        TodoUrgency.LOW,
        TodoUrgency.MEDIUM,
        TodoUrgency.HIGH,
        TodoUrgency.URGENT,
      ];

      for (const urgency of urgencies) {
        const todo = {
          title: 'Test',
          description: 'Test description',
          urgency,
          user: { id: mockUserId },
        };

        await sut.generateForTodo(todo);

        expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(
          expect.stringContaining(`Urgência: ${urgency}`),
        );
      }
    });
  });

  describe('generateFromText', () => {
    it('should generate embedding from text query', async () => {
      const text = 'buscar tarefas sobre compras';

      const result = await sut.generateFromText(text);

      expect(result).toEqual(mockEmbedding);
      expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(text);
    });

    it('should throw error when text is empty', async () => {
      await expect(sut.generateFromText('')).rejects.toThrow(
        'Embedding generation failed: Text for embedding cannot be empty',
      );
    });

    it('should throw error when text is only whitespace', async () => {
      await expect(sut.generateFromText('   ')).rejects.toThrow(
        'Embedding generation failed: Text for embedding cannot be empty',
      );
    });

    it('should throw error when text is null', async () => {
      await expect(sut.generateFromText(null as any)).rejects.toThrow(
        'Embedding generation failed: Text for embedding cannot be empty',
      );
    });

    it('should throw error when openAiProvider fails', async () => {
      vi.spyOn(openAiProvider, 'generateEmbedding').mockRejectedValue(
        new Error('API rate limit exceeded'),
      );

      await expect(sut.generateFromText('test query')).rejects.toThrow(
        'Embedding generation failed: API rate limit exceeded',
      );
    });

    it('should throw error when embedding format is invalid', async () => {
      vi.spyOn(openAiProvider, 'generateEmbedding').mockResolvedValue(
        {} as any,
      );

      await expect(sut.generateFromText('test query')).rejects.toThrow(
        'Embedding generation failed: Invalid embedding format received from AI provider',
      );
    });

    it('should handle long text queries', async () => {
      const longText = 'a'.repeat(1000);

      const result = await sut.generateFromText(longText);

      expect(result).toEqual(mockEmbedding);
      expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(longText);
    });

    it('should handle special characters in text', async () => {
      const textWithSpecialChars = 'buscar #tarefas @urgentes & importantes!';

      const result = await sut.generateFromText(textWithSpecialChars);

      expect(result).toEqual(mockEmbedding);
      expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(
        textWithSpecialChars,
      );
    });
  });

  describe('text building', () => {
    it('should build correct text format with all fields', async () => {
      const todo = {
        title: 'Test Title',
        description: 'Test Description',
        urgency: TodoUrgency.HIGH,
        user: { id: mockUserId },
      };

      await sut.generateForTodo(todo);

      expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(
        `Título: Test Title\nDescrição: Test Description\nUrgência: high\nID do Usuário: ${mockUserId}`,
      );
    });

    it('should include user ID in the embedding text', async () => {
      const todo = {
        title: 'Test Title',
        description: 'Test Description',
        urgency: TodoUrgency.LOW,
        user: { id: mockUserId },
      };

      await sut.generateForTodo(todo);

      expect(openAiProvider.generateEmbedding).toHaveBeenCalledWith(
        expect.stringContaining(`ID do Usuário: ${mockUserId}`),
      );
    });
  });

  describe('embedding validation', () => {
    it('should accept valid embedding array', async () => {
      const validEmbedding = Array(100).fill(0.5);
      vi.spyOn(openAiProvider, 'generateEmbedding').mockResolvedValue(
        validEmbedding,
      );

      const result = await sut.generateFromText('test');

      expect(result).toEqual(validEmbedding);
    });

    it('should accept embedding with single element', async () => {
      const singleElementEmbedding = [0.5];
      vi.spyOn(openAiProvider, 'generateEmbedding').mockResolvedValue(
        singleElementEmbedding,
      );

      const result = await sut.generateFromText('test');

      expect(result).toEqual(singleElementEmbedding);
    });

    it('should reject undefined embedding', async () => {
      vi.spyOn(openAiProvider, 'generateEmbedding').mockResolvedValue(
        undefined as any,
      );

      await expect(sut.generateFromText('test')).rejects.toThrow(
        'Invalid embedding format received from AI provider',
      );
    });
  });
});
