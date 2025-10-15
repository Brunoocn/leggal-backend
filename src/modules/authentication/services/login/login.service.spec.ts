import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoginService } from './login.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from '../../dtos/login-user.dto';
import { HashComparer } from 'src/modules/cryptography/abstract/hash-comparer';
import { Encrypter } from 'src/modules/cryptography/abstract/encrypter';
import { InMemoryUserRepository } from 'src/test/repositories/in-memory-user-repository';
import { User } from 'src/modules/database/entities/user.entity';

class HashComparerMock implements HashComparer {
  public compareSpy = vi.fn();
  private shouldMatch = true;

  async compare(input: string, hashed: string): Promise<boolean> {
    this.compareSpy(input, hashed);
    return this.shouldMatch;
  }

  setShouldMatch(shouldMatch: boolean) {
    this.shouldMatch = shouldMatch;
  }
}

class EncrypterMock implements Encrypter {
  public encryptSpy = vi.fn();

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    this.encryptSpy(payload);
    return 'mocked_token';
  }
}

describe('LoginService', () => {
  let sut: LoginService;
  let userRepository: InMemoryUserRepository;
  let hashComparer: HashComparerMock;
  let encrypter: EncrypterMock;

  const makeFakeUser = (overrides: Partial<User> = {}): User => {
    const user = userRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'hashed_password',
      ...overrides,
    });
    return user;
  };

  const makeFakeLoginData = (overrides: Partial<LoginDTO> = {}): LoginDTO => ({
    email: 'johndoe@example.com',
    password: '123456',
    ...overrides,
  });

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashComparer = new HashComparerMock();
    encrypter = new EncrypterMock();
    sut = new LoginService(userRepository as any, hashComparer, encrypter);
  });

  it('should successfully login with valid credentials', async () => {
    const user = makeFakeUser();
    await userRepository.save(user);
    const loginData = makeFakeLoginData();

    const result = await sut.login(loginData);

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('user');
    expect(result.token).toBe('mocked_token');
    expect(result.user).toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
    });
    expect(result.user).not.toHaveProperty('password');
  });

  it('should call hashComparer with correct parameters', async () => {
    const user = makeFakeUser({ password: 'stored_hash' });
    await userRepository.save(user);
    const loginData = makeFakeLoginData({ password: 'plain_password' });

    await sut.login(loginData);

    expect(hashComparer.compareSpy).toHaveBeenCalledWith(
      'plain_password',
      'stored_hash',
    );
  });

  it('should throw NotFoundException when user does not exist', async () => {
    const loginData = makeFakeLoginData({ email: 'nonexistent@example.com' });

    await expect(sut.login(loginData)).rejects.toThrow(
      new NotFoundException('Usuario não encontrado'),
    );
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    const user = makeFakeUser();
    await userRepository.save(user);
    const loginData = makeFakeLoginData({ password: 'wrongpassword' });
    hashComparer.setShouldMatch(false);

    await expect(sut.login(loginData)).rejects.toThrow(
      new UnauthorizedException('Email e/ou senha inválidos'),
    );
  });
});
