import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { HttpException, Module } from '@nestjs/common';
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
          autoSchemaFile:
            env.nodeEnv === 'production'
              ? true
              : join(process.cwd(), 'src/schema.gql'),
          sortSchema: true,
          playground: playgroundEnabled,
          introspection: playgroundEnabled,
          context: ({ req, res }: { req: unknown; res: unknown }) => ({
            req,
            res,
          }),
          persistedQueries: {
            cache: new InMemoryLRUCache(),
            ttl: 60 * 60 * 24 * 7,
          },
          formatError: (formattedError, error) => {
            let extensions = { ...formattedError.extensions };
            const originalError =
              error && typeof error === 'object' && 'originalError' in error
                ? (error as { originalError?: unknown }).originalError
                : undefined;
            if (originalError instanceof HttpException) {
              const response = originalError.getResponse();
              if (
                typeof response === 'object' &&
                response !== null &&
                'code' in response &&
                typeof response.code === 'string'
              ) {
                extensions = {
                  ...extensions,
                  code: response.code,
                };
              }
            }

            const enrichedError = { ...formattedError, extensions };

            if (env.nodeEnv === 'production') {
              return {
                message: enrichedError.message,
                extensions: {
                  code: enrichedError.extensions?.code,
                },
              };
            }

            return enrichedError;
          },
        };
      },
    }),
  ],
  providers: [HelloResolver],
})
export class AppGraphQLModule {}
