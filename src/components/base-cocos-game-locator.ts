// Common paths to avoid repetition
const CANVAS = "Canvas";
const CENTER = "Canvas/center";
const BET_CONTAINER = "Canvas/center/full-widget/container/low/bottom-center/portrait-bottom-area/bet-container/totalBetContainer/total-bet/portrait-bet-control/container";
const AUTO_PLAY = "Canvas/center/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/container";
const MINI_GAME_DIALOG = "Canvas/mini-panel/MiniPanel/Dialog";

export const Portrail_Cascading_Locators = {
    // Main buttons
    btnPlayNow: `${CANVAS}/splash/wraper-container/btn-play-now`,
    btnSpin: "btn-spin",
    btnMenu: "btn-menu",
    btnHistory: "history",
    btnguide: "guide",
    btnAutoSpin: "portrait-auto-spin-button",
    btnTurbo: "portrait-turbo-mode-button",
    btnBuyFS: "buy-fs-btn",

    // Bet controls
    btnBetIncrease: `betamout-increase`,
    btnBetDecrease: `betamout-decrease`,
    betAmountSetting: `${CENTER}/full-widget/container/low/bottom-center/portrait-bottom-area/bet-container/totalBetContainer/total-bet/bet-click/value-container`,

    // Bet level controls
    btnBetLevelIncrease: `${BET_CONTAINER}/bet-level/frame/increase`,
    btnBetLevelIncreaseUnactive: `${BET_CONTAINER}/bet-level/frame/increase/increase-unactive`,
    btnBetLevelDecrease: `${BET_CONTAINER}/bet-level/frame/decrease`,
    btnBetLevelDecreaseUnactive: `${BET_CONTAINER}/bet-level/frame/decrease/decrease-unactive`,
    txtBetLevelValue: `${BET_CONTAINER}/bet-level/frame/bet-value`,

    // Coin value controls
    btnCoinValueIncrease: `${BET_CONTAINER}/coin-value/frame/increase`,
    btnCoinValueIncreaseUnactive: `${BET_CONTAINER}/coin-value/frame/increase/increase-unactive`,
    btnCoinValueDecrease: `${BET_CONTAINER}/coin-value/frame/decrease`,
    btnCoinValueDecreaseUnactive: `${BET_CONTAINER}/coin-value/frame/decrease/decrease-unactive`,
    txtCoinValue: `${BET_CONTAINER}/coin-value/frame`,

    // Total bet controls
    btnTotalBetIncrease: `${BET_CONTAINER}/total-bet/frame/increase`,
    btnTotalBetIncreaseUnactive: `${BET_CONTAINER}/total-bet/frame/increase/increase-unactive`,
    btnTotalBetDecrease: `${BET_CONTAINER}/total-bet/frame/decrease`,
    btnTotalBetDecreaseUnactive: `${BET_CONTAINER}/total-bet/frame/decrease/decrease-unactive`,
    txtTotalBetValue: `${BET_CONTAINER}/total-bet/frame`,

    // Auto spin controls
    lbl10AutoSpin: `${AUTO_PLAY}/10`,
    lbl30AutoSpin: `${AUTO_PLAY}/30`,
    lbl50AutoSpin: `${AUTO_PLAY}/50`,
    btnAutoSpinStart: `${CENTER}/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/start-button`,
    btnAutoPlayTurbo: `${CENTER}/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/turbo-mode/turbo_toggle`,
    iconCloseAutoPlay: `${CENTER}/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/popup-bg/main-popup-close-btn`,
    popAutoSpin: `${CENTER}/auto-scale-widget/new/auto-play-lazyload-container/auto-play-container/auto-play-popup`,
    txtautoSpinCount: `${CENTER}/full-widget/container/high/center/btn-spin-container/btn-spin/autospin/autospin-count`,

    // Turbo mode
    iconTurboOFF: `${CENTER}/full-widget/container/low/bottom-center/portrait-bottom-area/turbo-container/portrait-turbo-mode-button/icon-deactive`,
    iconTurboON: `${CENTER}/full-widget/container/low/bottom-center/portrait-bottom-area/turbo-container/portrait-turbo-mode-button/check/icon-active`,

    // Menu items
    btnLobby: `Canvas/center/full-widget/container/low/in-game-menu/outer-menu/btn-menu/expandable-layout/lobby`,
    btnMusic: `music`,
    btnSound: `sfx`,
    btnMenuClose: "close",


    // Free spin
    lblFSTotalWin: `${CANVAS}/center/buy-freespin-container/buy-fs-container/buy-fs-congratulation/body/win`,
    btnYesBuyFS: `${CANVAS}/center/buy-freespin-container/buy-fs-container/buy-fs-confirmation/container/popup-bg/content/buttons/yes`,
    btnNoBuyFS: `${CANVAS}/center/buy-freespin-container/buy-fs-container/buy-fs-confirmation/container/popup-bg/content/buttons/no`,
    txtFreeSpinCount: `${CENTER}/full-widget/container/freespins-section/freespins-section/remaining-freespins/freespin-count`,
    lblLastFreeSpin: `${CENTER}/full-widget/container/freespins-section/freespins-section/last-freespin`,
    // Text displays
    txtOperator: `${CENTER}/operator-section/text`,
    txtbottomBalance: `${CENTER}/info-player/balance-container/balance`,
    txtbottomTotalBet: `${CENTER}/info-player/bet/total-bet`,
    txtbottomWin: `${CENTER}/info-player/total-win/total-win`,
    txtcenterWin: `${CENTER}/auto-scale-widget/new/messages/Node/tumble-win-view/total-win/total_win`,
    txtMessageCenter: `${CENTER}/auto-scale-widget/new/messages/Node/messages-bottom/text`,

    // History
    txtHistoryRoundId: `${CANVAS}/center/outer-container/outer-container/portrait-bet-history-container/portrait-bet-history-dialog/popup/back-wrapper/Node/table-bg/content/portrait-bet-history-body-item/node/round/lblRound`,
    txtHistoryTotalBet: `${CANVAS}/center/outer-container/outer-container/portrait-bet-history-container/portrait-bet-history-dialog/popup/back-wrapper/Node/table-bg/content/portrait-bet-history-body-item/node/total-bet`,
    txtHistoryWin: `${CANVAS}/center/outer-container/outer-container/portrait-bet-history-container/portrait-bet-history-dialog/popup/back-wrapper/Node/table-bg/content/portrait-bet-history-body-item/node/total-win`,

    // History detail
    btnBackHistory: `${CANVAS}/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/wraper`,
    iconCloseHistoryDetail: `${CANVAS}/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/btnClosed`,
    txtHistoryDetailRoundId: `${CANVAS}/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/Node/title/id`,
    txtHistoryDetailBetLevel: "lblBetLevelValue",
    txtHistoryDetailBetCoinValue: "lblBetCoinValue",
    txtHistoryDetailTotalBet: "lblBetValue",
    txtHistoryDetailWin: `${CANVAS}/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/bottom-section/total-win/Node/value`,
    txtHistoryDetailMultiplier: `${CANVAS}/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/bottom-section/total-win/Node/mutipler`,
    txtHistoryDetailTitleFirstRow: `${CANVAS}/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/content-table/scroll-view/view/content/portrait-ticket-detail-item/title/payout`,
    txtHistoryDetailTotalFreeSpin: `${CANVAS}/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/content-table/scroll-view/view/content/portrait-ticket-detail-item/node/tumble-win-detail/portrait-tumble-win-detail-item/node/win/value`,

    // Popup controls
    iconCloseMainPopup: "main-popup-close-btn",
    btnClosePopup: "btnClosed",
    btnCloseGuide: "Canvas/outer-containers/outer-container/game-guide-container/game-guide-portrait/popup/main/Node/btn-close"
};

