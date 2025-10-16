import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, IsNull } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';
import { cosineSimilarity } from '../../utils/cosine-similarity.util';
import { EMBEDDING_CONSTANTS } from '../../constants/embedding.constants';

export interface SemanticSearchResult {
  id: string;
  title: string;
  description: string;
  urgency: string;
  createdAt: Date;
  updatedAt: Date;
  similarity: number;
}

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly generateEmbeddingService: GenerateEmbeddingService,
  ) {}

  async search(
    query: string,
    limit: number = EMBEDDING_CONSTANTS.DEFAULT_SEARCH_LIMIT,
  ): Promise<SemanticSearchResult[]> {
    try {
      this.logger.debug(`Performing semantic search for query: "${query}"`);

      const queryEmbedding =
        await this.generateEmbeddingService.generateFromText(query);

      const todos = await this.findTodosWithEmbeddings();

      if (todos.length === 0) {
        this.logger.warn('No todos with embeddings found');
        return [];
      }

      this.logger.debug(`Found ${todos.length} todos with embeddings`);

      const results = this.calculateSimilarities(todos, queryEmbedding, limit);

      this.logger.debug(`Returning ${results.length} search results`);

      return results;
    } catch (error) {
      this.logger.error(`Semantic search failed: ${error.message}`);
      throw new Error(`Semantic search failed: ${error.message}`);
    }
  }

  private async findTodosWithEmbeddings(): Promise<Todo[]> {
    return this.todoRepository.find({
      where: {
        embedding: Not(IsNull()),
      },
      select: [
        'id',
        'title',
        'description',
        'urgency',
        'createdAt',
        'updatedAt',
        'embedding',
      ],
    });
  }

  private calculateSimilarities(
    todos: Todo[],
    queryEmbedding: number[],
    limit: number,
  ): SemanticSearchResult[] {
    return todos
      .filter((todo) => this.isValidEmbedding(todo.embedding))
      .map((todo) => {
        const similarity = cosineSimilarity(queryEmbedding, todo.embedding);
        return this.mapToSearchResult(todo, similarity);
      })
      .filter(
        (result) =>
          result.similarity >= EMBEDDING_CONSTANTS.MIN_SIMILARITY_THRESHOLD,
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private isValidEmbedding(embedding: number[] | null): embedding is number[] {
    return (
      embedding !== null &&
      Array.isArray(embedding) &&
      embedding.length === EMBEDDING_CONSTANTS.DIMENSION
    );
  }

  private mapToSearchResult(
    todo: Todo,
    similarity: number,
  ): SemanticSearchResult {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      urgency: todo.urgency,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      similarity,
    };
  }
}
