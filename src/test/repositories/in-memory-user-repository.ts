import { randomUUID } from 'node:crypto';
import { User } from 'src/modules/database/entities/user.entity';

export class InMemoryUserRepository {
  private users: User[] = [];

  async findOne(options: {
    where: { email?: string; id?: string };
  }): Promise<User | null> {
    const { email, id } = options.where;

    if (email) {
      return this.users.find((user) => user.email === email) || null;
    }

    if (id) {
      return this.users.find((user) => user.id === id) || null;
    }

    return null;
  }

  async find(): Promise<User[]> {
    return [...this.users];
  }

  create(data: { name: string; email: string; password: string }): User {
    const user = new User();
    user.id = randomUUID();
    user.name = data.name;
    user.email = data.email;
    user.password = data.password;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
  }

  async save(user: User): Promise<User> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);

    if (existingIndex >= 0) {
      const updatedUser = this.users[existingIndex];
      updatedUser.name = user.name;
      updatedUser.email = user.email;
      updatedUser.password = user.password;
      updatedUser.updatedAt = new Date();
      return updatedUser;
    }

    this.users.push(user);
    return user;
  }

  async remove(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);

    if (index >= 0) {
      this.users.splice(index, 1);
    }

    return user;
  }

  createQueryBuilder() {
    return {
      where: (condition: string, params: any) => ({
        getMany: async () => {
          const emails = params.emails;
          return this.users.filter((user) => emails.includes(user.email));
        },
      }),
    };
  }
}
