import { GameConfiguration } from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: any;
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
    multiPlaceBetChoices?: string[];
    indexTicketHistory?: {totalbet: number, isIdLink: boolean};
    gameLobbyNavigation?: string[];
    barItems?: string[];
    uiChecklist?: Array<string>;
    isBalanceBettingGame?: boolean;
    historyItems?: {roundid: string, betamount: string, betwin: string};
}