export const Portrail_Classic_Locators = {
    ...exports.Portrail_Cascading_Locators,
     //top JP Classic Menu items
     lblMajorJackpot: "Canvas/center/board/auto-scale-widget/jackpot-visi/auto-load-node/jackpot-pools/content/major/value",
     lblGrandJackpot: "Canvas/center/board/auto-scale-widget/jackpot-visi/auto-load-node/jackpot-pools/content/grand/value",
     lblMinorJackpot: "Canvas/center/board/auto-scale-widget/jackpot-visi/auto-load-node/jackpot-pools/content/minor/value",
     // Line Setting Popup
     btnLineSetting: "line-setting",
     btnLineSettingClose: "line-setting-close",
     popupLineSetting: "Canvas/center/board/line-setting-popup",
     lineSettingContainer: "Canvas/center/board/line-setting-popup/container",
     btnHallOfFame: "Canvas/center/bottom-controls/container/low/bottom-center/in-game-menu/expandable-layout/top",
     txtOperator: `${CENTER}/top-section/system-decorator-label`,
     txtMessageCenter: `${CENTER}/board/auto-scale-widget/bottom-message/slot-ingame-message`,
     btnLobby: "lobby",
     btnAutoSpin: "auto",
     btnTurbo: "Canvas/center/bottom-controls/container/low/bottom-center/bet-control/right/turbo",
     betAmountSetting: "Canvas/center/bottom-controls/container/low/bottom-center/bet-control/right/btn-bet-selection/open",
     btnguide: "btn-guide",
     iconTurboOFF: `Canvas/center/bottom-controls/container/low/bottom-center/bet-control/right/turbo/bg/autoplay/deactive`,
     iconTurboON: `Canvas/center/bottom-controls/container/low/bottom-center/bet-control/right/turbo/bg/autoplay/active`,
     btnLine: "Canvas/center/bottom-controls/container/low/bottom-center/in-game-menu/expandable-layout/line",
     btnAutoSpinStart: `start-button`,
     btnAutoPlayTurbo: `Canvas/center/auto-spin-dialog-container/auto-spin-dialog/container/turbo-mode/turbo_toggle`,
     iconCloseAutoPlay: `main-popup-close-btn`,
     txtautoSpinCount: `Canvas/center/bottom-controls/container/high/center/btn-spin-container/btn-spin/btn-spin-square/bg/number-font`,
     popupLineSelection: "Canvas/outer-containers/outer-container/line-selection/line-selection-dialog-portrait",
     btnBigWin: "bigWinningWinners",
     btnJackpot: "jackpotWinners",
     barPagination: "Canvas/outer-containers/outer-container/slot-game-top-winner-container/top-winners-dialog-portrait/container/main-popup-bg/pagination",
     headerJackpot: "Canvas/outer-containers/outer-container/slot-game-top-winner-container/top-winners-dialog-portrait/container/main-popup-bg/content/header/jackpot",
     headerBigWin: "Canvas/outer-containers/outer-container/slot-game-top-winner-container/top-winners-dialog-portrait/container/main-popup-bg/content/header/big",
     iconCloseAmountSetting: "close-line",
     txtbottomTotalBet: "Canvas/center/info-player/center/total-bet",
     txtbottomWin: `Canvas/center/info-player/right/total-win`,
     lblHistoryRoundPath: "Canvas/outer-containers/outer-container/bet-history-container/portrait-bet-history-dialog/popup/back-wrapper/Node/table-bg/content/item-",
     // History detail
     btnBackHistory: `Canvas/outer-containers/outer-container/classic-slot-bet-detail-container/portrait-ticket-detail/popup/back-wrapper/btn-back`,
     iconCloseHistoryDetail: `Canvas/outer-containers/outer-container/classic-slot-bet-detail-container/portrait-ticket-detail/popup/back-wrapper/btn-close`,
     txtHistoryDetailRoundId: `id`,
     txtHistoryDetailBetLevel: "Canvas/outer-containers/outer-container/classic-slot-bet-detail-container/portrait-ticket-detail/popup/back-wrapper/wrap-content/content-container/header/text/bet/lblBetLevelValue",
     txtHistoryDetailLine: "Canvas/outer-containers/outer-container/classic-slot-bet-detail-container/portrait-ticket-detail/popup/back-wrapper/wrap-content/content-container/header/text/line/value",
     txtHistoryDetailTotalBet: "Canvas/outer-containers/outer-container/classic-slot-bet-detail-container/portrait-ticket-detail/popup/back-wrapper/wrap-content/content-container/header/text/wrapTotalBet/lblBetValue",
     txtHistoryDetailWin: `Canvas/outer-containers/outer-container/classic-slot-bet-detail-container/portrait-ticket-detail/popup/back-wrapper/wrap-content/content-container/header/text/wrapTotalWin/lblBetValue`,
     btnClose: "Canvas/outer-containers/outer-container/line-selection/line-selection-dialog-portrait/popup/body/close",
     iconCloseHallOfFame: "Canvas/outer-containers/outer-container/slot-game-top-winner-container/top-winners-dialog-portrait/container/main-popup-bg/btn-close",
     iconCloseHistory: "Canvas/outer-containers/outer-container/bet-history-container/portrait-bet-history-dialog/popup/back-wrapper/wrapper",

    };


