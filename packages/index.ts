/// <reference types="../typings" />
import { Autowired, createSingletonObject } from "./decorator";
import { ensureInitialized } from "./normal";
import { ensureInitialized as ensureInitializedWx } from "./weapp";

export {
  ensureInitialized,
  ensureInitializedWx,
  createSingletonObject,
  Autowired,
};
