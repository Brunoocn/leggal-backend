import { describe, it, expect, beforeEach } from 'vitest';
import { GetAllTodosService } from './get-all-todos.service';
import { InMemoryTodoRepository } from 'src/test/repositories/in-memory-todo-repository';
import { TodoUrgency } from 'src/modules/database/entities/todo.entity';

describe('GetAllTodosService', () => {
  let sut: GetAllTodosService;
  let todoRepository: InMemoryTodoRepository;
  const userId = 'user-123';
  const anotherUserId = 'user-456';

  beforeEach(() => {
    todoRepository = new InMemoryTodoRepository();
    sut = new GetAllTodosService(todoRepository as any);
  });

  it('should return all todos for the user ordered by createdAt DESC', async () => {
    const todo1 = todoRepository.create({
      title: 'First Todo',
      description: 'Description 1',
      urgency: TodoUrgency.LOW,
    });
    todo1.user = { id: userId } as any;
    await todoRepository.save(todo1);

    const result = await sut.findAll({}, userId);

    expect(result.list).toHaveLength(1);
    expect(result.list[0].title).toBe('First Todo');
    expect(result.list[0]).toHaveProperty('createdAt');
    expect(result.list[0]).toHaveProperty('updatedAt');
    expect(result.paging.total).toBe(1);
  });

  it('should return empty array when no todos exist for the user', async () => {
    const result = await sut.findAll({}, userId);

    expect(result.list).toEqual([]);
    expect(result.paging.total).toBe(0);
  });

  it('should only return todos for the specified user', async () => {
    const todo1 = todoRepository.create({
      title: 'User 1 Todo',
      description: 'Description 1',
      urgency: TodoUrgency.LOW,
    });
    todo1.user = { id: userId } as any;
    await todoRepository.save(todo1);

    const todo2 = todoRepository.create({
      title: 'User 2 Todo',
      description: 'Description 2',
      urgency: TodoUrgency.HIGH,
    });
    todo2.user = { id: anotherUserId } as any;
    await todoRepository.save(todo2);

    const result = await sut.findAll({}, userId);

    expect(result.list).toHaveLength(1);
    expect(result.list[0].title).toBe('User 1 Todo');
    expect(result.paging.total).toBe(1);
  });

  it('should paginate todos correctly for the user', async () => {
    // Criar 15 todos para o usuário
    for (let i = 1; i <= 15; i++) {
      const todo = todoRepository.create({
        title: `Todo ${i}`,
        description: `Description ${i}`,
        urgency: TodoUrgency.LOW,
      });
      todo.user = { id: userId } as any;
      await todoRepository.save(todo);
    }

    // Criar 5 todos para outro usuário (não devem aparecer)
    for (let i = 1; i <= 5; i++) {
      const todo = todoRepository.create({
        title: `Another User Todo ${i}`,
        description: `Description ${i}`,
        urgency: TodoUrgency.LOW,
      });
      todo.user = { id: anotherUserId } as any;
      await todoRepository.save(todo);
    }

    const firstPage = await sut.findAll({ page: 1, pageSize: 5 }, userId);
    expect(firstPage.list).toHaveLength(5);
    expect(firstPage.paging.total).toBe(15);
    expect(firstPage.paging.page).toBe(1);
    expect(firstPage.paging.pages).toBe(3);

    const secondPage = await sut.findAll({ page: 2, pageSize: 5 }, userId);
    expect(secondPage.list).toHaveLength(5);
    expect(secondPage.paging.total).toBe(15);
    expect(secondPage.paging.page).toBe(2);
    expect(secondPage.paging.pages).toBe(3);

    const thirdPage = await sut.findAll({ page: 3, pageSize: 5 }, userId);
    expect(thirdPage.list).toHaveLength(5);
    expect(thirdPage.paging.total).toBe(15);
    expect(thirdPage.paging.page).toBe(3);
    expect(thirdPage.paging.pages).toBe(3);
  });

  it('should return all todos for the user when pagination params are not provided', async () => {
    for (let i = 1; i <= 5; i++) {
      const todo = todoRepository.create({
        title: `Todo ${i}`,
        description: `Description ${i}`,
        urgency: TodoUrgency.LOW,
      });
      todo.user = { id: userId } as any;
      await todoRepository.save(todo);
    }

    const result = await sut.findAll({}, userId);
    expect(result.list).toHaveLength(5);
    expect(result.paging.total).toBe(5);
  });
});
