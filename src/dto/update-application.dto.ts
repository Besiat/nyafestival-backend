import { ApplicationDataDTO } from "./application-data.dto";

export class UpdateApplicationDTO {
    applicationId: string;
    applicationData: ApplicationDataDTO[];
}