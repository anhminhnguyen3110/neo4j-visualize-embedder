export interface ITransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface IRepository<T> {
  beginTransaction(): Promise<ITransaction>;
  findById(id: string, transaction?: ITransaction): Promise<T | null>;
  create(data: Partial<T>, transaction?: ITransaction): Promise<T>;
  update(id: string, data: Partial<T>, transaction?: ITransaction): Promise<T>;
  delete(id: string, transaction?: ITransaction): Promise<boolean>;
}
