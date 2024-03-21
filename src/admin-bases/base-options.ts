import { GameConfiguration} from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: any;
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
    multiPlaceBetChoices?: string[];
    Adminconfiguration: Adminconfiguration;
}

export class Adminconfiguration {
    accountId: number
    operatorId?: string;
    settleDomain: string;
    settlePath?: string;
    l1datasetRER?: object;
    l1datasetTicket?: object;
    l2datasetRER?: object;
    l2datasetTicket?: object;
}
