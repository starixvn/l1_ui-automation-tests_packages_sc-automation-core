export const BetDetail = {
    OperatorIdOption: "id=OperatorId",
    GameTypeOption: "id=GameType",
    RoundIdInput: "id=RoundId",
    PlayerIdInput: "id=PlayerId",
    LanguageOption: "id=Language",
    FreeBetcbo: "id=FreeBet",
    GetBetDetailsbtn: "//input[@value=';'Get Bet Details']",
    Rerbtn: "id=btn-retrieve-end-round",
    Rertxt: "id=retrieve-end-round-result",
};

export const monitoring = {
    1: "//*[@data-game-name='taixiu']",
    2: "//*[@data-game-name='xocxoc']",
    75: "//*[@data-game-name='bandarqiuqiu']",
    76: "//*/td[text()='Dragon Ball']//following::a[1]",
    78: "a[onclick='gameStatus.setControlResultFootballDice(event)']",
    79: "//*[@data-game-name='footballslot']",
    1001: "//*/td[text()='Bac Ball']//following::a[1]",
};


export const commonUiResult = {
    lblroundId: "//*[contains(@class,'round-num')]",
    lblTimmer: "//*[contains(@class,'time-counter')]/span",
    gnlblroundId: "//*[contains(text(),'Next Draw:')]",
    btnSubmit: "//button" ,

};

export const commonUiBetDetails = {
    optOperatorId : "id=OperatorId",
    optGameType : "id=GameType",
    inpRoundId : "id=RoundId",
    inpPlayerId : "id=PlayerId",
    ckbFreeBet: "id=FreeBet",
    ckbUseHmacHash : "id=UseHmacHash",
    btnGetBetDetails : "input[value='Get Bet Details']",
    btnRER : "id=btn-retrieve-end-round"
};

export const commonUiBetDetailsTicket = {
    tblMain: "//*/div[@class='main-container']",
    tblResult: "//*/div[@id='game-ticket']/table[2]",
    tblBetDetails: "//*/div[@id='game-ticket']/table[2]",
    lblRoundId: "//*[@id='game-ticket']/table[1]/tbody/tr/td[2]",
    lblBetDate: "//*[@id='game-ticket']/table[1]/tbody/tr/td[1]",
};

