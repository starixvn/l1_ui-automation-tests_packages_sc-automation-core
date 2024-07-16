import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { baseLocatorNames } from "../components/base-game-locator";
import { expect } from "../expects";
import  verifyImage from "../expects/verify-image";
import { IBaseOptions } from "./base-options";
import { GameGuides } from "../game-components/guides/guides.spec";

const projectCode = process.env.npm_config_project ?? "l1";

const timeout = 3000;

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
                    await verifyImage(this.game, uiItem, 0.02);
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
            let placeBetResponse, roundId, settledResults;
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            await test.step(`Place bet and get round ID on game client`, async () => {
                test.setTimeout(this.options.gameConfiguration.maxTimeout);
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
    
                // Act
                await this.game.waitUntilPlaceBet()
                placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
                roundId = await this.game.getTextLocator(baseLocatorNames.lblRoundIdOnTable, "#0123456789");
                settledResults = await this.game.waitForSettlement();
            });

            await test.step(`Verify settled ticket`, async () => {
                verifyImage(this.game, bet.choice + `Ownbet${process.env.npm_config_project}`)
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
                await this.game.waitUntilPlaceBet()
                placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
                settledResults = await this.game.waitForSettlement();
    
                await this.game.waitUntilPlaceBet();
            });
            if (this.options.isBalanceBettingGame){
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
            }

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

    protected provablyFairTests() {
        test("Verify PF icon, PF setting popup and introduce", async () => {
            //Act
            await test.step("Click on PF ico", async () => {
                await this.game.clickLocator(baseLocatorNames.icoPF, 3000);
            });   

            await test.step("Verify default UI of PF setting popup", async () => {
                await verifyImage(this.game, baseLocatorNames.popPFSettings);
                await verifyImage(this.game, baseLocatorNames.imgClientSeedRandomChecked);
                await verifyImage(this.game, baseLocatorNames.imgClientSeedManualModeDefault);
            });

            await test.step("Verify introduction popup", async () => {
                await this.game.clickLocator(baseLocatorNames.icoPFTooltip, timeout)
                await verifyImage(this.game, baseLocatorNames.imgGameGuidePF);
                await this.game.clickOutSide();
            });
        });

        test("Verify new client seed popup", async () => {
            await test.step("Verify client seed popup", async () => {
                await this.game.clickLocator(baseLocatorNames.checkboxManual, 5000);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed);
            });

            await test.step("Clear client seed", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeedClear);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeedCleared);
            });   

            await test.step("Input client seed 1234", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeed1);
                await this.game.clickLocator(baseLocatorNames.btnClientSeed2);
                await this.game.clickLocator(baseLocatorNames.btnClientSeed3);
                await this.game.clickLocator(baseLocatorNames.btnClientSeed4);
                await this.game.clickLocator(baseLocatorNames.btnClientSeed5);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed1234);
            });   

            await test.step("Backspace a number", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeedBackspace);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed123);
            });   

            await test.step("Save client seed", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeed4);
                await this.game.clickLocator(baseLocatorNames.btnClientSeedSave, 1000);
                await verifyImage(this.game, baseLocatorNames.imgManualClientSeed1234);
            });   

            await test.step("Open client seed again and verify the value", async () => {
                await this.game.clickLocator(baseLocatorNames.btnChangeClienSeed, 1000);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed1234);
                await this.game.clickOutSide();
                await verifyImage(this.game, baseLocatorNames.imgManualClientSeed1234);
                await this.game.clickOutSide();
            });
        });

        test("Verify PF setting popup in case place bet", async () => {
            //Act
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            await test.step("Wait for new round and place bet", async () => {
                await this.game.waitUntilPlaceBet()
                await this.player.betOn(bet.choice, bet.amount);
            });

            await test.step("Click on PF ico", async () => {
                await this.game.clickLocator(baseLocatorNames.icoPF);
            });   

            await test.step("Verify UI of PF setting popup in inactive mode", async () => {
                await verifyImage(this.game, baseLocatorNames.imgPFSettingInactive);
                await this.game.clickOutSide();
                //wait for settlement
                await this.game.waitForEvent(GameEvent.Settlement);
            });
        });

        test("Verify PF popup from history", async () => {
            //Act
            await test.step("Open history", async () => {
                await this.game.clickHistory();
            });

            await test.step("Click on verify icon", async () => {
                await this.game.clickLocator(baseLocatorNames.btnHistoryVerify, 3000);
            });   

            await test.step("Verify PF popup", async () => {
                await verifyImage(this.game, baseLocatorNames.imgPFPopupHeader);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupRoundId);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupServerSeed);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupClientSeed);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupMergeClientSeed);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupPlayer123);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupPlayer45);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupCombinedHash);
                await verifyImage(this.game, baseLocatorNames.imgPFPopupMessage);
                await verifyImage(this.game, baseLocatorNames.btnPFPopupVerify);
                await this.game.clickLocator(baseLocatorNames.btnClientSeedTooltip);
                await verifyImage(this.game, baseLocatorNames.imgClientSeedTooltip); 
                await this.game.clickLocator(baseLocatorNames.btnCombinedHashTooltip);
                await verifyImage(this.game, baseLocatorNames.imgCombinedHashTooltip);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
            });
        });

        test("Verify verification popup", async () => {
            //Act
            await test.step("Open verification popup", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPFPopupVerify, 3000)
            }); 

            await test.step("Verify verification popup", async () => {
                await verifyImage(this.game, baseLocatorNames.imgVerificationServerSeed);
                await verifyImage(this.game, baseLocatorNames.imgVerificationMergeClientSeed);
                await verifyImage(this.game, baseLocatorNames.imgVerificationCombinedHash);
                await verifyImage(this.game, baseLocatorNames.imgVerificationFinalResult);
                await this.game.clickOutSide(1000);
                await this.game.clickOutSide();        
                await this.game.clickOutSide();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
            });
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
        this.provablyFairTests();
        this.hedgeBetTests();
        this.maxBetTests();
        this.presetStakeTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }


    async openPFPopup (){
        await this.game.clickLocator(baseLocatorNames.icoPF, 1000)
    };
    

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


