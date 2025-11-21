import { GameEvent } from "../_shared";
import { BaseGame } from "./base-game";
import { baseLocatorNames } from "./base-game-locator";
import * as numberGameLocator from "./base-number-game-locator";

export class BasePlayer {
    readonly game: BaseGame;

    constructor(game: BaseGame) {
        this.game = game;
    }

    async placeHedgeBet(hedgeChoices: string[], amount: number = 1, subGameName?: string): Promise<void> {
        await this.game.waitUntilPlaceBet(subGameName);
        await this.betOn(hedgeChoices[0], amount, subGameName);
        return await this.betOn(hedgeChoices[1], amount, subGameName);
    }

    async gnPlaceHedgeBet(hedgeChoices: string[], amount: number = 1): Promise<void> {
        const odds = await this.game.gnWaitUntilPlaceBet();
        await this.game.click(`#chip-${amount}`);
        await this.game.click(hedgeChoices[0],500);
        await this.game.click(hedgeChoices[1],500);
        return odds
    }

    async mbPlaceHedgeBet(hedgeChoices: string[], amount: number = 1): Promise<void> {
        const isFrame = await this.game.page.$("#frmGame")
        if (isFrame) {
            const framelocator =  this.game.page.frameLocator("#frmGame")
            await framelocator.locator(`//span[contains(@class,'chip-slider_value')][text()='${amount}']`).click({delay: 500});
            await framelocator.locator(hedgeChoices[0]).click();
            await this.game.waitForTimeout(500)
            await framelocator.locator(hedgeChoices[1]).click();
        }
        else{
            const betChip = `//span[contains(@class,'chip-slider_value')][text()='${amount}']`
            await this.game.click(betChip);
            await this.game.click(hedgeChoices[0],500);
            await this.game.click(hedgeChoices[1],500);
        }

    }

    async placeMaxBet(choice: string, maxBetAmount: number[], subGameName?: string): Promise<void> {
        if (!this.game.gameConfiguration.cardgame) {
            await this.game.waitUntilPlaceBet(subGameName);
        }
        if (this.game.gameConfiguration.cardgame) {
            await this.game.clickLocator(`btnCancelBet`);
            await this.game.clickToChoice(choice);
            for (let index = 0; index < 10; index++) {
                await this.game.clickLocator(`btnRightArrow`);
            }
            await this.game.clickToChoice(choice);
        } else if (this.game.gameConfiguration.betBoard) {
            await this.game.clickToChoice(choice);
            await this.game.clickStake(maxBetAmount[0]);
            await this.game.clickSubmitBet();
            await this.game.clickToChoice(choice);
            for (let index = 0; index < 10; index++) {
                await this.game.clickStake(maxBetAmount[1]);
            }
            await this.game.clickSubmitBet();
        } else {
            await this.betOn(choice, maxBetAmount[0], subGameName);
            for (let index = 0; index < 10; index++) {
                await this.game.clickLocator(`btnRightArrow`);
            }
            await this.game.clickToChoice(choice);
        }
        return this.game.waitForEndBet(subGameName);
    }

    async placeBet(choice: string, amount = 1, subGameName?: string): Promise<any> {
        if (this.game.gameConfiguration.slotsgame) {
            return this.betOnSlot(choice, amount);
        }
        if (this.game.gameConfiguration.cardgame) {
            return this.betOnCard(choice, amount);
        } else {
            let placeBetResponse = await this.betOn(choice, amount, subGameName);
            console.log('placeBetResponse', placeBetResponse);
            if (!placeBetResponse || placeBetResponse.endBet == -1) {
                console.log('Wait until next round then place bet !');
                await this.game.waitUntilPlaceBet(subGameName);
                placeBetResponse = await this.betOn(choice, amount, subGameName);
            }
            return placeBetResponse
        }
    }

