import { registerAs } from '@nestjs/config';
import type { ConfigService } from '@nestjs/config';
import Joi, { type ObjectSchema } from 'joi';

const nodeEnvValues = ['development', 'production', 'test'] as const;

export const envValidationSchema: ObjectSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...nodeEnvValues)
    .required(),

  PORT: Joi.number().port().required(),

  MYSQL_HOST: Joi.string().trim().min(1).required(),
  MYSQL_PORT: Joi.alternatives()
    .try(Joi.number().port(), Joi.string().pattern(/^\d+$/))
    .required(),
  MYSQL_USER: Joi.string().trim().min(1).required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string().trim().min(1).required(),

  REDIS_HOST: Joi.string().trim().min(1).required(),
  REDIS_PORT: Joi.alternatives()
    .try(Joi.number().port(), Joi.string().pattern(/^\d+$/))
    .required(),

  JWT_SECRET: Joi.string().trim().min(1).required(),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'log', 'debug', 'verbose')
    .optional(),

  GRAPHQL_PLAYGROUND: Joi.boolean()
    .truthy('true', '1', 'yes')
    .falsy('false', '0', 'no', '')
    .optional(),
});

export type AppConfig = {
  nodeEnv: (typeof nodeEnvValues)[number];
  port: number;
  mysql: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  redis: {
    host: string;
    port: number;
  };
  jwtSecret: string;
  logLevel?: string;
  graphqlPlayground?: boolean;
};

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: process.env.NODE_ENV as AppConfig['nodeEnv'],
    port: Number(process.env.PORT),
    mysql: {
      host: process.env.MYSQL_HOST!,
      port: Number(process.env.MYSQL_PORT),
      user: process.env.MYSQL_USER!,
      password: process.env.MYSQL_PASSWORD!,
      database: process.env.MYSQL_DATABASE!,
    },
    redis: {
      host: process.env.REDIS_HOST!,
      port: Number(process.env.REDIS_PORT),
    },
    jwtSecret: process.env.JWT_SECRET!,
    logLevel: process.env.LOG_LEVEL,
    graphqlPlayground:
      process.env.GRAPHQL_PLAYGROUND === undefined
        ? undefined
        : ['true', '1', 'yes'].includes(
            process.env.GRAPHQL_PLAYGROUND.toLowerCase(),
          ),
  }),
);

export function getEnv(config: ConfigService): AppConfig {
  return config.getOrThrow<AppConfig>('app');
}
