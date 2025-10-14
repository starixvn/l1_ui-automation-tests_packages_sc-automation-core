// Common paths to avoid repetition
const CANVAS = "Canvas";
const CENTER = "Canvas/center";
const BET_CONTAINER = "Canvas/center/full-widget/container/low/bottom-center/portrait-bottom-area/bet-container/totalBetContainer/total-bet/portrait-bet-control/container";
const AUTO_PLAY = "Canvas/center/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/container";
const MENU = "Canvas/center/full-widget/container/low/in-game-menu/outer-menu/btn-menu/expandable-layout";

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
    btnBetIncrease: `${CENTER}/full-widget/container/high/center/betamout-increase`,
    btnBetDecrease: `${CENTER}/full-widget/container/high/center/betamout-decrease`,
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
    btnLobby: `${MENU}/lobby`,
    btnMusic: `${MENU}/music`,
    btnSound: `${MENU}/sfx`,

    // Free spin
    lblFSTotalWin: `${CANVAS}/center/buy-freespin-container/buy-fs-container/buy-fs-congratulation/body/win`,
    btnYesBuyFS: `${CANVAS}/center/buy-freespin-container/buy-fs-container/buy-fs-confirmation/container/popup-bg/content/buttons/yes`,
    btnNoBuyFS: `${CANVAS}/center/buy-freespin-container/buy-fs-container/buy-fs-confirmation/container/popup-bg/content/buttons/no`,
    txtFreeSpinCount: `${CENTER}/full-widget/container/freespins-section/freespins-section/remaining-freespins/freespin-count`,

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
    btnClosePopup: "btnClosed"
};