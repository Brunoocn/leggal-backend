import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { EmbeddingTransformer } from 'src/modules/todos/utils/embedding.transformer';
import { Exclude } from 'class-transformer';

export enum TodoUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity()
export class Todo extends BaseEntity {
  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TodoUrgency,
    default: TodoUrgency.LOW,
  })
  urgency: TodoUrgency;

  @Exclude()
  @Column({
    type: 'text',
    nullable: true,
    transformer: new EmbeddingTransformer(),
    select: false,
  })
  embedding: number[] | null;
}
