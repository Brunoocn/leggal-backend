import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { SkipAuth } from 'src/common/decorators/skipAuth.decorator';
import { LoginDTO } from '../dtos/login-user.dto';

import { LoginService } from '../services/login/login.service';

import { RegisterDTO } from '../dtos/register-user.dto';
import { LoginResponseDTO } from '../dtos/login-response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterResponseDTO } from '../dtos/register-response.dto';
import { UserDTO } from '../dtos/user.dto';
import { RegisterService } from '../services/register/register.service';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly loginService: LoginService,
    private readonly registerService: RegisterService,
  ) {}

  @ApiOperation({ summary: 'Verifica se o token está valido' })
  @Get('/token-valid')
  @HttpCode(HttpStatus.OK)
  async validToken(): Promise<boolean> {
    return true;
  }

  @ApiOperation({ summary: 'Login de Usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario logado com sucesso',
    type: LoginResponseDTO,
  })
  @SkipAuth()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @Body() { email, password }: LoginDTO,
  ): Promise<LoginResponseDTO> {
    return this.loginService.login({ email, password });
  }

  @ApiOperation({ summary: 'Registro de Usuario' })
  @ApiBody({ type: LoginDTO })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado com sucesso',
    type: RegisterResponseDTO,
  })
  @ApiBody({ type: RegisterDTO })
  @SkipAuth()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(
    @Body() { name, email, password }: RegisterDTO,
  ): Promise<UserDTO> {
    return this.registerService.register({ name, email, password });
  }
}
