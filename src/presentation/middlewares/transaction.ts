import { Context, Next } from 'hono';
import { ITransaction } from '../../infrastructure/database/IRepository';
import { sqliteClient } from '../../infrastructure/database/SQLiteClient';

export const TRANSACTION_KEY = 'transaction';

export const transactionMiddleware = async (c: Context, next: Next) => {
  const transaction: ITransaction = sqliteClient.beginTransaction();

  c.set(TRANSACTION_KEY, transaction);

  try {
    await next();

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    
    throw error;
  }
};

export const getTransaction = (c: Context): ITransaction | undefined => {
  return c.get(TRANSACTION_KEY) as ITransaction | undefined;
};
