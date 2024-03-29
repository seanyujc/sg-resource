import "reflect-metadata";

export const singletonObjects: any[] = [];

/**
 * Create singleton Instance of Object
 * @param Type Object Type
 * @param args Parameters of the constructor
 */
export function createSingletonObject<T = any>(Type: T | any, ...args: any): T {
  let n: any = null;

  if (Type) {
    for (const o of singletonObjects.values()) {
      if (o instanceof Type) {
        n = o;
        break;
      }
    }

    if (n == null) {
      n = new Type(...args);
      singletonObjects.push(n);
    }
    return n;
  } else {
    return Type;
  }
}

/**
 * Decorator inject Instance of Object
 * @param target
 * @param key
 */
export function Autowired(target: any, key: string): void {
  const type = Reflect.getMetadata("design:type", target, key);
  const n = createSingletonObject(type);
  const getter = () => {
    if (n) {
      return n;
    } else {
      return () => {
        return null;
      };
    }
  };
  if (delete target[key]) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get: getter,
      set: undefined,
    });
  }
}
