import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';
import { plural } from 'pluralize';

export class PluralNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(targetName: string, userSpecifiedName?: string): string {
    return userSpecifiedName || plural(targetName);
  }
}
