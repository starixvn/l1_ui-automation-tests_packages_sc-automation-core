import { test, BaseGame } from "../../components";
import { expect } from "../../expects";

export class BetHistory {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests() {
        test(`Verify user can open history and check the content`, async () => {
            // Act 1
            await test.step("Open history", async () => {
                await this.game.clickHistory(1000);
            });

            // Assert 1
            await test.step("Verify bet date, round id, total stake and bet win", async () => {
                await verifyticketdata(this.game);
            });

            // Act 2
            let roundID;
            await test.step("Open bet details and get round Id", async () => {
                await openRoundDetail(this.game);
                roundID = await getRoundId(this.game, "lblHistoryDetailRoundId");
            });

            // Assert 2
            await test.step("Verify round Id", async () => {
                expect(roundID.includes(global.settledata.roundID));
            });

            //Post-Act
            await test.step("Click outside to close bet detail and history", async () => {
                await this.game.clickOutSide(1500);
                await this.game.clickOutSide(1500);
            });
        });
    }

}
const verifyticketdata = async (game: BaseGame) => {
    const ticketdata = await getDataFistRowHistory(game);
    expect(ticketdata.betdate, "verify bet date").toEqual(global.settledata.betdate.replace(/[^0-9.]/g, ""));
    expect(ticketdata.roundID, "verify round id").toEqual(global.settledata.roundID);
    expect(ticketdata.totalstake, "verify total stake").toEqual(global.settledata.totalstake);
    expect(ticketdata.betwin, "verify bet win").toEqual(global.settledata.betwin);
};

const openRoundDetail = async (game: BaseGame) => {
    await game.clickLocator('locOpenBetDetails', 1000);
};

const getRoundId = async (game: BaseGame, elementname: string = "lblHistoryDetailRoundId") => {
    let roundId = await game.getTextLocator(elementname);
    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};

const getDataFistRowHistory = async (game: BaseGame) => {
    let betdate = await game.getTextLocator("locHistoryBetDate");
    let roundID = await game.getTextLocator("locHistoryRoundID");
    let totalstake = await game.getTextLocator("locHistoryTotalStake");
    let betwin = await game.getTextLocator("locHistoryBetWin");
    return {
        betdate: betdate!.toString().replace(/[^0-9.]/g, ""),
        roundID: roundID!.toString().replace(/[^0-9.]/g, ""),
        totalstake: totalstake!.toString().replace(/[^0-9.]/g, ""),
        betwin: betwin!.toString().replace(/[^0-9.]/g, "") !== "" ? parseFloat(betwin!.toString().replace(/[^0-9.]/g, "")).toString() : "0",
    };
};