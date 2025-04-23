import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app/app.module';
import session from 'express-session';
import passport from 'passport';
import pgSession from 'connect-pg-simple';
import pg from 'pg';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getEnvValue } from '@paris-2024/server-utils';
import { OriginGuard } from '@paris-2024/server-security-guards';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,{
    logger: ['error', 'warn', 'debug'],
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

  const isProduction = process.env.NODE_ENV === 'production';

  const configService = new ConfigService;

  const pgPool = new pg.Pool({
    host: getEnvValue(configService, 'DB_HOST'),
    user: getEnvValue(configService, 'DB_USER'),
    database: getEnvValue(configService, 'DB_NAME'),
    password: getEnvValue(configService, 'DB_PASSWORD'),
/*
  set ssl to true in production if application needs to be reached
  from outside the docker network || without traefik / nginx rerouting
*/
    ssl: false,
  });
  
  const allowedOrigins = isProduction
    ? [
      'https://studi-exam-jo.lois-kouninef.eu', 
      'https://studi-exam-jo-staging.lois-kouninef.eu',
      ]
    : ['http://localhost:8090'];

  app.enableCors({
    methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Origin, Set-Cookie, X-Guest-Token',
    origin: allowedOrigins,
    credentials: true,
  });

  app.use(
    session({
      store: new (pgSession(session))({
        pool: pgPool,
        createTableIfMissing: true,
      }),
      secret: getEnvValue(configService, 'SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction ? true : false,
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
        domain: isProduction ? '.lois-kouninef.eu' : 'localhost'
      },
    }),
  );
  
  app.set('trust proxy', 1);

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalGuards(new OriginGuard());
  app.useGlobalPipes(new ValidationPipe());

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('Paris 2024 Online Booking Service API')
    // TODO: write description
    .setDescription('Tickets booking.')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      supportedSubmitMethods: isProduction 
        ? [] 
        : ['get', 'post', 'patch', 'put', 'delete']
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
