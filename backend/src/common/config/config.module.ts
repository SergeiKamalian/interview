import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { aiConfig, aiEnvValidationSchema } from './ai.schema';
import { appConfig, envValidationSchema } from './env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, aiConfig],
      validationSchema: envValidationSchema.concat(aiEnvValidationSchema),
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
        convert: true,
      },
    }),
  ],
})
export class AppConfigModule {}
