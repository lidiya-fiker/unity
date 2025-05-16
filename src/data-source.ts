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
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'samr1493',
  database: 'unityCounsultancyy',
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
