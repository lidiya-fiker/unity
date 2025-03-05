import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './shared/entites/user.entity';
import { Client } from './client/entities/client.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'kidiya',
  database: 'unityConsultancy',
  synchronize: true,
  logging: true,
  entities: [User, Client],
  migrations: [],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
