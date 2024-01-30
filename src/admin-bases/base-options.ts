import { GameConfiguration, ImageLocator } from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: ImageLocator[];
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
    multiPlaceBetChoices?: string[];
    Adminconfiguration: Adminconfiguration;
}

export class Adminconfiguration {
    accountId: number
    settleDomain: string;
    settlePath?: string;
    l1datasetRER?: object;
    l1datasetTicket?: object;
    l2datasetRER?: object;
    l2datasetTicket?: object;
}
