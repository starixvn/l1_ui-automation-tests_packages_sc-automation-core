import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { baseLocatorNames } from "../components/base-game-locator";
import { expect } from "../expects";
import  verifyImage from "../expects/verify-image";
import { IBaseOptions } from "./base-options";
import { GameGuides } from "../game-components/guides/guides.spec";

const projectCode = process.env.npm_config_project ?? "l1";

export class MiniGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}
    

    protected inGameUITests() {
        test("Verify all bet choices are displayed on table", async () => {
            // Arrange
            await test.step(`Wait for new round start`, async () => {
                test.setTimeout(this.options.gameConfiguration.maxTimeout);
                await this.game.waitUntilPlaceBet();
            });
            await test.step(`Verify image of all bet choices`, async () => {
                for (const placeBetChoice of this.options.placeBetChoices) {
                    // Act
                    await verifyImage(this.game, `${placeBetChoice}Choice`);
                }
            });
        });

        test("Verify main UI of the game", async () => {
            await test.step(`Verify image of UI items checklist`, async () => {
                const uiChecklist = this.options.uiChecklist ?? [];
                for (const uiItem of uiChecklist) {
                    // Act
                    await verifyImage(this.game, uiItem);
                }
            });
        });

    }

    protected inGameOddsTests() {
        test("Verify that odds are correct", async () => {
            // Assert
            expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
        });
    }

    protected chipBoardTests() {
        test("Verify that chip board works correctly", async () => {
            // Assert
            await test.step(`Open chip board and verify default UI of chip board`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBetChoice)
                await verifyImage(this.game, `imgChipBoardDefault${projectCode}`)
            });

            await test.step(`Click on first chip and verify bet amount and confirm button`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnFirstChip)
                await verifyImage(this.game, `imgBetAmountFirstChip${projectCode}`)
                await verifyImage(this.game, baseLocatorNames.btnConfirmEnable)
            });

            await test.step(`Click clear and verify bet amount is cleared and confirm button is disable`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnChipBoardClear)
                await verifyImage(this.game, baseLocatorNames.imgBetAmountCleared)
                await verifyImage(this.game, baseLocatorNames.btnConfirmDisable)
            });

            await test.step(`Close chip board`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnChipBoardClose)
            });
        });
    }

    protected presetStakeTests() {
        test("Verify that preset stake works correctly", async () => {
            test.skip(this.game.gameConfiguration.betBoard =! true, "This game do not have preset stake function")
            // Assert
            await test.step(`Open preset stake popup and verify default UI`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnPresetStake)
                await verifyImage(this.game, `imgPresetStakeDefault${projectCode}`, 0.02)
            });

            await test.step(`Click on first value and verify number show correctly`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnPresetStakeFirstValue)
                await verifyImage(this.game, `imgPresetStakeFirstValue${projectCode}`)
            });

            await test.step(`Click clear and verify number is cleared`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnPresetStakeClear)
                await verifyImage(this.game, `imgPresetStakeDefault${projectCode}`)
            });

            await test.step(`Apply preset stake and verify it works correctly`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnPresetStakeFirstValue)
                await this.game.clickLocator(baseLocatorNames.btnPresetStakeComfirm)
                await this.game.waitUntilPlaceBet();
                await this.game.clickLocator(baseLocatorNames.btnPlaceBetChoice)
                await verifyImage(this.game, `imgBetAmountFirstChip${projectCode}`)
            });
        });
    }

    protected placeBetAndSettleTests() {
        test("Verify round id displayed on table is the same with round id in settle result", async () => {
            // Arrange
            let placeBetResponse, betChoice, roundId, settledResults;
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            await test.step(`Place bet and get round ID on game client`, async () => {
                test.setTimeout(this.options.gameConfiguration.maxTimeout);
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
    
                // Act
                placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
                betChoice = await this.game.capture(bet.choice + `Ownbet${process.env.npm_config_project}`);
                roundId = await this.game.getTextLocator(baseLocatorNames.lblRoundIdOnTable, "#0123456789");
                settledResults = await this.game.waitForSettlement();
            });

            await test.step(`Verify settled ticket`, async () => {
                expect(betChoice.image).toMatchSnapshot(betChoice.name);
                expect(placeBetResponse.endBet).toBe(bet.amount);
                expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
                console.log(settledResults.roundId, roundId);
                expect(roundId.includes(settledResults.roundId)).toBe(true);
            });

        });

        test("Verify that player able to place bet and return settlement data for comparing history ticket detail", async () => {
            // Arrange
            let placeBetResponse, settledResults;
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 , refund: 0 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            await test.step(`Place bet and wait for settlement`, async () => {
                placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
                settledResults = await this.game.waitForSettlement();
    
                await this.game.waitUntilPlaceBet();
            });

            await test.step(`Get refund data`, async () => {
                let historyPayload = await this.player.openHistory();
                let retryCount = 0;
                while (Object.keys(historyPayload).length === 0 && retryCount < 2) {
                    historyPayload = await this.player.openHistory();
                    retryCount++;
                }
    
                const ticketHistory = historyPayload.history.betLogs.shift() || 0;
                bet.refund = ticketHistory.refund;
    
                await this.game.clickOutSide();
            });

            await test.step(`Verify settlement result`, async () => {
                // Assert
                expect(placeBetResponse.endBet).toBe(bet.amount);
                expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
                expect(bet).toMatchWinningAndRefund(settledResults);
            });

            // Post-Act
            const settledata = {
                betdate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" }),
                settledResults: settledResults.settlementResult,
                roundId: settledResults.roundId.toString(),
                betwin: (settledResults.winAmount - bet.refund).toString(),
                bet: bet.amount.toString(),
                choice: bet.choice,
            };
            global.settledata = settledata;
        });

    }

    protected ticketHistoryTests() {
        test("Verify data of history of above round", async () => {
            // Act 1
            let ticketdata
            await test.step(`Open history and get data of the last round`, async () => {
                await this.game.clickHistory(2000);
                ticketdata = await getDataFistRowHistory(this.game);
            });
            // Assert

            await test.step(`Verify that data are correct then close history popup`, async () => {
                expect(ticketdata.betdate, "verify bet date").toEqual(global.settledata.betdate.replace(/[^0-9.]/g, ""));
                expect(ticketdata.roundId, "verify round id").toEqual(global.settledata.roundId);
                expect(ticketdata.totalstake, "verify total stake").toEqual(global.settledata.bet);
    
                //Post-Act
                await this.game.clickOutSide();
                await this.game.clickOutSide();
            });
        });
    }

    protected hedgeBetTests() {
        test("Verify error message in case player place on hedge bets", async () => {
            // Arrange
            const { maxTimeout, hedgeBetGroups } = this.options.gameConfiguration;
            test.setTimeout(maxTimeout);
            let error
            // Act
            const endBetMsg = await this.player.placeHedgeBet(hedgeBetGroups[0], this.options.placeBetAmount ?? 1);

            // Assert
            expect(endBetMsg).toMatchObject({ endBet: -1, betChoice: hedgeBetGroups[0][1]});
        });
    }

    protected maxBetTests() {
        test("Verify error message in case player reach max bet", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: [this.options.placeBetAmount ?? 1, 1000] };

            // Act
            const endBetMsg =  await this.player.placeMaxBet(bet.choice, bet.amount);

            // Assert
            expect(endBetMsg).toMatchObject({ endBet: -1, betChoice: bet.choice});
        });
    }

    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.options.snapshotFolderPath + "-snapshots/" + name;

                return snapshotPath;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: this.options.locators,
        });

        test.describe.serial(`${this.options.gameConfiguration.name} E2E Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.gameGuides.init(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameUITests();
        this.inGameOddsTests();
        this.chipBoardTests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests()
        this.hedgeBetTests();
        this.maxBetTests();
        this.presetStakeTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }

}



const getDataFistRowHistory = async (game: BaseGame) => {
    let betdate = await game.getTextLocator(baseLocatorNames.locHistoryBetDate);
    let roundId = await game.getTextLocator(baseLocatorNames.locHistoryRoundId);
    let totalstake = await game.getTextLocator(baseLocatorNames.locHistoryTotalStake);
    let betwin = await game.getTextLocator(baseLocatorNames.locHistoryBetWin);
    return {
        betdate: betdate!.toString().replace(/[^0-9.]/g, ""),
        roundId: roundId!.toString().replace(/[^0-9.]/g, ""),
        totalstake: totalstake!.toString().replace(/[^0-9.]/g, ""),
        betwin: betwin!.toString().replace(/[^0-9.]/g, "") !== "" ? parseFloat(betwin!.toString().replace(/[^0-9.]/g, "")).toString() : "0",
    };
};
