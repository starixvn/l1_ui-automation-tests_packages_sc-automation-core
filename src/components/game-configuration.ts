export class GameConfiguration {
    id: number;
    name: string;
    durations: {
        wholeRound: number;
        placingBets: number;
        lockingBet: number;
        shakeThePlateDuration: number;
    };
    choices: Array<string>;
    hedgeBetGroups?: any;
    maxTimeout: number;
    odds: any;
    socketName?: string;
    betBoard?: boolean;
    slotsgame?: boolean;
    cardgame?: boolean;
    accounts: object;
    productId: object;
    rebet?: boolean;
    qualifiedPoint?: number;
    isDoubleFunction?: boolean;
    isDraw?: boolean; //Xd games stand for game type has Draw round
    ssoTime?: number //sso time in seconds for performance test only
    currencyGroup?: string;
}