export const RoundGame_Locators = {
    lblRoundId: "Phien",
    tableStatistics: "statistics",
    lblOdds: "Odds",
    lblTimer: "timer-container",
    lblMd5: "md5",
    lblMiniRoundHistory: "miniRoundHistoryContainer",
    btnClose: "CloseButton",
    btnguide: "HelpButton",
    btnHistory: "HistoryButton",
    btnStatistics: "StatsButton",
    btnPresetBet: "PresetBetButton",
    txtHistoryTitle: `/GameNameHistoryItem/node/Time`,
    txtHistoryRoundId: `/GameNameHistoryItem/node/New Node/round`,
    txtHistoryTotalBet: `/GameNameHistoryItem/node/Cuoc`,
    txtHistoryWin: `/GameNameHistoryItem/node/Win`,
    txtHistoryDetailInfo: `/betdetail-frame/BetDetail/auto_scale/back_wrapper/wrapper/BetInfo`,
    lblMiniWarning: `/Background/notice/mini_warning`,
    btnCloseHistoryDetail: `/betdetail-frame/BetDetail/auto_scale/back_wrapper/CloseButton`,
    btnCloseHistory: `/history-frame/BetDetail/auto scale/back-wrapper/CloseButton`,
    lblHedgeWarning: "Chỉ được cược 1 bên.",
    btnLobby: "/InGameMenu/home-icon",
    btnMenu: "/InGameMenu/expandableMenu", 
    btnCloseGuide: "/new-guide/main/background/CloseButton"

}

