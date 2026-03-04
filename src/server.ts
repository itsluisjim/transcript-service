import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import { TranscriptServiceController } from "./controllers/TranscriptControllers";
import express from "express";
import cors from "cors";

@injectable()
export class AppServer {
    private server: express.Express;
    private router: express.Router;
    private port: number;
    private transcriptServiceController: TranscriptServiceController;

    constructor(@inject("Port") port = 9000, @inject("TranscriptServiceController") transcriptServiceController: TranscriptServiceController) {
        this.port = port;
        this.transcriptServiceController = transcriptServiceController;
        this.server = express();
        this.router = express.Router();
    }

    public start() {
        this.server.use(cors())
        this.server.use(express.json());
        this.server.use(express.urlencoded({ extended: false }));

        this.server.use("/api/transcript", this.router);
        
        this.router.get('/list', (req, res) => this.transcriptServiceController.listTranscripts(req, res));
        this.router.get('/:id', (req: any, res: any) => this.transcriptServiceController.getTranscript(req, res, req.params.id));

        // global error handler
        this.server.use((err: any, req: any, res: any, next: any) => {
            console.log("Global error:", err);

            res.status(err.status || 500).json({
                success: false,
                message: err.message || "Internal Server Error",
            });
        });

        this.server.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }
}
