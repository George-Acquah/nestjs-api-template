import { registerAs } from '@nestjs/config';
import { gcpConfigKey } from 'src/shared/constants/storage.constants';

const StorageConfig = {
  path: process.env.TOKEN_PATH,
  mediaBucket: process.env.IMAGES_BUCKET,
  url: process.env.GCP_URL
};

export const GCPStorageConfig = registerAs(gcpConfigKey, () => StorageConfig);
