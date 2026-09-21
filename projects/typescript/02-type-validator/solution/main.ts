// 02-type-validator (solution)
declare const require: any;
declare const process: any;
const readline = require('readline');

abstract class BaseSchema<T> {
  abstract parse(val: unknown): { success: true; data: T } | { success: false; error: string };
}

class StringSchema extends BaseSchema<string> {
  parse(val: unknown) {
    if (typeof val === 'string') return { success: true as const, data: val };
    return { success: false as const, error: 'Expected string' };
  }
}

class NumberSchema extends BaseSchema<number> {
  parse(val: unknown) {
    if (typeof val === 'number' && !isNaN(val)) return { success: true as const, data: val };
    return { success: false as const, error: 'Expected number' };
  }
}

class ObjectSchema<T extends Record<string, BaseSchema<any>>> extends BaseSchema<any> {
  shape: T;
  constructor(shape: T) {
    super();
    this.shape = shape;
  }

  parse(val: unknown) {
    if (typeof val !== 'object' || val === null) {
      return { success: false as const, error: 'Expected object' };
    }
    const obj = val as Record<string, unknown>;
    const res: Record<string, any> = {};
    for (const [key, schema] of Object.entries(this.shape)) {
      const fieldRes = schema.parse(obj[key]);
      if (!fieldRes.success) {
        return { success: false as const, error: `${key}: ${fieldRes.error}` };
      }
      res[key] = fieldRes.data;
    }
    return { success: true as const, data: res };
  }
}

const z = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  object: <T extends Record<string, BaseSchema<any>>>(shape: T) => new ObjectSchema(shape)
};

function main(): void {
  const userSchema = z.object({
    name: z.string(),
    age: z.number()
  });

  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (line: string) => {
    line = line.trim();
    if (!line) return;
    try {
      const data = JSON.parse(line);
      const res = userSchema.parse(data);
      if (res.success) {
        console.log(`VALID: ${res.data.name} (${res.data.age})`);
      } else {
        console.log(`INVALID: ${res.error}`);
      }
    } catch {
      console.log('INVALID: JSON parse error');
    }
  });
}

main();