export function replaceGameNameInLocators<T extends Record<string, any>>(locators: T, gameName: string): T {
    const result = { ...locators };
    
    // Replace "GameName" in all string values that contain it
    Object.keys(result).forEach(key => {
        const value = result[key];
        if (typeof value === 'string' && value.includes('GameName')) {
            (result as any)[key] = value.replace(/GameName/g, gameName);
        }
    });
    
    return result;
}


export const TapGame_Locators = {
    lblRoundId: "RoundID",
    btnPlay: "start-bet-button",
    btnCashOut: "cash-out-button",
    btnGo: "hit-stone-button",
    inputBetAmount: "bet-amount-container",
    pathBetChip: "/bet-control/top/Layout/input-container/content/",
    btnHalfBet: "half-bet",
    btnDoubleBet: "double-bet",
    btnAutoPlay: "/bet-control/play-mode-layout/play-mode-buttons/auto-play",
    //AUTO Play Bet Setting Popup
    btnStartAutoPlay: "/auto-play-popup/auto-play-container/btn-start",
    btnIncreaseStep: "/auto-play-popup/auto-play-container/step-to-cash-out/no-of-auto-lanes-container/increase",
    btnDecreaseStep: "/auto-play-popup/auto-play-container/step-to-cash-out/no-of-auto-lanes-container/decrease",
    lblAutoPlayMultiplier: "/auto-play-popup/auto-play-container/multiplier/bg-betzone-001/value",
    btnCloseAutoPlay: "/auto-play-popup/auto-play-container/btn-close",
    btnLedBar: "led-steps-container",
    pathNumAutoPlay: "/auto-play-popup/auto-play-container/content/",
    txtNumStepAutoPlay: "/auto-play-popup/auto-play-container/step-to-cash-out/no-of-auto-lanes-container/EditBox/TEXT_LABEL",
    lblCountDownAutoPlay: "/bet-control/play-mode-layout/btn-countdown/lbl-count-down",
    //*******************
    btnGameMode: "/bet-control/play-mode-layout/play-mode-buttons/game-mode",
    lblEasymode: "easy-mode",
    lblMediummode: "medium-mode",
    lblHardmode: "hard-mode",
    lblHardcoremode: "hardcore-mode",
    btnSound: "sfx",
    btnguide: "/auto-load-in-game-menu/in-game-menu/expandable-layout/guide",
    btnPfSetting: "/auto-load-in-game-menu/in-game-menu/expandable-layout/provably-fair-btn-001",
    ckbRandomSeed: "/ClientSeedSetting/content/layout/main-content/seed-wrapper/toggle-container/random/checkmark",
    txtRandomSeed: "/ClientSeedSetting/content/layout/main-content/seed-wrapper/random-section/bg/value",
    ckbManualSeed: "/ClientSeedSetting/content/layout/main-content/seed-wrapper/toggle-container/manual/checkmark",
    txtManualSeed: "/ClientSeedSetting/content/layout/main-content/seed-wrapper/manual-section/bg-001/editor-manual/TEXT_LABEL",
    btnClosePFSetting: "/ClientSeedSetting/content/title-section/btn-close/btn-close-001",
    iconPFGuideSetting: "/ClientSeedSetting/content/title-section/icon-guide",
    btnCopyServerSeed: "/ClientSeedSetting/content/layout/server-seed-hash/label-copy/bg/copy-button",
    lblGameName: "game-name",
    lblRtp: "rtp",
    lblAllBets: "lbl-top",
    btnHistory: "/auto-load-bet-result-container-portrait/bet-result-container-portrait/tabheader/toggle-my-bet",
    btnLobby: "/back-to-lobby/outer-menu/lobby/lobby-out-side",
    btnCloseSoundSetting: "/volume-dialog/popup/back-wrapper/btnClosed",
    iconSoundSetting: "/volume-dialog/popup/back-wrapper/sfx",
    iconMusicSetting: "/volume-dialog/popup/back-wrapper/music",
    iconPFGuide: "/ClientSeedSetting/content/title-section/icon-guide",
    lblAUtoCashoutNotice: "/auto-lazy-load-notice-container/lazy-load-notice-container/auto-cashout-nottice",
    txtHistoryRound: "/my-bet-table/my-bet-body/my-bet-table-body/view/content/",
    lblHistoryDetailRoundId: "/defail-summary-table/bet-details-summary-table/result-table/round/roundId-value",
    lblHistoryDetailCrashPoint: "/defail-summary-table/bet-details-summary-table/result-table/Node/crash-point-value",
    lblHistoryDetailTotalBet: "/detail-log-table/bet-detail-log-table/detail-table/content/total/valueBet",
    lblHistoryDetailTotalWin: "/detail-log-table/bet-detail-log-table/detail-table/content/total/valueWin",
    lblHistoryDetailMultiplier: "/detail-log-table/bet-detail-log-table/detail-table/content/rows/bet-detail-item/lblMultiplier",
    btnCloseHistoryDetail: "/btnClosed",
    btnCloseHistoryDetailPF: "/PFVerification/content/title-section/btn-close",
    btnHistoryDetailPF: "/detail-log-table/bet-detail-log-table/PF",
    iconHistoryDetailPFGuide: "/detail-log-table/bet-detail-log-table/PF",
    lblClientSeed: "/PFVerification/content/content-section/view/content/layout/client-seed/merge-cs/label-copy/bg/mask/Label",
    lblHistoryDetailPFRoundId: "/PFVerification/content/round-info/round/roundId-value",
    btnClosePFGuide: "/pf-intro-container/pf-intro-popup-portrait/popup/content/popup-icon-close/popup-icon-close-001",
    btnCloseGuide: "/game-guide-direct-container/game-guide-portrait/popup/main/btn-close"
}

