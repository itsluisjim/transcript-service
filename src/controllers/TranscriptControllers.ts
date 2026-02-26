import "reflect-metadata";
import { TranscriptRepository } from "../services/TranscriptRepository";
import { injectable } from "tsyringe";


@injectable()
export class TranscriptServiceController {
    constructor(private readonly transcriptRepository: TranscriptRepository) {}

    public async listTranscripts(req: any, res: any) {
        const transcriptList = await this.transcriptRepository.listTranscriptsInAwsS3Bucket();

        return res.json({ success: true, data: transcriptList });
    }

    public async getTranscript(req: any, res: any, transcriptFileUUID: string) {
        // to be implemented
    }

    public uploadTranscript(req: any, res: any){
        // to be implemented
    }
}
