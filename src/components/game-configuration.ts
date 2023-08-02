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
    wsGameName?: Array<string>;
    betBoard?: boolean;
    slotsgame?: boolean;
    cardgame?: boolean;
    accounts: object;
    productId: string;
    rebet?: boolean;
}
