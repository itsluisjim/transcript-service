import "reflect-metadata";
import { S3Client, GetObjectCommand, ListObjectsV2Command} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "tsyringe";
import dotenv from "dotenv";

dotenv.config();
@injectable()
export class TranscriptRepository {
  constructor(private s3Client: S3Client) {}

  public async listTranscriptsInAwsS3Bucket() {
    const fileExtensions = ['.pdf'];
    const bucketName = process.env.AWS_S3_TRANSCRIPT_BUCKET;

    const command = new ListObjectsV2Command({
      Bucket: bucketName
    });

    const response = await this.s3Client.send(command);

    const transcriptFiles = (response.Contents || []).filter(item => {
        const key = item.Key?.toLowerCase();
        return fileExtensions.some(ext => key?.endsWith(ext));
    });

    const transcriptPromises = transcriptFiles.map(async (file) => {
        const key = file.Key as string;

        const downloadCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
            ResponseContentDisposition: `attachment; filename="${key.split('/').pop()}"`
        });

        const signedUrl = await getSignedUrl(
            this.s3Client,
            downloadCommand,
            { expiresIn: 3600 }
        );

        return {
            name: key.split('/').pop(), // removes folder prefix if present
            type: key.split('.').pop(),
            size: ((file.Size ?? 0) / 1024 / 1024).toFixed(2) + " MB",
            downloadUrl: signedUrl
        };
    });

    return Promise.all(transcriptPromises);
  }

  public async getTranscriptFromAwsS3Bucket(fileUUID: string) {
    
    const uploadParams = {
      Bucket: process.env.AWS_S3_TRANSCRIPT_BUCKET,
      Key: fileUUID
    };

    const command = new GetObjectCommand(uploadParams);
    const response = await this.s3Client.send(command);

    if (!response.Body) {
        throw new Error('No response body from S3');
    }

    // return stream data and metadata
    return {
        Body: response.Body,
        ContentType: response.ContentType,
        ContentLength: response.ContentLength,
        ETag: response.ETag,
        LastModified: response.LastModified
    };

  }
  
}
