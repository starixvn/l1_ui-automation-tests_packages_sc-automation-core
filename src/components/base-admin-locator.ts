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
    78: "//*/td[text()='Football Dice']//following::a[1]",
    79: "//*[@data-game-name='footballslot']",
    1001: "//*/td[text()='Bac Ball 1']//following::a[1]",
    1002: "//*/td[text()='Bac Ball 2']//following::a[1]",
    1003: "//*/td[text()='Lucky Next 1']//following::a[1]",
    1004: "//*/td[text()='Lucky Next 2']//following::a[1]",
    1005: "//*/td[text()='Se Ball']//following::a[1]",
};


export const commonUiResult = {
    lblroundId: "//*[contains(@class,'round-num')]",
    lblTimmer: "//*[contains(@class,'time-counter')]/span",
    gnlblroundId: "//*[contains(text(),'Next')]",
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
    lblPlaceBetTime: "//div[@id='game-ticket']//table[2]/tbody/tr[1]/td[1]",
    lblBetChoices: "//div[@id='game-ticket']//table[2]/tbody/tr[1]/td[2]",
    lblOdds: "//div[@id='game-ticket']//table[2]/tbody/tr[1]/td[3]",
    lblOdds2: "//div[@id='game-ticket']//table[2]/tbody/tr[2]/td[3]",
    lblStake: "//div[@id='game-ticket']//table[2]/tbody/tr[1]/td[4]",
    lblWin: "//div[@id='game-ticket']//table[2]/tbody/tr[1]/td[5]",
    lblTotalStake: "//tr[@class='total'][1]/td[2]",
    lblTotalWin: "//tr[@class='total'][1]/td[3]",
    lblWinLoss: "//tr[@class='total'][2]/td[2]",
    tblTable2: "//div[@id='game-ticket']//table[2]",
}

