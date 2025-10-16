import { Module } from '@nestjs/common';
import { ProvidersEnum } from 'src/shared/generic-enums/providers-enums';
import { OpenAiProvider } from './openai/implementations/openai-provider';

@Module({
  providers: [
    {
      provide: ProvidersEnum.OpenAiProvider,
      useClass: OpenAiProvider,
    },
  ],
  exports: [
    {
      provide: ProvidersEnum.OpenAiProvider,
      useClass: OpenAiProvider,
    },
  ],
})
export class ProvidersModule {}
