import { ValueTransformer } from 'typeorm';

export class EmbeddingTransformer implements ValueTransformer {
  to(value: number[] | null): string | null {
    if (!value || !Array.isArray(value)) {
      return null;
    }
    return JSON.stringify(value);
  }

  from(value: string | null): number[] | null {
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}
