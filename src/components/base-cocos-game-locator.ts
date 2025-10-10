const BASE_PATHS = {
    CANVAS: "Canvas",
    CENTER: "Canvas/center",
    FULL_WIDGET: "Canvas/center/full-widget/container/low/bottom-center/portrait-bottom-area",
    BET_CONTAINER: "Canvas/center/full-widget/container/low/bottom-center/portrait-bottom-area/bet-container/totalBetContainer/total-bet/portrait-bet-control/container",
    AUTO_PLAY: "Canvas/center/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/container",
    MENU: "Canvas/center/full-widget/container/low/in-game-menu/outer-menu/btn-menu/expandable-layout",
    FIRST_ROW: "Canvas/center/outer-container/outer-container/portrait-bet-history-container/portrait-bet-history-dialog/popup/back-wrapper/Node/table-bg/content/portrait-bet-history-body-item/node"
} as const;

export const Portrail_Cascading_Locators = {
    // Main UI Buttons
    btnPlayNow: `Canvas/splash/wraper-container/btn-play-now`,
    btnSpin: `btn-spin`,
    btnMenu: "btn-menu",
    btnHistory: "history",
    btnguide: "guide",
    btnBetIncrease: "Canvas/center/full-widget/container/high/center/betamout-increase",
    btnBetDecrease: "Canvas/center/full-widget/container/high/center/betamout-decrease",
    btnAutoSpin: "portrait-auto-spin-button",
    btnTurbo: "portrait-turbo-mode-button",
    iconTurboOFF: `${BASE_PATHS.CENTER}/full-widget/container/low/bottom-center/portrait-bottom-area/turbo-container/portrait-turbo-mode-button/icon-deactive`,
    iconTurboON: `${BASE_PATHS.CENTER}/full-widget/container/low/bottom-center/portrait-bottom-area/turbo-container/portrait-turbo-mode-button/check/icon-active`,
    btnBuyFS: `buy-fs-btn`,
    
    // Auto Spin Labels
    lbl10AutoSpin: `${BASE_PATHS.AUTO_PLAY}/10`,
    lbl30AutoSpin: `${BASE_PATHS.AUTO_PLAY}/30`,
    lbl50AutoSpin: `${BASE_PATHS.AUTO_PLAY}/50`,
    btnAutoSpinStart: "Canvas/center/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/start-button",
    btnAutoPlayTurbo: "Canvas/center/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/turbo-mode/turbo_toggle",
   
    // Bet Settings
    betAmountSetting: `${BASE_PATHS.FULL_WIDGET}/bet-container/totalBetContainer/total-bet/bet-click/value-container`,
    
    // Menu Items
    btnLobby: `${BASE_PATHS.MENU}/lobby`,
    btnMusic: `${BASE_PATHS.MENU}/music`,
    btnSound: `${BASE_PATHS.MENU}/sfx`,
    
    //Buy Free Spin
    btnYesBuyFS: `Canvas/center/buy-freespin-container/buy-fs-container/buy-fs-confirmation/container/popup-bg/content/buttons/yes`,
    btnNoBuyFS: `Canvas/center/buy-freespin-container/buy-fs-container/buy-fs-confirmation/container/popup-bg/content/buttons/no`,
    txtFreeSpinCount: `Canvas/center/full-widget/container/freespins-section/remaining-freespins/freespin-count`,



    // Bet Level Controls
    btnBetLevelIncrease: `${BASE_PATHS.BET_CONTAINER}/bet-level/frame/increase`,
    btnBetLevelIncreaseUnactive: `${BASE_PATHS.BET_CONTAINER}/bet-level/frame/increase/increase-unactive`,
    btnBetLevelDecrease: `${BASE_PATHS.BET_CONTAINER}/bet-level/frame/decrease`,
    btnBetLevelDecreaseUnactive: `${BASE_PATHS.BET_CONTAINER}/bet-level/frame/decrease/decrease-unactive`,
    
    // Coin Value Controls
    btnCoinValueIncrease: `${BASE_PATHS.BET_CONTAINER}/coin-value/frame/increase`,
    btnCoinValueIncreaseUnactive: `${BASE_PATHS.BET_CONTAINER}/coin-value/frame/increase/increase-unactive`,
    btnCoinValueDecrease: `${BASE_PATHS.BET_CONTAINER}/coin-value/frame/decrease`,
    btnCoinValueDecreaseUnactive: `${BASE_PATHS.BET_CONTAINER}/coin-value/frame/decrease/decrease-unactive`,
    
    // Total Bet Controls
    btnTotalBetIncrease: `${BASE_PATHS.BET_CONTAINER}/total-bet/frame/increase`,
    btnTotalBetIncreaseUnactive: `${BASE_PATHS.BET_CONTAINER}/total-bet/frame/increase/increase-unactive`,
    btnTotalBetDecrease: `${BASE_PATHS.BET_CONTAINER}/total-bet/frame/decrease`,
    btnTotalBetDecreaseUnactive: `${BASE_PATHS.BET_CONTAINER}/total-bet/frame/decrease/decrease-unactive`,
    
    // Popup Controls
    iconCloseAutoPlay: "Canvas/center/auto-play-lazyload-container/auto-play-container/auto-play-popup/container/popup-bg/main-popup-close-btn",
    iconCloseMainPopup: "main-popup-close-btn",
    btnClosePopup: "btnClosed",
    popAutoSpin: "Canvas/center/auto-scale-widget/new/auto-play-lazyload-container/auto-play-container/auto-play-popup",    

    // Text Values
    txtOperator: `${BASE_PATHS.CENTER}/operator-section/text`,
    txtBetLevelValue: `${BASE_PATHS.BET_CONTAINER}/bet-level/frame/bet-value`,
    txtCoinValue: `${BASE_PATHS.BET_CONTAINER}/coin-value/frame`,
    txtTotalBetValue: `${BASE_PATHS.BET_CONTAINER}/total-bet/frame`,
    txtbottomBalance: `${BASE_PATHS.CENTER}/info-player/balance-container/balance`,
    txtbottomTotalBet: `${BASE_PATHS.CENTER}/info-player/bet/total-bet`,
    txtbottomWin: `${BASE_PATHS.CENTER}/info-player/total-win/total-win`,  
    txtcenterWin: `Canvas/center/auto-scale-widget/new/messages/Node/tumble-win-view/total-win/total_win`, 
    txtMessageCenter: `Canvas/center/auto-scale-widget/new/messages/Node/messages-bottom/text`,
    txtautoSpinCount: `${BASE_PATHS.CENTER}/full-widget/container/high/center/btn-spin/autospin/autospin-count`, 


    //history
    txtHistoryRoundId : `${BASE_PATHS.FIRST_ROW}/round/lblRound`,
    txtHistoryTotalBet : `${BASE_PATHS.FIRST_ROW}/total-bet`, 
    txtHistoryWin : `${BASE_PATHS.FIRST_ROW}/total-win`,

    //history detail
    btnBackHistory: "Canvas/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/wraper",
    iconCloseHistoryDetail: "Canvas/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/btnClosed",
    txtHistoryDetailRoundId: "Canvas/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/Node/title/id",
    txtHistoryDetailBetLevel: "lblBetLevelValue",
    txtHistoryDetailBetCoinValue: "lblBetCoinValue",
    txtHistoryDetailTotalBet: "lblBetValue",
    txtHistoryDetailWin: "Canvas/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/bottom-section/total-win/Node/value",
    txtHistoryDetailMultiplier: "Canvas/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/bottom-section/total-win/Node/mutipler",
    txtHistoryDetailTitleFirstRow: "Canvas/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/content-table/scroll-view/view/content/portrait-ticket-detail-item/title/payout",
    txtHistoryDetailTotalFreeSpin: "Canvas/center/outer-container/outer-container/portrait-bet-details-container/portrait-ticket-detail/popup/back-wrapper/content-table/scroll-view/view/content/portrait-ticket-detail-item/node/tumble-win-detail/portrait-tumble-win-detail-item/node/win/value",
}