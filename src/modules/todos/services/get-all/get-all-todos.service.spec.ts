import { describe, it, expect, beforeEach } from 'vitest';
import { GetAllTodosService } from './get-all-todos.service';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

describe('GetAllTodosService', () => {
  let sut: GetAllTodosService;
  let todoRepository: InMemoryTodoRepository;

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();
    sut = new GetAllTodosService(todoRepository as any);
  });

  it('should return all todos ordered by createdAt DESC', async () => {
    const todo1 = todoRepository.create({
      title: 'First Todo',
      description: 'Description 1',
      urgency: TodoUrgency.LOW,
    });
    await todoRepository.save(todo1);

    const result = await sut.findAll();

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('First Todo');
    expect(result[0]).toHaveProperty('createdAt');
    expect(result[0]).toHaveProperty('updatedAt');
  });

  it('should return empty array when no todos exist', async () => {
    const result = await sut.findAll();

    expect(result).toEqual([]);
  });
});
