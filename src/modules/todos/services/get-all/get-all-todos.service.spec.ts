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

    const result = await sut.findAll({});

    expect(result.list).toHaveLength(1);
    expect(result.list[0].title).toBe('First Todo');
    expect(result.list[0]).toHaveProperty('createdAt');
    expect(result.list[0]).toHaveProperty('updatedAt');
    expect(result.paging.total).toBe(1);
  });

  it('should return empty array when no todos exist', async () => {
    const result = await sut.findAll({});

    expect(result.list).toEqual([]);
    expect(result.paging.total).toBe(0);
  });

  it('should paginate todos correctly', async () => {
    for (let i = 1; i <= 15; i++) {
      const todo = todoRepository.create({
        title: `Todo ${i}`,
        description: `Description ${i}`,
        urgency: TodoUrgency.LOW,
      });
      await todoRepository.save(todo);
    }

    const firstPage = await sut.findAll({ page: 1, pageSize: 5 });
    expect(firstPage.list).toHaveLength(5);
    expect(firstPage.paging.total).toBe(15);
    expect(firstPage.paging.page).toBe(1);
    expect(firstPage.paging.pages).toBe(3);

    const secondPage = await sut.findAll({ page: 2, pageSize: 5 });
    expect(secondPage.list).toHaveLength(5);
    expect(secondPage.paging.total).toBe(15);
    expect(secondPage.paging.page).toBe(2);
    expect(secondPage.paging.pages).toBe(3);

    const thirdPage = await sut.findAll({ page: 3, pageSize: 5 });
    expect(thirdPage.list).toHaveLength(5);
    expect(thirdPage.paging.total).toBe(15);
    expect(thirdPage.paging.page).toBe(3);
    expect(thirdPage.paging.pages).toBe(3);
  });

  it('should return all todos when pagination params are not provided', async () => {
    for (let i = 1; i <= 5; i++) {
      const todo = todoRepository.create({
        title: `Todo ${i}`,
        description: `Description ${i}`,
        urgency: TodoUrgency.LOW,
      });
      await todoRepository.save(todo);
    }

    const result = await sut.findAll({});
    expect(result.list).toHaveLength(5);
    expect(result.paging.total).toBe(5);
  });
});
