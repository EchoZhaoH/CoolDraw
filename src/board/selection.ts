export const mergeSelectionIds = (base: string[], hitIds: string[]) =>
  Array.from(new Set([...base, ...hitIds]));