export const CrashGame_Locators = {
    //Main Controls
    btnEarlyBet: "/bottom-area/right/early-bet-button",
    btnPlaceBet: "/bottom-area/right/place-bet-button",
    btnCashOut: "cash-out",
    lblRoundId: "RoundID",
    statisticsBar: "statistics-bar",
    btnCloseIcon: "close-icon",
    btnConfirmBetAmount: "confirm",
    btnStartAutoPlay: "start-button",
    iconAutoPlay: "auto-play-button",
    btnBetAmount: "bet-amount-container",
    btnIncreaseBetAmount: "/bottom-area/left/bet-amount-wrapper/bet-input/increase",
    btnDecreaseBetAmount: "/bottom-area/left/bet-amount-wrapper/bet-input/decrease",
    btnMultiplier: "/bottom-area/left/auto-cash-out/right/multiplier",
    btnIncreaseMultiplier: "/bottom-area/left/auto-cash-out/right/multiplier/increase",
    btnDecreaseMultiplier: "/bottom-area/left/auto-cash-out/right/multiplier/decrease",
    btnAutoCashout: "/bottom-area/left/auto-cash-out/left/Toggle",
    btnCashoutFull: "cash-out-full",
    btnCashoutHalf: "cash-out-half",
    pathBetChip: "/popup-containers/bet-amount-popup-container/bet-amount-popup/Node/button-container/",
    //PF Setting
    btnPfSetting: "provably-fair-btn",
    ckbRandomSeed: "/ClientSeedSetting/content/main-content/seed-wrapper/toggle-container/random/checkmark",
    txtRandomSeed: "/ClientSeedSetting/content/main-content/seed-wrapper/random-section/bg/value",
    ckbManualSeed: "/ClientSeedSetting/content/main-content/seed-wrapper/toggle-container/manual",
    txtManualSeed: "/ClientSeedSetting/content/main-content/seed-wrapper/manual-section/bg-001/value",
    btnChangePfSetting: "/ClientSeedSetting/content/main-content/seed-wrapper/manual-section/btn-change",
    btnClosePFSetting: "/ClientSeedSetting/content/btn-close",
    iconPFGuideSetting: "icon-guide",
    btnCopyServerSeed: "copy-button",
    //Menu
    btnSound: "sfx",
    btnguide: "/btn-menu/expandable-layout/guide",
    btnHistory: "history",
    btnMenu: "btn-menu",
    btnLobby: "lobby-out-side",
    btnClosePFGuide: "/pf-intro-container/pf-intro-popup/popup/main/btn-close",
    btnCloseGuide: "/game-guide-container/game-guide/popup/main/btn-close",
    //AUTO Play Setting Popup
    btnCloseAutoPlay: "/auto-play-popup/bg/main-popup-close-btn",
    pathNumAutoPlay: "/auto-play-popup-container/auto-play-popup/bg/main/content/",
    lblCountDownAutoPlay: "/auto-play/auto-play-button/bg/number-rounds-value",
    //Multiplier Setting Popup
    btnCloseMultiplier: "/auto-cash-out-popup-container/auto-cash-out-popup/main-popup-close-btn",
    pathNumMultiplier: "/auto-cash-out-popup-container/auto-cash-out-popup/bg/content/numbers/",
    btnConfirmAutoCashout: "confirm-button",
    // History
    lblHistoryRoundId: "round",
    lblHistoryTotalBet: "/bet-history-body-item/node/lblTotalStake",
    lblHistoryWin: "/bet-history-body-item/node/lblWin",
    btnCloseHistory: "btnClosed",
    //History detail
    lblHistoryDetailRoundId: "/defail-summary-table/bet-details-summary-table/result-table/round/roundId-value",
    lblHistoryDetailTotalBet: "/detail-table/scrollview/view/content/rows/bet-detail-item/lblBet",
    lblHistoryDetailTotalWin: "/detail-table/scrollview/view/content/rows/bet-detail-item/lblWin",
    btnCloseHistoryDetail: "/bet-detail-dialog/popup/back-wrapper/btnClosed",
    // PF History
    btnHistoryPF: "/bet-history-dialog/popup/back-wrapper/table-bg/content/bet-history-body-item/node/verify",
    btnCloseHistorPF: "/PFVerification/content/popup-icon-close",
    iconHistoryPFGuide: "/PFVerification/content/title-section/icon-guide",
    lblClientSeed: "/PFVerification/content/client-seed/merge-cs/label-copy/bg/mask/Label",
    lblHistoryPFRoundId: "/PFVerification/content/result-table/round/roundId-value"
    
   
   
   
   
,

};

