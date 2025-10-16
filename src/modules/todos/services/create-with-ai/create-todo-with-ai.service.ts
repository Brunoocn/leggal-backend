import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { ProvidersEnum } from 'src/shared/generic-enums/providers-enums';
import { AI_PROMPT } from './prompts/ai-prompt';
import { OpenAiProvider } from 'src/core/providers/openai/implementations/openai-provider';

@Injectable()
export class CreateTodoWithAiService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    @Inject(ProvidersEnum.OpenAiProvider)
    private openAiProvider: OpenAiProvider,
  ) {}

  async createWithAi(userMessage: string): Promise<Todo> {
    try {
      const aiResponse = await this.openAiProvider.generateCompletion(
        AI_PROMPT,
        userMessage,
      );

      const todoData: Todo = JSON.parse(aiResponse);

      const todo = this.todoRepository.create({
        title: todoData.title,
        description: todoData.description,
        urgency: todoData.urgency,
      });

      return this.todoRepository.save(todo);
    } catch (error) {
      throw new Error('Failed to create todo with AI: ' + error.message);
    }
  }
}
