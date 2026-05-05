import { Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class GcpStorageService {
  private storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });

  async upload(file: Express.Multer.File): Promise<string> {
    const bucket = this.storage.bucket(process.env.GCP_BUCKET || '');

    const fileId = `uploads/${randomUUID()}.xlsx`;

    const blob = bucket.file(fileId);

    await blob.save(file.buffer, {
      contentType: file.mimetype,
    });

    return fileId;
  }

  async download(fileId: string): Promise<Buffer> {
    try {
      const bucket = this.storage.bucket(process.env.GCP_BUCKET || '');
      const file = bucket.file(fileId);

      // Verificamos si el archivo existe antes de intentar bajarlo
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`El archivo ${fileId} no existe en GCP Storage`);
      }

      // download() devuelve un array, el primer elemento es el Buffer con el contenido
      const [content] = await file.download();

      return content;
    } catch (error) {
      console.log(`Error descargando archivo de GCP: ${error.message}`);
      throw error;
    }
  }
}