export const HyperSpin_Locators = {
    btnHyperSpin: "portrait-hyper-spin-button",
    lblHyperSpinStatus: "lblHyperSpinStatus",
    hyperSpinHeader: "hyper-spin-header",
    totalWinHeader: "total-win-header",
    totalBetHeader: "total-bet-header",
    lblStartingBalance: "starting-balance-value",
    btnSetting: "/settings-play-section/control-toogle",
    btnSpin: "/settings-play-section/play-pause-button/play-hyper-spin-button",
    btnDescreaseBetAmount: "/settings-play-section/frame/decrease-total-bet-per-round",
    btnIncreaseBetAmount: "/settings-play-section/frame/increase-total-bet-per-round",
    btnSimpleMode: "/settings-play-section/simple-mode",
    lblBalance: "/hyper-spin-info-player/balance-container/balance",
    lblTotalBet: "/hyper-spin-info-player/bet/total-bet",
    lblTotalWin: "/hyper-spin-info-player/total-win/hyper-total-win-value",
    //setting controls
    btnDecreaseTotalBetSlider: "/hyper-spin-controls/total-bet-slider/frame/decrease-total-bet-button",
    btnIncreaseTotalBetSlider: "/hyper-spin-controls/total-bet-slider/frame/increase-total-bet-button",
    lblNumberOfSpins: "/hyper-spin-controls/number-of-spins/number-of-spins-content",
    lblStopOnProfitValue: "stop-on-profit-value", 
    btnDecreaseStopOnProfit: "/hyper-spin-controls/stop-on-profit/frame/decrease-stop-on-profit-button",
    btnIncreaseStopOnProfit: "/hyper-spin-controls/stop-on-profit/frame/increase-stop-on-profit-button",
    lblStopOnLossValue: "stop-on-loss-value",
    btnDecreaseStopOnLoss: "/hyper-spin-controls/stop-on-loss/frame/decrease-stop-on-loss-button",
    btnIncreaseStopOnLoss: "/hyper-spin-controls/stop-on-loss/frame/increase-stop-on-loss-button",
    btnStopOnFeature: "/hyper-spin-controls/stop-on-feature/stop-on-feature-btn",
    lblTotalBetSliderValue: "total-bet-slider-value",
    cbOnStopOnProfit: "stop-on-feature-on",
    cbOffStopOnProfit: "stop-on-feature-off",
}