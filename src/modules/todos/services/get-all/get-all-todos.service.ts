import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from 'src/modules/database/entities/todo.entity';
import { FindAllTodosDTO } from '../../dtos/find-all.dto';
import { getTotalPages } from 'src/shared/pagination/get-total-pages';
import { getSkip } from 'src/shared/pagination/get-offset';

@Injectable()
export class GetAllTodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async findAll({ page = 1, pageSize = 10 }: FindAllTodosDTO): Promise<{
    list: Todo[];
    paging: { total: number; page?: number; pages?: number };
  }> {
    const [data, total] = await this.todoRepository.findAndCount({
      skip: getSkip({ page, pageSize }),
      take: pageSize,
      order: { createdAt: 'DESC' },
    });

    return {
      list: data,
      paging: {
        total,
        page,
        pages: getTotalPages({ total, pageSize }),
      },
    };
  }
}
