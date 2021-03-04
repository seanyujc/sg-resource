import "reflect-metadata";

export const singletonObjects: any[] = [];

/**
 * create singleton Object
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

export function Autowired(target: any, key: string) {
  const type = Reflect.getMetadata("design:type", target, key);
  let n: any = createSingletonObject(type);
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
