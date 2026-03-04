import "reflect-metadata";
import { TranscriptRepository } from "../services/TranscriptRepository";
import { injectable } from "tsyringe";
import { promisify } from "util";
import { pipeline, Readable } from "stream";

const streamPipeline = promisify(pipeline);


@injectable()
export class TranscriptServiceController {
    constructor(private readonly transcriptRepository: TranscriptRepository) {}

    public async listTranscripts(req: any, res: any) {
        const transcriptList = await this.transcriptRepository.listTranscriptsInAwsS3Bucket();

        return res.json({ success: true, data: transcriptList });
    }

    public async getTranscript(req: any,res: any, transcriptFileUUID: string) {
        
        // fetch object from repository (stream + metadata)
        const response = await this.transcriptRepository.getTranscriptFromAwsS3Bucket(transcriptFileUUID);

        // determine a sensible filename for Content-Disposition
        const fileName = transcriptFileUUID.split("/").pop() || transcriptFileUUID;

        // set headers so browser knows it's a binary download
        res.setHeader("Content-Type", response.ContentType || "application/octet-stream");
        res.setHeader("Content-Length", response.ContentLength?.toString() || "");
        res.setHeader("Last-Modified", response.LastModified?.toUTCString() || new Date().toUTCString());
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Transfer-Encoding", "binary");

        // stream the body directly to the response
        await streamPipeline(response.Body as Readable, res);
        
    }

    public uploadTranscript(req: any, res: any){
        // to be implemented
    }
}
