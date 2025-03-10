import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './shared/entities/user.entity';
import { Client } from './client/entities/client.entity';
import { AccountVerification } from './client/entities/account-verification.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'kidiya',
  database: 'unityConsultancyy',
  synchronize: true,
  logging: true,
  entities: [User, Client,AccountVerification],
  migrations: [],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
