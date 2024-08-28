import { test, BaseGame } from "../../components";
import { expect } from "../../expects";
import { GameEvent } from "../../_shared";
import { IBaseOptions } from "../../e2e-bases";

export class BetHistory {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }
    constructor(protected options: IBaseOptions) {}

    tests() {
        test(`Verify data of the latest ticket @TC_history`, async () => {
            // Act 1
            let ticketdata
            let roundid = this.options.historyItems?.roundid ?? "roundId";
            let betamount = this.options.historyItems?.betamount ?? "amount";
            let betwin = this.options.historyItems?.betwin ?? "betwin";
            await test.step("Open history and get data", async () => {
               ticketdata = await getHistoryLatestTicket(this.game, roundid, betamount, betwin);
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

const getHistoryLatestTicket = async(game : BaseGame, roundid : string, betamount : string, betwin : string ) => {
    game.attachSocketAndCaptureEvent(GameEvent.History)
    await game.clickHistory();
    await game.waitForTimeout(1000);
    let message = await game.latestCaptureEvent(GameEvent.History);
    let ticketdata = {
        roundid: getDataBetLog(roundid, message.history.betLogs[0]),
        betwin: getDataBetLog(betwin, message.history.betLogs[0]),
        betamount: getDataBetLog(betamount, message.history.betLogs[0]),
    };
    return ticketdata;
}


function getDataBetLog(betChoice : string, betLog:any) {
    const keys = Object.keys(betLog);
    const values = Object.values(betLog);
    const index = keys.indexOf(betChoice);
    return index !== -1 ? values[index] : undefined;
  }