import { ImageLocator } from "./base-image-locator";

export const CascadingSlotLocatorNames = {
    imgGameName: "imgGameName", //Main Screen
    imgBoard0: "imgB0",
    imgBoard1: "imgB1",
    imgBoard2: "imgB2",
    imgBoard3: "imgB3",
    imgBoard4: "imgB4",
    lblRoundID: "lblRoundID",
    lblRoundIdFirstRoundTrialMode: "lblRoundIdFirstRoundTrialMode",
    btnPayline: "btnPayline",
    cboBetLevel: "cboBetLevel",
    lblBetLevel0_1: "lblBetLevel0_1",
    imgBetLevel0_1: "imgBetLevel0_1",
    lblBetLevel0_2: "lblBetLevel0_2",
    imgBetLevel0_2: "imgBetLevel0_2",
    lblBetLevel1: "lblBetLevel1",
    imgBetLevel1: "imgBetLevel1",
    lblBetLevel5: "lblBetLevel5",
    imgBetLevel5: "imgBetLevel5",
    lblBetLevel10: "lblBetLevel10",
    imgBetLevel10: "imgBetLevel10",
    lblTotalbet: "lblTotalbet",
    imgTotalbet0_1: "imgTotalbet0_1",
    imgTotalbet0_2: "imgTotalbet0_2",
    imgTotalbet1: "imgTotalbet1",
    imgTotalbet5: "imgTotalbet5",
    imgTotalbet10: "imgTotalbet10",
    lblWin: "lblWin",
    btnAutoSpin: "btnAutoSpin",
    lblErrorMsg: "lblErrorMsg",
    mnuHamburger: "mnuHamburger",
    mnuHamburgerExpandSoundOn: "mnuHamburgerExpandSoundOn",
    mnuHamburgerExpandSoundOff: "mnuHamburgerExpandSoundOff",
    mnuHamburgerExpandTrialMode: "mnuHamburgerExpandTrialMode",
    icoSound: "icoSound",
    icoMusic: "icoMusic",
    btnTurbo: "btnTurbo",
    btnSpin: "btnSpin",
    imgTurboOn: "imgTurboOn",
    imgTurboOFF: "imgTurboOFF",
    imgTurboTrial: "imgTurboTrial",
    imgLeftNumbersColumn: "imgLeftNumbersColumn",
    imgRightNumbersColumn: "imgRightNumbersColumn",
    icoHistory: "icoHistory", // Menu options
    icoGuide: "icoGuide",
    popGameGuide: "popGameGuide",
    popAutoSpin: "popAutoSpin", // AutoSPin Popup
    popAutoSpinTurbo: "popAutoSpinTurbo",
    btnAutoSpin10: "btnAutoSpin10",
    btnAutoSpinTurbo: "btnAutoSpinTurbo",
    btnAutoSpinStart: "btnAutoSpinStart",
    popHistory: "popHistory", // History Popup
    lblHistoryFirstRow: "lblHistoryFirstRow",
    locHistoryRoundId: "locHistoryRoundId",
    lblHistoryDetailRoundId: "lblHistoryDetailRoundId",
    btnPayline1: "btnPayline1", // Payline Popup
    tblPayline1: "tblPayline1",
    btnAllPayline: "btnAllPayline",
    tblAllPayline: "tblAllPayline",
    btnEvenPayline: "btnEvenPayline",
    tblEvenPayline: "tblEvenPayline",
    btnOddPayline: "btnOddPayline",
    tblOddPayline: "tblOddPayline",
    btnClearPayline: "btnClearPayline",
    btnConfirmPayline: "btnConfirmPayline",
    imgConfirmPaylineDisabled: "imgConfirmPaylineDisabled",
    btnClosePopup: "btnClosePopup", //Others
    btnTotalStake: "btnTotalStake",
    popBetControl: "popBetControl",
    popBetControlMaxBetLevel: "popBetControlMaxBetLevel",
    popBetControlMinBetLevel: "popBetControlMinBetLevel",
    popBetControlMaxCoinValue: "popBetControlMaxCoinValue",
    popBetControlMinCoinValue:"popBetControlMinCoinValue",
    btnBetLevelIncrease: "btnBetLevelIncrease",
    btnBetLevelDecrease: "btnBetLevelDecrease",
    imgBetLevel: "imgBetLevel",
    btnCoinValueIncrease: "btnCoinValueIncrease",
    btnCoinValueDecrease: "btnCoinValueIDecrease",
    imgCoinValue: "imgCoinValue",
    btnTotalBetIncrease: "btnTotalBetIncrease",
    btnTotalBetDecrease: "btnTotalBetIDecrease",
    imgTotalBet: "imgTotalBet",
    imgBottomArea: "imgBottomArea",
    imgBottomAreaTrialMode: "imgBottomAreaTrialMode",
    lblTumbleWinList: "lblTumbleWinList",
    lblTumbleWinListTrialMode: "lblTumbleWinListTrialMode",
    //Trial mode
    btnTrialMode: "btnTrialMode",
    popBetControlTrialMode: "popBetControlTrialMode",
    btnHistoryTrialmode: "btnHistoryTrialmode",
    imgUserBalanceTrialMode: "imgUserBalanceTrialMode",
    imgRoundIdFirstRoundTrialMode: "imgRoundIdFirstRoundTrialMode",
};

