import 'dotenv/config'; // this loads .env variables globally
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './auth/entity/user.entity';
import { Client } from './client/entities/client.entity';
import { AccountVerification } from './auth/entity/account-verification.entity';
import { Counselor } from './counselor/entities/counselor.entity';
import { Rating } from './counselor/entities/rating.entity';
import { Article } from './counselor/entities/article.entity';
import { Availability } from './counselor/entities/availability.entity';
import { Booking } from './client/entities/booking.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'unityCounsultancyy',
  synchronize: true,
  logging: true,
  entities: [
    User,
    Client,
    AccountVerification,
    Counselor,
    Rating,
    Article,
    Availability,
    Booking,
  ],
  migrations: [],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
