/** Indexed access for arrays whose length is known at build time. Throws instead of returning undefined. */
export function at<T>(items: readonly T[], index: number): T {
  const item = items[index];
  if (item === undefined) {
    throw new RangeError(`Index ${index} is out of range for length ${items.length}`);
  }
  return item;
}
