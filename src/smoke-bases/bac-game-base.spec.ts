import { test, BasePlayer, BaseGame } from "../components";
import { GameEvent } from "../_shared";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { MiniGameBase } from "./mini-game-base.spec";
const extraRate = 0.2;

export class BacGameBase extends MiniGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: IBaseOptions) {
        super(options);
    }

    protected placeBetAndSettleTests(): void {
        test("THEN player able to place a bet and settle", async () => {
          // Arrange
          test.setTimeout(this.options.gameConfiguration.maxTimeout);
          const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1};
          this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
                 
          // Act 
          await this.game.waitUntilPlaceBet();    
          await this.game.waitForTimeout(4000)
          const placeBetResponse = await this.player.betOn(bet.choice, bet.amount);
          const settledResults = await this.game.waitForSettlement();
    
          // Assert
          expect(placeBetResponse.endBet).toBe(bet.amount*(1 + extraRate));
          if (settledResults.settlementResult.tie) {
            expect(settledResults.winAmount).toEqual(bet.amount);
          } else if (settledResults.winStatus){
              expect(settledResults.winAmount).toBeGreaterThanOrEqual(bet.amount*settledResults.odds[bet.choice]);
          } else {
            expect(settledResults.winAmount).toEqual(0);
          }
    
        });
      }
      

    protected override runScenario(): void {
        super.runScenario();
    }
}
