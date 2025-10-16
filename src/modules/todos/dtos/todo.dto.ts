import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

export class TodoDTO {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID único do todo',
  })
  @IsUUID()
  @IsNotEmpty()
  readonly id: string;

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
  readonly description?: string;

  @ApiProperty({
    example: 'high',
    description: 'Urgência do todo',
    enum: TodoUrgency,
  })
  @IsEnum(TodoUrgency)
  @IsNotEmpty()
  readonly urgency: TodoUrgency;
}
