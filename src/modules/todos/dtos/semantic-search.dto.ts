import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SemanticSearchDTO {
  @ApiProperty({
    example: 'comprar frutas',
    description: 'Texto de busca para encontrar tarefas similares',
  })
  @IsString()
  @IsNotEmpty()
  readonly query: string;

  @ApiProperty({
    example: 10,
    description: 'Número máximo de resultados a retornar',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  readonly limit?: number = 10;
}
