import { randomUUID } from 'node:crypto';
import { Todo } from 'src/modules/database/entities/todo.entity';

export class InMemoryTodoRepository {
  private todos: Todo[] = [];

  async findOne(options: { where: { id: string } }): Promise<Todo | null> {
    const { id } = options.where;
    return this.todos.find((todo) => todo.id === id) || null;
  }

  async find(options?: {
    order?: { createdAt: 'DESC' | 'ASC' };
    skip?: number;
    take?: number;
  }): Promise<Todo[]> {
    let result = [...this.todos];

    if (options?.order?.createdAt === 'DESC') {
      result = result.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }

    if (options?.skip !== undefined) {
      result = result.slice(options.skip);
    }

    if (options?.take !== undefined) {
      result = result.slice(0, options.take);
    }

    return result;
  }

  async findAndCount(options?: {
    where?: { user?: { id: string } };
    order?: { createdAt: 'DESC' | 'ASC' };
    skip?: number;
    take?: number;
  }): Promise<[Todo[], number]> {
    let filteredTodos = [...this.todos];

    // Filtrar por user.id se fornecido
    if (options?.where?.user?.id) {
      filteredTodos = filteredTodos.filter(
        (todo) => todo.user?.id === options.where.user.id,
      );
    }

    const total = filteredTodos.length;

    // Aplicar ordenação
    if (options?.order?.createdAt === 'DESC') {
      filteredTodos = filteredTodos.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }

    // Aplicar paginação
    if (options?.skip !== undefined) {
      filteredTodos = filteredTodos.slice(options.skip);
    }

    if (options?.take !== undefined) {
      filteredTodos = filteredTodos.slice(0, options.take);
    }

    return [filteredTodos, total];
  }

  create(data: { title: string; description?: string; urgency?: any }): Todo {
    const todo = new Todo();
    todo.id = randomUUID();
    todo.title = data.title;
    todo.description = data.description;
    todo.urgency = data.urgency;
    todo.createdAt = new Date();
    todo.updatedAt = new Date();
    return todo;
  }

  async save(todo: Todo): Promise<Todo> {
    const existingIndex = this.todos.findIndex((t) => t.id === todo.id);

    if (existingIndex >= 0) {
      const updatedTodo = this.todos[existingIndex];
      updatedTodo.title = todo.title;
      updatedTodo.description = todo.description;
      updatedTodo.urgency = todo.urgency;
      updatedTodo.updatedAt = new Date();
      return updatedTodo;
    }

    this.todos.push(todo);
    return todo;
  }

  async remove(todo: Todo): Promise<void> {
    const index = this.todos.findIndex((t) => t.id === todo.id);
    if (index >= 0) {
      this.todos.splice(index, 1);
    }
  }
}
