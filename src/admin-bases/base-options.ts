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
    settleDomain: string;
    settlePath?: string;
    tokenGameName?: string;
    wsGameName?: string;
    dataset: object;
}
