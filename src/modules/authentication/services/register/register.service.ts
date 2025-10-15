import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/modules/database/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDTO } from '../../dtos/register-user.dto';
import { HashGenerator } from 'src/modules/cryptography/abstract/hash-generator';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private hashGenerator: HashGenerator,
  ) {}

  async register({ name, email, password }: RegisterDTO) {
    const userExists = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (userExists) {
      throw new BadRequestException('Email já cadastrado');
    }

    if (!this.isPasswordLengthValid(password)) {
      throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private isPasswordLengthValid(password: string): boolean {
    return password.length >= 6;
  }

  private async hashPassword(password: string) {
    const hashedPassword = await this.hashGenerator.hash(password);

    return hashedPassword;
  }
}
