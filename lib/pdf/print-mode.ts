import { AsyncLocalStorage } from "node:async_hooks";

/**
 * While the PDF renderer prerenders article components, interactive client pieces can't run
 * in the server layer. Components check this and leave them out; the PDF carries each diagram's
 * written description instead.
 */
const store = new AsyncLocalStorage<true>();

export const isPrinting = () => store.getStore() === true;
export const whilePrinting = <T,>(fn: () => Promise<T>) => store.run(true, fn);
