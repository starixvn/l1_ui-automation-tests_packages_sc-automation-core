import { GameConfiguration, ImageLocator } from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: ImageLocator[];
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
    multiPlaceBetChoices?: string[];
    indexHistory?: {winamount: number, totalbet: number, roundId: number, navticketdetail: boolean};
    gameLobbyNavigaion?: string[];
}
