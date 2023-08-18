import { GameConfiguration, ImageLocator } from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: ImageLocator[];
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
    multiPlaceBetChoices?: string[];
    indexTicketHistory?: {totalbet: number, isIdLink: boolean};
    gameLobbyNavigaion?: string[];
    barItems?: string[];
}
