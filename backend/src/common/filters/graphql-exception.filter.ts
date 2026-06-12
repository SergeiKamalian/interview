import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown): GraphQLError {
    const isProduction = process.env.NODE_ENV === 'production';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : ((response as { message?: string | string[] }).message ??
            'Request failed');

      return new GraphQLError(
        Array.isArray(message) ? message.join(', ') : String(message),
        {
          extensions: {
            code: status,
          },
        },
      );
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    this.logger.error(
      `GraphQL error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    return new GraphQLError(isProduction ? 'Internal server error' : message, {
      extensions: {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    });
  }
}
