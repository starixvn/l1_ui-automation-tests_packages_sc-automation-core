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
        await this.betOn(hedgeChoices[1], amount, subGameName);
    }

    async gnPlaceHedgeBet(hedgeChoices: string[], amount: number = 1): Promise<void> {
        const odds = await this.game.gnWaitUntilPlaceBet();
        await this.game.click(`#chip-${amount}`);
        await this.game.click(hedgeChoices[0],200);
        await this.game.click(hedgeChoices[1],200);
        return odds
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
    }

    async placeBet(choice: string, amount = 1, subGameName?: string): Promise<any> {
        if (this.game.gameConfiguration.slotsgame) {
            return this.betOnSlot(choice, amount);
        }
        if (this.game.gameConfiguration.cardgame) {
            return this.betOnCard(choice, amount);
        } else {
            await this.game.waitUntilPlaceBet(subGameName);

            return this.betOn(choice, amount, subGameName);
        }
    }

    async gnQuickPlaceBet(choice: string, amount: number): Promise<any> {
        const odds = await this.game.gnWaitUntilPlaceBet();
        await  this.gnBetOn(choice, amount);
        const endBets =await this.game.waitForEndBet();
        return {endBet: endBets.endBet, odds: odds};
    }

    async gnSlowPlaceBet(choice: string, amount: number): Promise<any> {
        const odds = await this.game.gnWaitUntilPlaceBet();
        await this.gnSetQuickBet(false);
        await  this.gnBetOn(choice, amount);
        await this.game.click(numberGameLocator.commonControls.btnConfirmBet);
        const endBets =await this.game.waitForEndBet();
        return {endBet: endBets.endBet, odds: odds};
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
            await this.game.clickStake(amount);
            await this.game.clickSubmitBet();
        }

        return this.game.waitForEndBet(subGameName);
    }

    async gnSetQuickBet(quickbet: boolean = true): Promise<any> {
        console.log(quickbet);
        // removed funtions
        // const isCheck = await this.game.page.locator(numberGameLocator.commonControls.chkQuickBet).isChecked();
        // if (quickbet == true && quickbet != isCheck) {
        //     await this.game.click(numberGameLocator.commonControls.iconQuickBet);
        //     await this.game.click(numberGameLocator.commonControls.btnConfirmQB);
        //     await this.game.waitForTimeout(1000);
        // } else if (quickbet == false && quickbet != isCheck) {
        //     await this.game.click(numberGameLocator.commonControls.iconQuickBet);
        //     await this.game.waitForTimeout(1000);
        // }
    }

    async gnSettingPF(clientseed: string ): Promise<any> {
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
        await this.game.click(choice);
    }

    async betOnSlot(choice: string, amount = 1): Promise<any> {
        await this.game.clickToSlotsChoice(choice);
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
