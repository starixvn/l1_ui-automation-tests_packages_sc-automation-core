import { GameEvent } from "./../_shared";
import { test, BasePlayer, BaseGame } from "./../components";
import { expect } from "../expects";
import { MiniGameBase } from "./mini-game-base.spec";

export class BalancedBettingGameBase extends MiniGameBase {
    game: BaseGame;
    player: BasePlayer;

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1, refund: 0 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.History);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(8000);
            console.log(settledResults,'click on history icon');
            let historyPayload = await this.player.openHistory();
            if (Object.keys(historyPayload).length === 0) {
                historyPayload = await this.player.openHistory();
            }
            const ticketHistory = historyPayload.history.betLogs.shift() || 0;
            bet.refund = ticketHistory.refund;

            await this.game.clickOutSide();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            expect(bet).toMatchWinningAndRefund(settledResults);
        });
    }

    ticketHistoryTests() {}
}
