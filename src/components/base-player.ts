import { GameEvent } from "../_shared";
import { BaseGame } from "./base-game";
import { baseLocatorNames } from "./base-game-locator";

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

        await this.game.clickHistory(1500);

        return this.game.latestCaptureEvent(GameEvent.History);
    }

    async clickOutSide(): Promise<any> {
        await this.game.clickOutSide();
    }
}