export const CascadingSlotLocators = [
    new ImageLocator(CascadingSlotLocatorNames.imgGameName,  68, 583, 238, 130),
    new ImageLocator(CascadingSlotLocatorNames.imgBoard0, 338, 65, 600, 500),
    new ImageLocator(CascadingSlotLocatorNames.imgBoard1, 338, 65, 600, 500),
    new ImageLocator(CascadingSlotLocatorNames.imgBoard2, 338, 65, 600, 500),
    new ImageLocator(CascadingSlotLocatorNames.imgBoard3, 338, 65, 600, 500),
    new ImageLocator(CascadingSlotLocatorNames.imgBoard4, 338, 65, 600, 500),
    new ImageLocator(CascadingSlotLocatorNames.lblRoundID, 990, 120, 192, 40),
    new ImageLocator(CascadingSlotLocatorNames.lblRoundIdFirstRoundTrialMode, 990, 120, 192, 40),
    new ImageLocator(CascadingSlotLocatorNames.btnPayline, 130, 622, 90, 46),//
    new ImageLocator(CascadingSlotLocatorNames.cboBetLevel, 305, 620, 80, 50),//
    new ImageLocator(CascadingSlotLocatorNames.imgBetLevel, 305, 620, 80, 50),//
    new ImageLocator(CascadingSlotLocatorNames.imgBetLevel0_2, 305, 620, 80, 50),//
    new ImageLocator(CascadingSlotLocatorNames.imgBetLevel1, 305, 620, 80, 50),//
    new ImageLocator(CascadingSlotLocatorNames.lblBetLevel0_1, 183, 547, 100, 55),//
    new ImageLocator(CascadingSlotLocatorNames.lblBetLevel0_2, 292, 547, 100, 55),//
    new ImageLocator(CascadingSlotLocatorNames.lblBetLevel1, 402, 547, 100, 55),//
    new ImageLocator(CascadingSlotLocatorNames.lblBetLevel5, 292, 547, 100, 55),//
    new ImageLocator(CascadingSlotLocatorNames.lblBetLevel10, 402, 547, 100, 55),//
    new ImageLocator(CascadingSlotLocatorNames.btnPayline1, 240, 186, 100, 70),//
    new ImageLocator(CascadingSlotLocatorNames.lblTotalbet, 456, 583, 147, 88),//
    new ImageLocator(CascadingSlotLocatorNames.imgTotalbet0_1, 456, 583, 147, 88),//
    new ImageLocator(CascadingSlotLocatorNames.imgTotalbet0_2, 456, 583, 147, 88),//
    new ImageLocator(CascadingSlotLocatorNames.imgTotalbet1, 456, 583, 147, 88),//
    new ImageLocator(CascadingSlotLocatorNames.imgTotalbet5, 456, 583, 147, 88),//
    new ImageLocator(CascadingSlotLocatorNames.imgTotalbet10, 456, 583, 147, 88),//
    new ImageLocator(CascadingSlotLocatorNames.lblErrorMsg, 521, 511, 270, 45),
    new ImageLocator(CascadingSlotLocatorNames.btnAutoSpin, 823, 637, 63, 54),
    new ImageLocator(CascadingSlotLocatorNames.mnuHamburger, 45, 62, 55, 55),
    new ImageLocator(CascadingSlotLocatorNames.mnuHamburgerExpandSoundOn, 35, 65, 80, 470),
    new ImageLocator(CascadingSlotLocatorNames.mnuHamburgerExpandSoundOff, 35, 65, 80, 470),
    new ImageLocator(CascadingSlotLocatorNames.mnuHamburgerExpandTrialMode, 35, 65, 80, 470),
    new ImageLocator(CascadingSlotLocatorNames.icoSound, 56, 327, 35, 35),
    new ImageLocator(CascadingSlotLocatorNames.icoMusic, 56, 237, 35, 35),
    new ImageLocator(CascadingSlotLocatorNames.btnTurbo, 1088, 626, 90, 90),
    new ImageLocator(CascadingSlotLocatorNames.imgTurboOn, 1088, 626, 90, 90),
    new ImageLocator(CascadingSlotLocatorNames.imgTurboOFF, 1088, 626, 90, 90),
    new ImageLocator(CascadingSlotLocatorNames.imgTurboTrial, 1088, 626, 90, 90),
    new ImageLocator(CascadingSlotLocatorNames.btnSpin, 940, 570, 100, 100),
    new ImageLocator(CascadingSlotLocatorNames.imgLeftNumbersColumn, 223, 120, 53, 386),//
    new ImageLocator(CascadingSlotLocatorNames.imgRightNumbersColumn, 1013, 145, 24, 355),//
    new ImageLocator(CascadingSlotLocatorNames.icoHistory, 56, 408, 40, 40),
    new ImageLocator(CascadingSlotLocatorNames.popHistory, 166, 28, 940, 122),
    new ImageLocator(CascadingSlotLocatorNames.icoGuide, 56, 492, 40, 40),
    new ImageLocator(CascadingSlotLocatorNames.popGameGuide, 512, 38, 268, 60),
    new ImageLocator(CascadingSlotLocatorNames.popAutoSpin, 378, 145, 528, 390),
    new ImageLocator(CascadingSlotLocatorNames.popAutoSpinTurbo, 378, 145, 528, 390),
    new ImageLocator(CascadingSlotLocatorNames.btnAutoSpinTurbo, 410, 466, 25, 25),
    new ImageLocator(CascadingSlotLocatorNames.btnAutoSpinStart, 713, 451, 129, 55),
    new ImageLocator(CascadingSlotLocatorNames.lblHistoryFirstRow, 140, 168, 1000, 30),
    new ImageLocator(CascadingSlotLocatorNames.locHistoryRoundId, 395, 167, 50, 24),
    new ImageLocator(CascadingSlotLocatorNames.lblHistoryDetailRoundId, 500, 33, 300, 40),
    new ImageLocator(CascadingSlotLocatorNames.tblPayline1, 190, 168, 880, 432),//
    new ImageLocator(CascadingSlotLocatorNames.tblAllPayline, 190, 168, 880, 432),//
    new ImageLocator(CascadingSlotLocatorNames.tblEvenPayline, 190, 168, 880, 432),//
    new ImageLocator(CascadingSlotLocatorNames.tblOddPayline, 190, 168, 880, 432),//
    new ImageLocator(CascadingSlotLocatorNames.btnOddPayline, 668, 111, 154, 50),//
    new ImageLocator(CascadingSlotLocatorNames.btnEvenPayline, 460, 111, 154, 50),//
    new ImageLocator(CascadingSlotLocatorNames.btnAllPayline, 257, 111, 154, 50),//
    new ImageLocator(CascadingSlotLocatorNames.btnClearPayline, 875, 111, 154, 50),//
    new ImageLocator(CascadingSlotLocatorNames.btnConfirmPayline, 532, 612, 210, 55),//
    new ImageLocator(CascadingSlotLocatorNames.imgConfirmPaylineDisabled, 532, 612, 210, 55),//
    new ImageLocator(CascadingSlotLocatorNames.btnClosePopup, 5, 5, 10, 10),
    new ImageLocator(CascadingSlotLocatorNames.btnTotalStake, 418, 640, 100, 50),
    new ImageLocator(CascadingSlotLocatorNames.popBetControl, 286, 230, 375, 380),
    new ImageLocator(CascadingSlotLocatorNames.btnBetLevelIncrease, 522, 348, 25, 25),
    new ImageLocator(CascadingSlotLocatorNames.btnBetLevelDecrease, 378, 348, 25, 25),
    new ImageLocator(CascadingSlotLocatorNames.btnCoinValueIncrease, 522, 448, 25, 25),
    new ImageLocator(CascadingSlotLocatorNames.btnCoinValueDecrease, 378, 448, 25, 25),
    new ImageLocator(CascadingSlotLocatorNames.popBetControlMaxBetLevel, 286, 230, 375, 380),
    new ImageLocator(CascadingSlotLocatorNames.popBetControlMinBetLevel, 286, 230, 375, 380),
    new ImageLocator(CascadingSlotLocatorNames.popBetControlMaxCoinValue, 286, 230, 375, 380),
    new ImageLocator(CascadingSlotLocatorNames.popBetControlMinCoinValue, 286, 230, 375, 380),
    new ImageLocator(CascadingSlotLocatorNames.popBetControlTrialMode, 286, 230, 375, 380),
    new ImageLocator(CascadingSlotLocatorNames.imgBottomArea, 358, 607, 552, 98),
    new ImageLocator(CascadingSlotLocatorNames.imgBottomAreaTrialMode, 358, 607, 552, 98),
    new ImageLocator(CascadingSlotLocatorNames.lblTumbleWinList, 990, 222, 194, 216),
    new ImageLocator(CascadingSlotLocatorNames.lblTumbleWinListTrialMode, 990, 222, 194, 216),
    new ImageLocator(CascadingSlotLocatorNames.imgRoundIdFirstRoundTrialMode, 990, 120, 192, 40),
    new ImageLocator(CascadingSlotLocatorNames.btnTrialMode, 147, 47, 148, 50),
    
    new ImageLocator(CascadingSlotLocatorNames.imgUserBalanceTrialMode, 985, 52, 200, 50),
    
];
