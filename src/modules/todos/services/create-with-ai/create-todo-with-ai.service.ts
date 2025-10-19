import {
  Inject,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo, TodoUrgency } from 'src/modules/database/entities/todo.entity';
import { ProvidersEnum } from 'src/shared/generic-enums/providers-enums';
import { AI_PROMPT } from './prompts/ai-prompt';
import { IOpenAiProvider } from 'src/core/providers/openai/IOpenAiProvider';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';

@Injectable()
export class CreateTodoWithAiService {
  private readonly logger = new Logger(CreateTodoWithAiService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    @Inject(ProvidersEnum.OpenAiProvider)
    private readonly openAiProvider: IOpenAiProvider,
    private readonly generateEmbeddingService: GenerateEmbeddingService,
  ) {}

  async createWithAi(userMessage: string, userId: string): Promise<Todo> {
    try {
      const aiResponse = await this.openAiProvider.generateCompletion(
        AI_PROMPT,
        userMessage,
      );

      const todoData = this.parseAiResponse(aiResponse);

      const todo = this.todoRepository.create({
        title: todoData.title,
        description: todoData.description,
        urgency: todoData.urgency,
        user: { id: userId },
      });

      todo.embedding = await this.generateEmbeddingService.generateForTodo(
        todo,
      );

      return this.todoRepository.save(todo);
    } catch (error) {
      this.logger.error(`Failed to create todo with AI: ${error.message}`);
      throw new BadRequestException(
        `Failed to create todo with AI: ${error.message}`,
      );
    }
  }

  private parseAiResponse(aiResponse: string): {
    title: string;
    description: string;
    urgency: TodoUrgency;
  } {
    try {
      const parsed = JSON.parse(aiResponse);

      return {
        title: parsed.title,
        description: parsed.description,
        urgency: parsed.urgency,
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}
