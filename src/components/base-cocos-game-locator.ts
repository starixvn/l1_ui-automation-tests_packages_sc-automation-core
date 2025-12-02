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
    txtHistoryTitle: `${MINI_GAME_DIALOG}/GameNameHistory/history-frame/BetDetail/auto scale/back-wrapper/wrapper/Content/GameNameHistoryItem/node/Time`,
    txtHistoryRoundId: `${MINI_GAME_DIALOG}/GameNameHistory/history-frame/BetDetail/auto scale/back-wrapper/wrapper/Content/GameNameHistoryItem/node/New Node/round`,
    txtHistoryTotalBet: `${MINI_GAME_DIALOG}/GameNameHistory/history-frame/BetDetail/auto scale/back-wrapper/wrapper/Content/GameNameHistoryItem/node/Cuoc`,
    txtHistoryWin: `${MINI_GAME_DIALOG}/GameNameHistory/history-frame/BetDetail/auto scale/back-wrapper/wrapper/Content/GameNameHistoryItem/node/Win`,
    txtHistoryDetailInfo: `${MINI_GAME_DIALOG}/GameNameBetHistory/betdetail-frame/BetDetail/auto_scale/back_wrapper/wrapper/BetInfo`,
    lblMiniWarning: `Canvas/mini-panel/MiniPanel/MiniGames/GameName/Background/notice/mini_warning`,
    btnCloseHistoryDetail: `${MINI_GAME_DIALOG}/GameNameBetHistory/betdetail-frame/BetDetail/auto_scale/back_wrapper/CloseButton`,
    btnCloseHistory: `${MINI_GAME_DIALOG}/GameNameHistory/history-frame/BetDetail/auto scale/back-wrapper/CloseButton`,
    lblHedgeWarning: "Chỉ được cược 1 bên.",
    btnLobby: "Canvas/UI_landscape/menu-area/InGameMenu/home-icon",
    btnMenu: "Canvas/UI_landscape/menu-area/InGameMenu/expandableMenu", 
    btnCloseGuide: "Canvas/mini-panel/MiniPanel/GuideContainer/new-guide/main/background/CloseButton"

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
    lblRoundId: "Canvas/full/content/scroll/scroll-content/RoundID",
    btnPlay: "start-bet-button",
    btnCashOut: "cash-out-button",
    btnGo: "hit-stone-button",
    inputBetAmount: "bet-amount-container",
    pathBetChip: "Canvas/full/content/scroll/scroll-content/bet-control/top/Layout/input-container/content/",
    btnHalfBet: "half-bet",
    btnDoubleBet: "double-bet",
    btnAutoPlay: "Canvas/full/content/scroll/scroll-content/bet-control/play-mode-layout/play-mode-buttons/auto-play",
    //AUTO Play Bet Setting Popup
    btnStartAutoPlay: "Canvas/auto-lazy-load-container/lazy-load-container/auto-play-popup-container/auto-play-popup/auto-play-container/btn-start",
    btnIncreaseStep: "Canvas/auto-lazy-load-container/lazy-load-container/auto-play-popup-container/auto-play-popup/auto-play-container/step-to-cash-out/no-of-auto-lanes-container/increase",
    btnDecreaseStep: "Canvas/auto-lazy-load-container/lazy-load-container/auto-play-popup-container/auto-play-popup/auto-play-container/step-to-cash-out/no-of-auto-lanes-container/decrease",
    lblAutoPlayMultiplier: "Canvas/auto-lazy-load-container/lazy-load-container/auto-play-popup-container/auto-play-popup/auto-play-container/multiplier/bg-betzone-001/value",
    btnCloseAutoPlay: "Canvas/auto-lazy-load-container/lazy-load-container/auto-play-popup-container/auto-play-popup/auto-play-container/btn-close",
    btnLedBar: "Canvas/full/content/scroll/scroll-content/led-steps-container",
    pathNumAutoPlay: "Canvas/auto-lazy-load-container/lazy-load-container/auto-play-popup-container/auto-play-popup/auto-play-container/content/",
    txtNumStepAutoPlay: "Canvas/auto-lazy-load-container/lazy-load-container/auto-play-popup-container/auto-play-popup/auto-play-container/step-to-cash-out/no-of-auto-lanes-container/EditBox/TEXT_LABEL",
    lblCountDownAutoPlay: "Canvas/full/content/scroll/scroll-content/bet-control/play-mode-layout/btn-countdown/lbl-count-down",
    //*******************
    btnGameMode: "Canvas/full/content/scroll/scroll-content/bet-control/play-mode-layout/play-mode-buttons/game-mode",
    lblEasymode: "easy-mode",
    lblMediummode: "medium-mode",
    lblHardmode: "hard-mode",
    lblHardcoremode: "hardcore-mode",
    btnSound: "sfx",
    btnguide: "Canvas/full/content/scroll/scroll-content/auto-load-in-game-menu/in-game-menu/expandable-layout/guide",
    btnPfSetting: "Canvas/full/content/scroll/scroll-content/auto-load-in-game-menu/in-game-menu/expandable-layout/provably-fair-btn-001",
    ckbRandomSeed: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/layout/main-content/seed-wrapper/toggle-container/random/checkmark",
    txtRandomSeed: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/layout/main-content/seed-wrapper/random-section/bg/value",
    ckbManualSeed: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/layout/main-content/seed-wrapper/toggle-container/manual/checkmark",
    txtManualSeed: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/layout/main-content/seed-wrapper/manual-section/bg-001/editor-manual/TEXT_LABEL",
    btnClosePFSetting: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/title-section/btn-close/btn-close-001",
    iconPFGuideSetting: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/title-section/icon-guide",
    btnCopyServerSeed: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/layout/server-seed-hash/label-copy/bg/copy-button",
    lblGameName: "game-name",
    lblRtp: "rtp",
    lblAllBets: "lbl-top",
    btnHistory: "Canvas/full/content/scroll/scroll-content/auto-load-bet-result-container-portrait/bet-result-container-portrait/tabheader/toggle-my-bet",
    btnLobby: "Canvas/full/content/scroll/scroll-content/back-to-lobby/outer-menu/lobby/lobby-out-side",
    btnCloseSoundSetting: "Canvas/auto-lazy-load-container/lazy-load-container/volume-container/volume-dialog/popup/back-wrapper/btnClosed",
    iconSoundSetting: "Canvas/auto-lazy-load-container/lazy-load-container/volume-container/volume-dialog/popup/back-wrapper/sfx",
    iconMusicSetting: "Canvas/auto-lazy-load-container/lazy-load-container/volume-container/volume-dialog/popup/back-wrapper/music",
    iconPFGuide: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/ClientSeedSetting/content/title-section/icon-guide",
    lblAUtoCashoutNotice: "Canvas/full/content/scroll/scroll-content/auto-lazy-load-notice-container/lazy-load-notice-container/auto-cashout-nottice",
    txtHistoryRound: "Canvas/full/content/scroll/scroll-content/auto-load-bet-result-container-portrait/bet-result-container-portrait/tabcontent/content-my-bet/my-bet-table/my-bet-body/my-bet-table-body/view/content/",
    lblHistoryDetailRoundId: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/defail-summary-table/bet-details-summary-table/result-table/round/roundId-value",
    lblHistoryDetailCrashPoint: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/defail-summary-table/bet-details-summary-table/result-table/Node/crash-point-value",
    lblHistoryDetailTotalBet: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/detail-log-table/bet-detail-log-table/detail-table/content/total/valueBet",
    lblHistoryDetailTotalWin: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/detail-log-table/bet-detail-log-table/detail-table/content/total/valueWin",
    lblHistoryDetailMultiplier: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/detail-log-table/bet-detail-log-table/detail-table/content/rows/bet-detail-item/lblMultiplier",
    btnCloseHistoryDetail: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/btnClosed",
    btnCloseHistoryDetailPF: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/PFVerification/content/title-section/btn-close",
    btnHistoryDetailPF: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/detail-log-table/bet-detail-log-table/PF",
    iconHistoryDetailPFGuide: "Canvas/auto-lazy-load-container/lazy-load-container/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/detail-log-table/bet-detail-log-table/PF",
    lblClientSeed: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/PFVerification/content/content-section/view/content/layout/client-seed/merge-cs/label-copy/bg/mask/Label",
    lblHistoryDetailPFRoundId: "Canvas/auto-lazy-load-container/lazy-load-container/custome-pf-container/pf-popup-container/container/PFVerification/content/round-info/round/roundId-value",
    btnClosePFGuide: "Canvas/auto-lazy-load-container/lazy-load-container/pf-intro-container/pf-intro-popup-portrait/popup/content/popup-icon-close/popup-icon-close-001",
    btnCloseGuide: "Canvas/auto-lazy-load-container/lazy-load-container/game-guide-direct-container/game-guide-portrait/popup/main/btn-close"
}

