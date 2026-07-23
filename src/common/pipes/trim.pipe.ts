import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (
      metadata.type !== 'body' ||
      typeof value !== 'object' ||
      value === null
    ) {
      return value;
    }

    const obj = value as Record<string, unknown>;
    const trimmed: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(obj)) {
      trimmed[key] = typeof val === 'string' ? val.trim() : val;
    }

    return trimmed;
  }
}
