import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoWithAiDTO {
  @ApiProperty({
    example: 'fazer um bolo',
    description: 'Descrição natural da tarefa que será processada pela IA',
  })
  @IsString()
  @IsNotEmpty()
  readonly userMessage: string;
}
