import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './shared/user.module';
import { ClientModule } from './client/client.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from './client/services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './client/controllers/auth.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
