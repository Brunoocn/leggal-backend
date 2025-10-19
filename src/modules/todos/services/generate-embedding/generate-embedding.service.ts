import { Inject, Injectable, Logger } from '@nestjs/common';
import { IOpenAiProvider } from 'src/core/providers/openai/IOpenAiProvider';
import { ProvidersEnum } from 'src/shared/generic-enums/providers-enums';
import { Todo } from 'src/modules/database/entities/todo.entity';

@Injectable()
export class GenerateEmbeddingService {
  private readonly logger = new Logger(GenerateEmbeddingService.name);

  constructor(
    @Inject(ProvidersEnum.OpenAiProvider)
    private readonly openAiProvider: IOpenAiProvider,
  ) {}

  async generateForTodo(todo: Partial<Todo>): Promise<number[]> {
    try {
      this.validateTodo(todo);
      const textToEmbed = this.buildTextFromTodo(todo);

      const embedding = await this.openAiProvider.generateEmbedding(
        textToEmbed,
      );

      this.validateEmbedding(embedding);
      return embedding;
    } catch (error) {
      this.logger.error(
        `Failed to generate embedding for todo: ${error.message}`,
      );
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  async generateFromText(text: string): Promise<number[]> {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Text for embedding cannot be empty');
      }

      const embedding = await this.openAiProvider.generateEmbedding(text);

      this.validateEmbedding(embedding);
      return embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  }

  private validateTodo(todo: Partial<Todo>): void {
    if (!todo.title || !todo.urgency || !todo.description) {
      throw new Error('Todo must have title, description, and urgency');
    }
  }

  private validateEmbedding(embedding: number[]): void {
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding format received from AI provider');
    }
  }

  private buildTextFromTodo(todo: Partial<Todo>): string {
    const context: {
      title: string;
      description: string;
      urgency: string;
      userId: string;
    } = {
      title: todo.title,
      description: todo.description,
      urgency: todo.urgency,
      userId: todo.user.id,
    };

    const parts: string[] = [`Título: ${context.title}`];

    if (context.description) {
      parts.push(`Descrição: ${context.description}`);
    }

    parts.push(`Urgência: ${context.urgency}`);

    parts.push(`ID do Usuário: ${context.userId}`);

    return parts.join('\n');
  }
}
