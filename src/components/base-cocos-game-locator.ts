// Common paths to avoid repetition
const CANVAS = "Canvas";
const CENTER = "Canvas/center";
const BET_CONTAINER = "Canvas/center/full-widget/container/low/bottom-center/portrait-bottom-area/bet-container/totalBetContainer/total-bet/portrait-bet-control/container";
const AUTO_PLAY = "Canvas/center/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/container";

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