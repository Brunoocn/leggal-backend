import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDTO {
  @ApiProperty({
    example: 'John Doe',
    description: 'Nome do usuario',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email do usuario',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'Senha do usuario',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
