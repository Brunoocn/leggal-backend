import { compare, hash } from 'bcrypt';
import { HashGenerator } from '../abstract/hash-generator';
import { HashComparer } from '../abstract/hash-comparer';

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 10;

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash);
  }
}
