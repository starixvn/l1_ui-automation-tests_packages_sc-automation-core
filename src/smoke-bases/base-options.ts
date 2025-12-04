import { GameConfiguration } from "../components";

export interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators?: any;
    waitBetTimeout?: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
    isconfig?: any;
    isJackpot?: boolean;
    isPromotion?: boolean;
}

export interface IBaseOptionsCocos {
    gameConfiguration: GameConfiguration;
    locators?: any;
    snapshotFolderPath: string;
    placeBetChoices?: string[];
    placeBetAmount?: string[];
    totalTaps?: number;
    isJackpot?: boolean;
    isPromotion?: boolean;
    uiLocatorsToVerify?: object; // Array of locator keys to verify in UI tests
}