    async placeBetCocos(betBoard:boolean, choice: string, amountLocator?:string): Promise<any> {
        if (betBoard) {
            await this.game.clickCocos(choice, 1000);
            if (amountLocator) {
                await this.game.clickCocos(amountLocator,1000);
                await this.game.clickCocos("button.ok");
            }
        }
        else {
            await this.game.clickCocos(choice);
        }
    }

    async placeBetTapGame(locator: any,amountLocator: string, totalTaps: number): Promise<any> {
        // Setup socket event listeners
        this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
        this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
        this.game.attachSocketAndCaptureEvent(GameEvent.RecentBet);

        // First, click btnPlay
        await this.game.clickCocos(amountLocator, 1000);
        await this.game.clickCocos(locator.btnPlay, 1000);
        
        // Get latest placeBetResponse and status
        let recentBet = await this.game.latestCaptureEvent(GameEvent.RecentBet);
        let winStatus = await this.game.latestCaptureEvent(GameEvent.WinStatus);
        let endBet = await this.game.latestCaptureEvent(GameEvent.EndBet);
        let roundId = endBet?.roundId || endBet?.endBet?.roundId || '';

        // If status returns "win": false (failed), return status message immediately
        if (winStatus) { 
            return {winStatus, recentBet, roundId};
        }

        for (let i = 0; i < totalTaps; i++) {
            // Reset captured event to ensure we wait for new response
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.RecentBet);
            
            // Click btnGo
            await this.game.clickCocos(locator.btnGo, 1000);
            
            // Get latest status
            recentBet = await this.game.latestCaptureEvent(GameEvent.RecentBet);
            winStatus = await this.game.latestCaptureEvent(GameEvent.WinStatus);

            // If status returns "win": false (failed), break loop and return status
            if (winStatus) { 
                // Get latest endBet to ensure we have correct roundId
                endBet = await this.game.latestCaptureEvent(GameEvent.EndBet);
                roundId = endBet?.roundId || endBet?.endBet?.roundId || roundId;
                return {winStatus, recentBet, roundId};
            }
        }

