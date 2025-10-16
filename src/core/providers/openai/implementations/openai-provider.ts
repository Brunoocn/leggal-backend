import { Injectable } from '@nestjs/common';

import { IOpenAiProvider } from '../IOpenAiProvider';
import OpenAI from 'openai';

@Injectable()
export class OpenAiProvider implements IOpenAiProvider {
  private openAi: OpenAI;
  private maxTokens = 1000;

  constructor() {
    this.openAi = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateCompletion(prompt: string, message: string): Promise<string> {
    const completion = await this.openAi.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: this.maxTokens,
    });

    return completion.choices[0]?.message?.content || '';
  }
}
