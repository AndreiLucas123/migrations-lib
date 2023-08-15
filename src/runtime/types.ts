//
//

export type Migration<T> = {
  file: string;
  migration: string | ((db: T) => void);
};
