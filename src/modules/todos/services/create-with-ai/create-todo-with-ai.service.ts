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
import { OpenAiProvider } from 'src/core/providers/openai/implementations/openai-provider';
import { GenerateEmbeddingService } from '../generate-embedding/generate-embedding.service';

@Injectable()
export class CreateTodoWithAiService {
  private readonly logger = new Logger(CreateTodoWithAiService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    @Inject(ProvidersEnum.OpenAiProvider)
    private readonly openAiProvider: OpenAiProvider,
    private readonly generateEmbeddingService: GenerateEmbeddingService,
  ) {}

  async createWithAi(userMessage: string): Promise<Todo> {
    try {
      this.logger.debug(`Creating todo from AI input: "${userMessage}"`);

      const aiResponse = await this.openAiProvider.generateCompletion(
        AI_PROMPT,
        userMessage,
      );

      const todoData = this.parseAiResponse(aiResponse);

      const todo = this.todoRepository.create({
        title: todoData.title,
        description: todoData.description,
        urgency: todoData.urgency,
      });

      todo.embedding = await this.generateEmbeddingService.generateForTodo(
        todo,
      );

      const savedTodo = await this.todoRepository.save(todo);

      this.logger.debug(`Successfully created todo with AI: ${savedTodo.id}`);

      return savedTodo;
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

      if (!parsed.title || parsed.title.trim() === '') {
        throw new Error('AI response missing required field: title');
      }

      return {
        title: parsed.title,
        description: parsed.description || '',
        urgency: parsed.urgency || 'low',
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }
}
