import { DataSource, DataSourceOptions } from 'typeorm';
import { Account } from './account/entities/account.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'kidiya',
  database: 'unity',
  synchronize: true,
  logging: true,
  entities: [Account],
  migrations: [],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
