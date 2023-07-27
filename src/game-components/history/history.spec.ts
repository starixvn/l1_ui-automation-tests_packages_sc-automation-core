import { test, BaseGame } from "../../components";
import { expect } from "../../expects";

export class BetHistory {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests(settleddata: Expectdata) {
        test(`Verify user can open history and check the content`, async () => {
            // Act 1
            await test.step("Open history", async () => {
                await this.game.clickHistory(1000);
            });

            // Assert 1
            await test.step("Verify content", async () => {
                await verifyticketdata(this.game, settleddata);
            });

            // Act 2
            let roundID;
            await test.step("Open bet details and get round Id", async () => {
                await openRoundDetail(this.game);
                roundID = await getRoundId(this.game, "lblHistoryDetailRoundId");
            });

            // Assert 2
            await test.step("Verify round Id", async () => {
                expect(roundID).toEqual(global.settledata.roundID);
            });

            //Post-Act
            await test.step("Click outside to close bet detail and history", async () => {
                await this.game.clickOutSide(1500);
                await this.game.clickOutSide(1500);
            });
        });
    }

}
const verifyticketdata = async (game: BaseGame, expectdata: Expectdata) => {
    const ticketdata = await getDataFistRowHistory(game);
    expect(ticketdata.betdate, "verify bet date").toEqual(expectdata.betdate);
    expect(ticketdata.roundID, "verify bet win").toEqual(expectdata.roundID);
    expect(ticketdata.totalstake, "verify bet win").toEqual(expectdata.totalstake);
    expect(ticketdata.betwin, "verify bet win").toEqual(expectdata.betwin);
};

const openRoundDetail = async (game: BaseGame) => {
    await game.clickLocator('locHistoryRoundId', 1000);
};

const getRoundId = async (game: BaseGame, elementname: string = "lblHistoryDetailRoundId") => {
    let roundId = await game.getTextLocator(elementname);

    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};

const getDataFistRowHistory = async (game: BaseGame) => {
    let betdate = await game.getTextLocator("locHistoryBetDate");
    let roundID = await game.getTextLocator("locHistoryRoundId");
    let totalstake = await game.getTextLocator("locHistoryTotalStake");
    let betwin = await game.getTextLocator("locHistoryBetWin");
    return {
        betdate: betdate!.toString(),
        roundID: roundID!.toString(),
        totalstake: totalstake!.toString(),
        betwin: betwin!.toString().replace(/[^0-9.]/g, "") !== "" ? parseFloat(betwin!.toString().replace(/[^0-9.]/g, "")).toString() : "0",
    };
};
export interface Expectdata {
    betdate: string;
    roundID: string;
    totalstake: string;
    betwin: string;
}