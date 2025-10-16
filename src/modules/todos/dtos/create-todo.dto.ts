import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

export class CreateTodoDTO {
  @ApiProperty({
    example: 'Finalizar relatório',
    description: 'Título do todo',
  })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({
    example: 'Finalizar o relatório mensal até sexta-feira',
    description: 'Descrição do todo',
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiProperty({
    example: 'high',
    description: 'Urgência do todo',
    enum: TodoUrgency,
    default: TodoUrgency.LOW,
  })
  @IsEnum(TodoUrgency)
  @IsOptional()
  readonly urgency?: TodoUrgency;
}
