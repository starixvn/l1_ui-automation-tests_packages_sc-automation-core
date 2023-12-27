import { GameConfiguration, ImageLocator } from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: ImageLocator[];
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
    Adminconfiguration: Adminconfiguration
}

export class Adminconfiguration {
    wsGameName?: string;
    dataset: object;
}

