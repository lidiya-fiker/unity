import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './auth/entity/user.entity';
import { Client } from './client/entities/client.entity';
import { AccountVerification } from './auth/entity/account-verification.entity';
import { Counselor } from './counselor/entities/counselor.entity';
import { Rating } from './counselor/entities/rating.entity';
import { Article } from './counselor/entities/article.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'kidiya',
  database: 'unityCounsultancyy',
  synchronize: true,
  logging: true,
  entities: [User, Client, AccountVerification, Counselor, Rating, Article],
  migrations: [],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
