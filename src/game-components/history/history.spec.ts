import { test, BaseGame } from "../../components";
import { expect } from "../../expects";
import { GameEvent } from "../../_shared";

export class BetHistory {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests() {
        test(`Verify data of the latest ticket`, async () => {
            // Act 1
            let ticketdata
            await test.step("Open history and get data", async () => {
               ticketdata = await getHistoryLatestTicket(this.game);
            });

            // Assert 1
            await test.step("Verify round id, total stake and bet win", async () => {
                expect(ticketdata.roundId, "verify round id").toEqual(global.settledata.roundId);
                expect(ticketdata.betamount, "verify total stake").toEqual(global.settledata.bet);
                expect(ticketdata.betwin, "verify total win").toEqual(global.settledata.betwin);
            });
            //Post-Act
            await test.step("Click outside to close history", async () => {
                await this.game.clickOutSide(1500);
            });
        });
    }

}

const getHistoryLatestTicket = async(game : BaseGame) => {
    game.attachSocketAndCaptureEvent(GameEvent.History)
    await game.clickHistory();
    await game.waitForTimeout(1000);
    let message = await game.latestCaptureEvent(GameEvent.History);
    console.log(message);
    let ticketdata = {
        roundId: message.history.betLogs[0].roundId ?? message.history.betLogs[0].id ?? -1,
        betwin: message.history.betLogs[0].betwin ?? message.history.betLogs[0].baseBetWin ?? -1,
        betamount: getBetAmount(global.settledata.choice, message.history.betLogs[0]),
    };
    return ticketdata;
}


function getBetAmount(betChoice : string, betLog:any) {
    const keys = Object.keys(betLog);
    const values = Object.values(betLog);
    const index = keys.indexOf(betChoice);
    return index !== -1 ? values[index] : undefined;
  }