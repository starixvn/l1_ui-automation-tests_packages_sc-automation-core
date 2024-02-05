import { GameConfiguration } from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: any;
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
}