        // If after totalTaps clicks the status still doesn't have win:false, click btnCashOut
        if (!winStatus) {
            this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.RecentBet);
            await this.game.clickCocos(locator.btnCashOut, 1000);
            // Get final status after cash out
            recentBet = await this.game.latestCaptureEvent(GameEvent.RecentBet);
            winStatus = await this.game.latestCaptureEvent(GameEvent.WinStatus);
            endBet = await this.game.latestCaptureEvent(GameEvent.EndBet);
            roundId = endBet?.roundId || endBet?.endBet?.roundId || roundId;
        }

        // Finally, return message status
        return {winStatus, recentBet, roundId};
    }

    async gnQuickPlaceBet(choice: string, amount: number): Promise<any> {
        const odds = await this.game.gnWaitUntilPlaceBet();
        await this.gnBetOn(choice, amount);
        const endBets =await this.game.waitForEndBet();
        return {endBet: endBets.endBet, odds: odds};
    }

    async mbQuickPlaceBet(choice: string, amount: number,subGameName?: string): Promise<any> {
        const isQuickBet = await this.game.page.locator("//button[contains(@class,'btn-red')]").count();
        if (isQuickBet > 0) {
            await this.game.click("//button[contains(@class,'btn-red')]",500);
        }
        let placeBetResponse = await this.mbBetOn(choice, amount,subGameName);;
        if (!placeBetResponse || placeBetResponse.endBet == -1) {
            console.log('Wait until next round then place bet !');
            await this.game.waitUntilPlaceBet(subGameName);
            placeBetResponse = await this.mbBetOn(choice, amount,subGameName);;
        }
        return placeBetResponse
    }

    async selectPayline(choice: string): Promise<void> {
        await this.game.clickLocator(baseLocatorNames.btnPayline, 1000);
        await this.game.clickLocator(baseLocatorNames.btnClearPayline, 2000);
        await this.game.clickLocator(choice, 1500);
        await this.game.clickLocator(baseLocatorNames.btnConfirmPayline, 1000);
    }

    async selectBetStake(stake: string): Promise<void> {
        await this.game.clickLocator(baseLocatorNames.cboBetLevel);
        await this.game.clickLocator(stake, 1000);
    }

    async placeBetClassicSlot(choice: string, stake: string): Promise<any> {
        await this.selectPayline(choice);
        await this.selectBetStake(stake);
        await this.game.clickSubmitBet();

        return await this.game.waitForEndBet();
    }

    async betOn(choice: string, amount: number = 1, subGameName?: string): Promise<any> {
        await this.game.clickToChoice(choice);
        if (this.game.gameConfiguration.betBoard) {
            await this.game.waitForTimeout(1000)
            await this.game.clickStake(amount);
            await this.game.clickSubmitBet();
        }

        return this.game.waitForEndBet(subGameName);
    }

    async gnSettingPF(clientseed: string ): Promise<any> {
        await this.game.click(numberGameLocator.commonControls.iconMenu,1000);
        await this.game.click(numberGameLocator.commonControls.iconPF,1000);
        if (clientseed) {
            await this.game.click(numberGameLocator.commonControls.chkManualSeed,1000);
            await this.game.page.fill(numberGameLocator.commonControls.txtManualSeed,clientseed);
        }
        else{
            await this.game.click(numberGameLocator.commonControls.chkRandomSeed,1000);
        }
        await this.game.click(numberGameLocator.commonControls.iconClosePfSetting,1000);
    }

    async gnBetOn(choice: string, amount: number): Promise<any> {
        const betChip = `#chip-${amount}`
        await this.game.click(betChip);
        await this.game.click(choice,0);
    }

    async mbBetOn(choice: string, amount: number,subGameName?: string): Promise<any> {
        const isFrame = await this.game.page.$("#frmGame")
        if (isFrame) {
            const framelocator =  this.game.page.frameLocator("#frmGame")
            await framelocator.locator(`//span[contains(@class,'chip-slider_value')][text()='${amount}']`).click({delay: 500});
            await framelocator.locator(choice).click();
        }
        else{
            const betChip = `//span[contains(@class,'chip-slider_value')][text()='${amount}']`
            await this.game.click(betChip,500);
            await this.game.click(choice,0);
        }
        
        return this.game.waitForEndBet(subGameName);
    }

    async betOnSlot(choice: string, amount = 1): Promise<any> {
        console.log('betOnSlot', choice);
        await this.game.clickSlotsStake(amount);
        await this.game.clickSubmitBet();

        return this.game.waitForEndBet();
    }

    async betOnCard(choice: string, amount = 1): Promise<any> {
        await this.game.clickStake(amount);
        await this.game.clickToChoice(choice);
        await this.game.clickSubmitBet();

        return this.game.waitForDeal();
    }

    async standCard(): Promise<any> {
        await this.game.clickStand();

        return this.game.waitForStandBet();
    }

    async openHistory(): Promise<any> {
        this.game.attachSocketAndCaptureEvent(GameEvent.History);

        await this.game.clickHistory();

        return this.game.latestCaptureEvent(GameEvent.History);
    }

    async clickOutSide(): Promise<any> {
        await this.game.clickOutSide();
    }

    async gnOpenHistory(): Promise<any> {
        await this.game.click(numberGameLocator.commonControls.iconMenu);
        await this.game.click(numberGameLocator.commonControls.iconHistory);
        await this.game.waitForTimeout(1000);
    }

    async gnOpenGuide(): Promise<any> {
        await this.game.click(numberGameLocator.commonControls.iconMenu);
        await this.game.click(numberGameLocator.commonControls.iconGuide);
        await this.game.waitForTimeout(4000);
    }

    async gnClosePopUp(): Promise<any> {
        await this.game.click(numberGameLocator.commonControls.iconClosePopUp);
        await this.game.waitForTimeout(1000);
    }
   
}
