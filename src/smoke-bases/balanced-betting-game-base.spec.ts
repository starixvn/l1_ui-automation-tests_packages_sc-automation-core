import { GameEvent } from "./../_shared";
import { test, BasePlayer, BaseGame } from "./../components";
import { expect } from "../expects";
import { MiniGameBase } from "./mini-game-base.spec";

export class BalancedBettingGameBase extends MiniGameBase {
    game: BaseGame;
    player: BasePlayer;

    protected placeBetAndSettleTests() {
        test("Place a bet on a valid bet choice.", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1, refund: 0 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.History);
            const { placeBetResponse, settledResults } = await test.step("Verify that the bet is successfully placed.", async () => {
                // Act
                const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
                const settledResults = await this.game.waitForSettlement();
                await this.game.waitUntilPlaceBet();
                let historyPayload = await this.player.openHistory();
                let retryCount = 0;
                while (Object.keys(historyPayload).length === 0 && retryCount < 2) {
                    historyPayload = await this.player.openHistory();
                    retryCount++;
                }

                const ticketHistory = historyPayload.history.betLogs.shift() || 0;
                bet.refund = ticketHistory.refund;
                return { placeBetResponse, settledResults };
            });
            await this.game.clickOutSide();
            await test.step("Confirm that the bet is settled correctly.", async () => {
                // Assert
                expect(placeBetResponse.endBet).toBe(bet.amount);
                expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
                expect(bet).toMatchWinningAndRefund(settledResults);
            });
        });
    }

    ticketHistoryTests() {}
}