export const CrashGame_Locators = {
    //Main Controls
    btnEarlyBet: "Canvas/center/auto-scale-widget/bottom-area/right/early-bet-button",
    btnPlaceBet: "Canvas/center/auto-scale-widget/bottom-area/right/place-bet-button",
    btnCashOut: "cash-out",
    lblRoundId: "RoundID",
    statisticsBar: "statistics-bar",
    btnCloseIcon: "close-icon",
    btnConfirmBetAmount: "confirm",
    btnStartAutoPlay: "start-button",
    iconAutoPlay: "auto-play-button",
    btnBetAmount: "bet-amount-container",
    btnIncreaseBetAmount: "Canvas/center/auto-scale-widget/bottom-area/left/bet-amount-wrapper/bet-input/increase",
    btnDecreaseBetAmount: "Canvas/center/auto-scale-widget/bottom-area/left/bet-amount-wrapper/bet-input/decrease",
    btnMultiplier: "Canvas/center/auto-scale-widget/bottom-area/left/auto-cash-out/right/multiplier",
    btnIncreaseMultiplier: "Canvas/center/auto-scale-widget/bottom-area/left/auto-cash-out/right/multiplier/increase",
    btnDecreaseMultiplier: "Canvas/center/auto-scale-widget/bottom-area/left/auto-cash-out/right/multiplier/decrease",
    btnAutoCashout: "Canvas/center/auto-scale-widget/bottom-area/left/auto-cash-out/left/Toggle",
    btnCashoutFull: "cash-out-full",
    btnCashoutHalf: "cash-out-half",
    pathBetChip: "Canvas/center/auto-scale-widget/popup-containers-lazy-load/popup-containers/bet-amount-popup-container/bet-amount-popup/Node/button-container/",
    //PF Setting
    btnPfSetting: "provably-fair-btn",
    ckbRandomSeed: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/main-content/seed-wrapper/toggle-container/random/checkmark",
    txtRandomSeed: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/main-content/seed-wrapper/random-section/bg/value",
    ckbManualSeed: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/main-content/seed-wrapper/toggle-container/manual",
    txtManualSeed: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/main-content/seed-wrapper/manual-section/bg-001/value",
    btnChangePfSetting: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/main-content/seed-wrapper/manual-section/btn-change",
    btnClosePFSetting: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/btn-close",
    iconPFGuideSetting: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/title-section/icon-guide",
    btnCopyServerSeed: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/ClientSeedSetting/content/server-seed-hash/label-copy/bg/copy-button",
    //Menu
    btnSound: "sfx",
    btnguide: "Canvas/outter-lazy-load-container/outter-containers-landscape/in-game-menu/outer-menu/btn-menu/expandable-layout/guide",
    btnHistory: "Canvas/outter-lazy-load-container/outter-containers-landscape/in-game-menu/outer-menu/btn-menu/expandable-layout/history",
    btnMenu: "Canvas/outter-lazy-load-container/outter-containers-landscape/in-game-menu/outer-menu/btn-menu",
    btnLobby: "Canvas/outter-lazy-load-container/outter-containers-landscape/in-game-menu/outer-menu/lobby/lobby-out-side",
    btnClosePFGuide: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-intro-container/pf-intro-popup/popup/main/btn-close",
    btnCloseGuide: "Canvas/outter-lazy-load-container/outter-containers-landscape/game-guide-container/game-guide/popup/main/btn-close",
    //AUTO Play Setting Popup
    btnCloseAutoPlay: "Canvas/center/auto-scale-widget/popup-containers-lazy-load/popup-containers/auto-play-popup-container/auto-play-popup/bg/main-popup-close-btn",
    pathNumAutoPlay: "Canvas/center/auto-scale-widget/popup-containers-lazy-load/popup-containers/auto-play-popup-container/auto-play-popup/bg/main/content/",
    lblCountDownAutoPlay: "Canvas/center/auto-scale-widget/bottom-area/auto-play/auto-play-button/bg/number-rounds-value",
    //Multiplier Setting Popup
    btnCloseMultiplier: "Canvas/center/auto-scale-widget/popup-containers-lazy-load/popup-containers/auto-cash-out-popup-container/auto-cash-out-popup/main-popup-close-btn",
    pathNumMultiplier: "Canvas/center/auto-scale-widget/popup-containers-lazy-load/popup-containers/auto-cash-out-popup-container/auto-cash-out-popup/bg/content/numbers/",
    btnConfirmAutoCashout: "confirm-button",
    // History
    lblHistoryRoundId: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-container/bet-history-dialog/popup/back-wrapper/table-bg/content/bet-history-body-item/node/round",
    lblHistoryTotalBet: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-container/bet-history-dialog/popup/back-wrapper/table-bg/content/bet-history-body-item/node/lblTotalStake",
    lblHistoryWin: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-container/bet-history-dialog/popup/back-wrapper/table-bg/content/bet-history-body-item/node/lblWin",
    btnCloseHistory: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-container/bet-history-dialog/popup/back-wrapper/btnClosed",
    //History detail
    lblHistoryDetailRoundId: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/defail-summary-table/bet-details-summary-table/result-table/round/roundId-value",
    lblHistoryDetailTotalBet: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/detail-log-table/bet-detail-log-table/detail-table/scrollview/view/content/rows/bet-detail-item/lblBet",
    lblHistoryDetailTotalWin: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/detail-log-table/bet-detail-log-table/detail-table/scrollview/view/content/rows/bet-detail-item/lblWin",
    btnCloseHistoryDetail: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-details-container/bet-detail-dialog/popup/back-wrapper/btnClosed",
    // PF History
    btnHistoryPF: "Canvas/outter-lazy-load-container/outter-containers-landscape/bet-history-container/bet-history-dialog/popup/back-wrapper/table-bg/content/bet-history-body-item/node/verify",
    btnCloseHistorPF: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/PFVerification/content/popup-icon-close",
    iconHistoryPFGuide: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/PFVerification/content/title-section/icon-guide",
    lblClientSeed: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/PFVerification/content/client-seed/merge-cs/label-copy/bg/mask/Label",
    lblHistoryPFRoundId: "Canvas/outter-lazy-load-container/outter-containers-landscape/pf-popup-container/container/PFVerification/content/result-table/round/roundId-value"
    
   
   
   
   
,

}
;