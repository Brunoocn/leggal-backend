import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegisterService } from './register.service';
import { BadRequestException } from '@nestjs/common';
import { RegisterDTO } from '../../dtos/register-user.dto';
import { HashGenerator } from 'src/modules/cryptography/abstract/hash-generator';
import { InMemoryUserRepository } from 'src/test/repositories/in-memory-user-repository';

class HashGeneratorMock implements HashGenerator {
  public hashSpy = vi.fn();

  async hash(value: string): Promise<string> {
    this.hashSpy(value);
    return `hashed-${value}`;
  }
}

describe('RegisterService', () => {
  let sut: RegisterService;
  let userRepository: InMemoryUserRepository;
  let hashGenerator: HashGeneratorMock;

  const makeFakeUserData = (
    overrides: Partial<RegisterDTO> = {},
  ): RegisterDTO => ({
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: '123456',
    ...overrides,
  });

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashGenerator = new HashGeneratorMock();
    sut = new RegisterService(userRepository as any, hashGenerator);
  });

  it('should successfully register a new user', async () => {
    const userData = makeFakeUserData();

    const result = await sut.register(userData);

    expect(result).toMatchObject({
      id: expect.any(String),
      name: userData.name,
      email: userData.email,
    });
    expect(result).not.toHaveProperty('password');
  });

  it('should hash the password before saving', async () => {
    const userData = makeFakeUserData({ password: 'plaintext123' });

    await sut.register(userData);

    expect(hashGenerator.hashSpy).toHaveBeenCalledWith('plaintext123');
  });

  it('should throw BadRequestException when email is already registered', async () => {
    const userData = makeFakeUserData();
    await sut.register(userData);

    await expect(sut.register(userData)).rejects.toThrow(
      new BadRequestException('Email já cadastrado'),
    );
  });

  it('should throw BadRequestException when password is too short', async () => {
    const userData = makeFakeUserData({ password: '12345' });

    await expect(sut.register(userData)).rejects.toThrow(
      new BadRequestException('Senha deve ter no mínimo 6 caracteres'),
    );
  });
});
