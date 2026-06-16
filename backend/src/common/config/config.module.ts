import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { aiConfig, aiEnvValidationSchema } from './ai.schema';
import {
  elevenlabsConfig,
  elevenlabsEnvValidationSchema,
} from './elevenlabs.schema';
import {
  mediaStorageConfig,
  mediaStorageEnvValidationSchema,
} from './media-storage.schema';
import { appConfig, envValidationSchema } from './env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, aiConfig, elevenlabsConfig, mediaStorageConfig],
      validationSchema: envValidationSchema
        .concat(aiEnvValidationSchema)
        .concat(elevenlabsEnvValidationSchema)
        .concat(mediaStorageEnvValidationSchema),
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
        convert: true,
      },
    }),
  ],
})
export class AppConfigModule {}
