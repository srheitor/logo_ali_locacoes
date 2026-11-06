export * from './masks';
export * from './validators';
export * from './formatters';
export * from './geo';
export * from './id';

/** Concatena classes CSS ignorando valores falsos. */
export const cn = (...classes: Array<string | number | false | null | undefined>) => classes.filter(Boolean).join(' ');
