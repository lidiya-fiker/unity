import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './shared/user.module';
import { ClientModule } from './client/client.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => dataSourceOptions }),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
        },
      }),
    }),
    UserModule,
    ClientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
