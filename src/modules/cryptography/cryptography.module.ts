import { Module } from '@nestjs/common';
import { Encrypter } from './abstract/encrypter';
import { HashComparer } from './abstract/hash-comparer';
import { HashGenerator } from './abstract/hash-generator';
import { BcryptHasher } from './implements/bcript-hasher';
import { JwtEncrypter } from './implements/jwt-encrypter';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashComparer,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
    JwtService,
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
