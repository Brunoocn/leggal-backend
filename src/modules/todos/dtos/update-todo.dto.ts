import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

export class UpdateTodoDTO {
  @ApiProperty({
    example: 'Finalizar relatório',
    description: 'Título do todo',
    required: true,
  })
  @IsString()
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
    required: true,
  })
  @IsEnum(TodoUrgency)
  readonly urgency: TodoUrgency;
}
