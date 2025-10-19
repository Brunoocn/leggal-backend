import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreateTodoService } from '../services/create/create-todo.service';
import { GetAllTodosService } from '../services/get-all/get-all-todos.service';
import { GetOneTodoService } from '../services/get-one/get-one-todo.service';
import { UpdateTodoService } from '../services/update/update-todo.service';
import { DeleteTodoService } from '../services/delete/delete-todo.service';
import { CreateTodoWithAiService } from '../services/create-with-ai/create-todo-with-ai.service';
import { SemanticSearchService } from '../services/semantic-search/semantic-search.service';
import { CreateTodoDTO } from '../dtos/create-todo.dto';
import { UpdateTodoDTO } from '../dtos/update-todo.dto';
import { TodoDTO } from '../dtos/todo.dto';
import { CreateTodoWithAiDTO } from '../dtos/create-todo-with-ai.dto';
import { SemanticSearchDTO } from '../dtos/semantic-search.dto';
import { FindAllTodosDTO } from '../dtos/find-all.dto';

@ApiTags('Todos')
@ApiBearerAuth()
@Controller('todos')
export class TodosController {
  constructor(
    private readonly createTodoService: CreateTodoService,
    private readonly getAllTodosService: GetAllTodosService,
    private readonly getOneTodoService: GetOneTodoService,
    private readonly updateTodoService: UpdateTodoService,
    private readonly deleteTodoService: DeleteTodoService,
    private readonly createTodoWithAiService: CreateTodoWithAiService,
    private readonly semanticSearchService: SemanticSearchService,
  ) {}

  @ApiOperation({ summary: 'Criar um novo todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo criado com sucesso',
    type: TodoDTO,
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTodoDTO: CreateTodoDTO) {
    return this.createTodoService.create(createTodoDTO);
  }

  @ApiOperation({ summary: 'Criar um novo todo usando IA' })
  @ApiResponse({
    status: 201,
    description: 'Todo criado com sucesso usando IA',
    type: TodoDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Falha ao processar entrada da IA',
  })
  @Post('ai')
  @HttpCode(HttpStatus.CREATED)
  async createWithAi(@Body() createTodoWithAiDTO: CreateTodoWithAiDTO) {
    return this.createTodoWithAiService.createWithAi(
      createTodoWithAiDTO.userMessage,
    );
  }

  @ApiOperation({ summary: 'Busca semântica de todos usando IA' })
  @ApiResponse({
    status: 200,
    description: 'Todos encontrados por similaridade semântica',
    type: [TodoDTO],
  })
  @Get('search/semantic')
  @HttpCode(HttpStatus.OK)
  async searchSemantic(@Query() searchDTO: SemanticSearchDTO) {
    return this.semanticSearchService.search(searchDTO.query, searchDTO.limit);
  }

  @ApiOperation({ summary: 'Listar todos os todos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos retornada com sucesso',
    type: [TodoDTO],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() findAllDTO: FindAllTodosDTO) {
    return this.getAllTodosService.findAll(findAllDTO);
  }

  @ApiOperation({ summary: 'Buscar um todo por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do todo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo encontrado com sucesso',
    type: TodoDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Todo não encontrado',
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.getOneTodoService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar um todo' })
  @ApiParam({
    name: 'id',
    description: 'ID do todo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Todo atualizado com sucesso',
    type: TodoDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Todo não encontrado',
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateTodoDTO: UpdateTodoDTO) {
    return this.updateTodoService.update(id, updateTodoDTO);
  }

  @ApiOperation({ summary: 'Deletar um todo' })
  @ApiParam({
    name: 'id',
    description: 'ID do todo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Todo deletado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Todo não encontrado',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.deleteTodoService.remove(id);
  }
}
