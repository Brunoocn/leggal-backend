import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email do usuario',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'strongpassword123',
    description: 'Senha do usuario',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
