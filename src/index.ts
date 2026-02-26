import "reflect-metadata";
import { container } from "tsyringe";
import { AppServer } from "./server";
import { TranscriptServiceController } from "./controllers/TranscriptControllers";

container.register<number>('Port', { useValue: 9000 });

// Register the controller implementation for the interface token
container.register<TranscriptServiceController>('TranscriptServiceController', { useClass: TranscriptServiceController });

// Resolve the AppServer (tsyringe now knows how to build it)
const appServer = container.resolve(AppServer);

appServer.start();
