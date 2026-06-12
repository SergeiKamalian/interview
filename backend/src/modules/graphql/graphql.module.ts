import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';
import { getEnv } from '../../common/config/env.schema';
import { HelloResolver } from './hello.resolver';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = getEnv(configService);
        const playgroundEnabled =
          env.graphqlPlayground ?? env.nodeEnv === 'development';

        return {
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: playgroundEnabled,
          introspection: playgroundEnabled,
          formatError: (formattedError) => {
            if (env.nodeEnv === 'production') {
              return {
                message: formattedError.message,
                extensions: {
                  code: formattedError.extensions?.code,
                },
              };
            }

            return formattedError;
          },
        };
      },
    }),
  ],
  providers: [HelloResolver],
})
export class AppGraphQLModule {}
