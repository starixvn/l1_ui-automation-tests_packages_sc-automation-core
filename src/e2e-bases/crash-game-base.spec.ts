import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { baseLocatorNames } from "../components/base-game-locator";
import { GameGuides } from "../game-components/guides/guides.spec";
import { BetHistory } from "../game-components/history/history.spec";

const timeout = 4000;

const enum CrashGameEvent {
    StartCashOut = `"m":1,"`,
    StartFly = `"t":0`,
    CashOut = `"Spaceflight",{"name"`,
}

export class CrashGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();
    protected betHistory: BetHistory = new BetHistory();

    constructor(protected options: IBaseOptions) {}

    protected inGameTests() {
        test("Verify received websocket Odds of game should be the same with game's config ", async () => {
            // Assert
            await test.step(`Verify ODDs should be correct`, async () => {
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected mainUITests() {
        test("Verify default control area", async () => {
            //Act
            let imgControlArea;
            await test.step("Capture default control area", async () => {
                imgControlArea = await this.game.capture(baseLocatorNames.imgControlArea);
            });

            await test.step("Compare with snapshot", async () => {
                //Assert
                expect(imgControlArea.image).toMatchSnapshot(imgControlArea.name, { maxDiffPixelRatio: 0 });
            });
        });

        test("Verify UI of the rocket", async () => {
            //Act
            let imgRocket;
            await test.step("Wait for start new round", async () => {
                await this.game.waitUntilPlaceBet();
                await this.game.waitForTimeout(2000);
            });

            await test.step("Get rocket image", async () => {
                imgRocket = await this.game.capture(baseLocatorNames.imgRocket);
            });

            await test.step("Compare with snapshot", async () => {
                //Assert
                expect(imgRocket.image).toMatchSnapshot(imgRocket.name, { maxDiffPixelRatio: 0.3 });
            });
        });

        test("Verify roundID in showed on game client", async () => {
            //Act
            let roundId;
            await test.step("Get round id", async () => {
                roundId = await this.game.getTextLocator(baseLocatorNames.lblRoundIdOnTable, "0123456789");
            });
            await test.step("Verify that round id is not null", async () => {
                expect(roundId).toHaveValue;
            });
        });

        test("Verify menu expand with sound and music on", async () => {
            //Act
            await test.step("Click hamburger menu", async () => {
                await this.game.clickLocator(baseLocatorNames.mnuHamburger);
            });
            await test.step("Capture expand hamburger menu and compare with the snapshot", async () => {
                const mnuHamburgerExpandSoundOn = await this.game.capture(baseLocatorNames.mnuHamburgerExpandSoundOn);
                //Assert
                expect(mnuHamburgerExpandSoundOn.image).toMatchSnapshot(mnuHamburgerExpandSoundOn.name, { maxDiffPixelRatio: 0 });
            });
            //Post-Act
            await test.step("Click out side to close the menu", async () => {
                await this.game.clickOutSide(2000);
            });
        });

        test("Verify menu expand with sound and music off", async () => {
            //Act
            await test.step("Click on hamburger menu", async () => {
                await this.game.clickLocator(baseLocatorNames.mnuHamburger, 1000);
            });
            await test.step("Click on sound icon", async () => {
                await this.game.clickLocator(baseLocatorNames.icoSound);
            });
            await test.step("Click on music icon", async () => {
                await this.game.clickLocator(baseLocatorNames.icoMusic);
            });
            await test.step("Capture expand hamburger menu and compare with snapshot", async () => {
                const mnuHamburgerExpandSoundOff = await this.game.capture(baseLocatorNames.mnuHamburgerExpandSoundOff);
                //Assert
                expect(mnuHamburgerExpandSoundOff.image).toMatchSnapshot(mnuHamburgerExpandSoundOff.name, { maxDiffPixelRatio: 0 });
            });
            //Post-Act
            await test.step("Click outside to close the menu", async () => {
                await this.game.clickOutSide();
            });
        });
    }

    protected betAmountTests() {
        test("Verify default state of bet amount popup", async () => {
            //Act
            await test.step("Open bet amount popup", async () => {
                await openBetAmoutPopup(this.game);
            });
            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetAmount = await this.game.capture(`popBetAmount${process.env.npm_config_project}`);
                expect(popBetAmount.image).toMatchSnapshot(popBetAmount.name, { maxDiffPixelRatio: 0 });
            });
        });

        test("Verify max value of bet amount", async () => {
            //Act
            await test.step("Click on max chip 4 times", async () => {
                for (let i = 0; i < 4; i++) {
                    await this.game.clickLocator(baseLocatorNames.btnMaxChip);
                }
            });
            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetAmountMaxChip = await this.game.capture(`popBetAmountMaxChip${process.env.npm_config_project}`);
                expect(popBetAmountMaxChip.image).toMatchSnapshot(popBetAmountMaxChip.name, { maxDiffPixelRatio: 0 });
            });
        });

        test("Verify player be able to clear bet amount", async () => {
            //Act
            await test.step("Click on clear button", async () => {
                this.game.clickLocator(baseLocatorNames.btnClearBetAmount);
            });
            //Assert
            await test.step("Verify the bet amount is clear and confirm button is disable", async () => {
                const popBetAmount = await this.game.capture(`popBetAmount${process.env.npm_config_project}`);
                expect(popBetAmount.image).toMatchSnapshot(popBetAmount.name, { maxDiffPixelRatio: 0 });
            });
        });

        test("Verify player can apply bet amount", async () => {
            //Act
            await test.step("Click on first chip", async () => {
                await this.game.clickLocator(baseLocatorNames.btnFirstChip);
            });
            await test.step("Click confirm button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnConfirm);
            });
            //Assert
            await test.step("Verify that bet amount show correctly", async () => {
                const imgBetAmount = await this.game.capture(`imgBetAmountFirstChip${process.env.npm_config_project}`);
                expect(imgBetAmount.image).toMatchSnapshot(imgBetAmount.name, { maxDiffPixelRatio: 0 });
            });
        });

        test("Verify that player be able to increase bet amount", async () => {
            //Act
            await test.step("Click on increase button 2 times", async () => {
                for (let i = 0; i < 2; i++) {
                    await this.game.clickLocator(baseLocatorNames.btnIncreaseBetAmount);
                }
            });

            //Assert
            await test.step("Verify bet amount", async () => {
                const imgBetAmount = await this.game.capture(`imgBetAmountIncrease${process.env.npm_config_project}`);
                expect(imgBetAmount.image).toMatchSnapshot(imgBetAmount.name, { maxDiffPixelRatio: 0 });
            });
        });

        test("Verify that player be able to decrease bet amount", async () => {
            //Act
            await test.step("Click on decrease button 2 times", async () => {
                for (let i = 0; i < 2; i++) {
                    await this.game.clickLocator(baseLocatorNames.btnDecreaseBetAmount);
                }
            });

            //Assert
            await test.step("Verify bet amount", async () => {
                const imgBetAmount = await this.game.capture(`imgBetAmountFirstChip${process.env.npm_config_project}`);
                expect(imgBetAmount.image).toMatchSnapshot(imgBetAmount.name, { maxDiffPixelRatio: 0 });
            });
        });
    }

    protected autoPlayTests(totalAutoPlay:number = 10) {
        test("Verify default state of auto-play button", async () => {
            await test.step("Capture default auto-play button and compare with snapshot", async () => {
                const btnAutoPlay = await this.game.captureLocator(baseLocatorNames.btnAutoPlay);

                // Assert
                expect(btnAutoPlay.image).toMatchSnapshot(btnAutoPlay.name);
            });
        });

        test("Verify default state of auto-play popup", async () => {
            // Act
            await test.step("Open auto play popup", async () => {
                await openAutoPlayBoard(this.game);
            });

            await test.step("Capture default auto-play popup and compare with snapshot", async () => {
                const popAutoPlay = await this.game.captureLocator(baseLocatorNames.popAutoPlay);
                // Assert
                expect(popAutoPlay.image).toMatchSnapshot(popAutoPlay.name);
            });

            await test.step("Click outside to close the popup", async () => {
                await this.game.clickOutSide(1000);
            });
        });

        test("Verify place early bet when start auto-play", async () => {
            await test.step("Wait for rocket start fly", async () => {
                await this.game.waitForEvent(CrashGameEvent.StartCashOut);
            });
            await test.step("Start auto-play", async () => {
                await selectAutoPlay(this.game, totalAutoPlay);
            });
            await test.step("Verify button place bet accepted", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnEarlyBetAccepted);
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });

            await test.step("Verify number of auto-play is 9", async () => {
                const btnAutoPlay = await this.game.captureLocator(baseLocatorNames.btnAutoPlay9Remaining);
                expect(btnAutoPlay.image).toMatchSnapshot(btnAutoPlay.name);
            });
        });

        test("Verify user be able to stop auto-play by cancel early bet", async () => {
            await test.step("Click on place bet button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet);
            });
            await test.step("Verify auto play button", async () => {
                const btnAutoPlay = await this.game.captureLocator(baseLocatorNames.btnAutoPlay);
                expect(btnAutoPlay.image).toMatchSnapshot(btnAutoPlay.name);
            });
            await test.step("Verify button place bet ", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceEarlyBet);
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
        });

        test("Verify number of auto play when user place bet then start auto-play", async () => {
            await test.step("Place bet", async () => {
                await placeBet(this.game);
            });
            await test.step("Start auto-play", async () => {
                await selectAutoPlay(this.game, totalAutoPlay);
            });
            await test.step("Verify number of auto-play is 10", async () => {
                const btnAutoPlay = await this.game.captureLocator(baseLocatorNames.btnAutoPlay10Remaining);
                expect(btnAutoPlay.image).toMatchSnapshot(btnAutoPlay.name);
            });
            await test.step("Stop auto play ", async () => {
                this.game.clickLocator(baseLocatorNames.btnAutoPlay);
            });
        });

        test("Verify player can start 10 auto play", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout * 2);

            let settledResultsAutoPlay: Array<string> = [];

            await test.step("Wait until place bet", async () => {
                await this.game.waitUntilPlaceBet();
            });

            await test.step("Enable auto cash out", async () => {
                await enableAutoCashOut(this.game);
            });

            await test.step("Start 10 auto play", async () => {
                await selectAutoPlay(this.game, totalAutoPlay);
            });

            await test.step("Verify button place bet show bet accepted", async () => {
                await this.game.waitForTimeout(1000);
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceBetBetAccepted);
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });

            await test.step("Verify number of auto-play is 9", async () => {
                const btnAutoPlay = await this.game.captureLocator(baseLocatorNames.btnAutoPlay9Remaining);
                expect(btnAutoPlay.image).toMatchSnapshot(btnAutoPlay.name);
            });
            for (let index = 1; index <= totalAutoPlay; index++) {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
                const settledResults = await waitForSettlement(this.game);
                settledResultsAutoPlay.push(settledResults.roundId);
            }

            await test.step(`Verify number of spins`, async () => {
                expect(settledResultsAutoPlay.length >= 10).toBe(true);
            });

            await test.step(`Close popup`, async () => {
                this.game.waitForTimeout(timeout);
                this.game.clickOutSide();
            });

            await test.step(`Disable auto cashout`, async () => {
                await enableAutoCashOut(this.game);
            });
        });

        test("Verify that player can stop auto play by click on auto-play button", async () => {
            // Act
            await test.step("Wait until place bet", async () => {
                await this.game.waitUntilPlaceBet();
            });

            await test.step("Start 10 auto play", async () => {
                await selectAutoPlay(this.game, totalAutoPlay);
            });

            await test.step("Wait for 1 round crash", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
                await waitForSettlement(this.game);
            });

            await test.step("Click auto play button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnAutoPlay);
            });

            await test.step("Verify UI of auto play button", async () => {
                const btnAutoPlay = await this.game.captureLocator(baseLocatorNames.btnAutoPlay);
                // Assert
                expect(btnAutoPlay.image).toMatchSnapshot(btnAutoPlay.name);
            });
        });
    }

    protected autoCashoutTests() {
        test("Verify default state of auto cashout popup", async () => {
            await test.step("Open auto cashout popup", async () => {
                await openAutoCashoutPopup(this.game);
            });
            await test.step("Capture default auto cashout button and compare with snapshot", async () => {
                const popAutoCashout = await this.game.captureLocator(baseLocatorNames.popAutoCashout);
                // Assert
                expect(popAutoCashout.image).toMatchSnapshot(popAutoCashout.name, { maxDiffPixelRatio: 0 });
            });
        });

        test("Verify max length of Multiplier in auto cashout popup", async () => {
            await test.step("Click 6 times number 1", async () => {
                for (let index = 1; index <= 6; index++) {
                    this.game.clickLocator(baseLocatorNames.btnNumber1AutoCashout);
                }
            });
            await test.step("Click dot", async () => {
                for (let index = 1; index <= 2; index++) {
                    this.game.clickLocator(baseLocatorNames.btnDotAutoCashout);
                }
            });
            await test.step("Click 3 times number 2", async () => {
                for (let index = 1; index <= 3; index++) {
                    this.game.clickLocator(baseLocatorNames.btnNumber2AutoCashout);
                }
            });
            await test.step("Verify multiplier number", async () => {
                const multiplierMaxLength = await this.game.capture(baseLocatorNames.lblAutoCashoutMultiplierMaxLength);
                expect(multiplierMaxLength.image).toMatchSnapshot(multiplierMaxLength.name, { maxDiffPixelRatio: 0 });
            });
            await test.step("Click confirm", async () => {
                await this.game.clickLocator(baseLocatorNames.btnConfirmAutoCashout);
            });
            await test.step("Verify multiplier number is applied", async () => {
                const multiplierMaxLengthApplied = await this.game.capture(baseLocatorNames.lblAutoCashoutMultiplierMaxLengthApplied);
                expect(multiplierMaxLengthApplied.image).toMatchSnapshot(multiplierMaxLengthApplied.name, { maxDiffPixelRatio: 0 });
            });
        });
        test("Verify multiplier is red when input invalid number in auto cashout popup", async () => {
            await test.step("Open auto cashout popup", async () => {
                await openAutoCashoutPopup(this.game);
            });
            await test.step("Input 2001", async () => {
                await this.game.clickLocator(baseLocatorNames.btnNumber2AutoCashout);
                await this.game.clickLocator(baseLocatorNames.btnNumber0AutoCashout);
                await this.game.clickLocator(baseLocatorNames.btnNumber0AutoCashout);
                await this.game.clickLocator(baseLocatorNames.btnNumber1AutoCashout);
            });
            await test.step("Verify the number is in red", async () => {
                const lblMultiplier = await this.game.captureLocator(baseLocatorNames.lblMultiplier2001);
                // Assert
                expect(lblMultiplier.image).toMatchSnapshot(lblMultiplier.name, { maxDiffPixelRatio: 0 });
            });
            await test.step("Verify confirm button is disabled", async () => {
                const btnConfirm = await this.game.captureLocator(baseLocatorNames.btnConfirmAutoCashoutDisabled);
                // Assert
                expect(btnConfirm.image).toMatchSnapshot(btnConfirm.name, { maxDiffPixelRatio: 0 });
            });
        });
        test("Verify backspace a number in auto cashout popup", async () => {
            await test.step("Click backspace button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnBackspace);
            });
            await test.step("Verify the number is deleted", async () => {
                const lblMultiplier = await this.game.captureLocator(baseLocatorNames.lblMultiplier200);
                // Assert
                expect(lblMultiplier.image).toMatchSnapshot(lblMultiplier.name, { maxDiffPixelRatio: 0 });
            });
        });
        test("Verify clear multiplier in auto cashout popup", async () => {
            await test.step("Click clear button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClearAutoCashout);
            });
            await test.step("Verify the number is cleared", async () => {
                const lblMultiplier = await this.game.captureLocator(baseLocatorNames.lblMultiplierCleared);
                // Assert
                expect(lblMultiplier.image).toMatchSnapshot(lblMultiplier.name, { maxDiffPixelRatio: 0 });
            });
            await test.step("Set auto cash out to 1.01", async () => {
                await this.game.clickLocator(baseLocatorNames.btnNumber1AutoCashout);
                await this.game.clickLocator(baseLocatorNames.btnDotAutoCashout);
                await this.game.clickLocator(baseLocatorNames.btnNumber0AutoCashout);
                await this.game.clickLocator(baseLocatorNames.btnNumber1AutoCashout, 1000);
                await this.game.clickLocator(baseLocatorNames.btnConfirmAutoCashout);
            });
        });
        test("Verify player can enable auto cash out", async () => {
            await test.step("Click enable auto cash out", async () => {
                await this.game.clickLocator(baseLocatorNames.btnEnableAutoCashOut);
            });
            await test.step("Verify the auto cashout icon is enable", async () => {
                const lblAutoCashout = await this.game.captureLocator(baseLocatorNames.lblAutoCashoutEnable);
                // Assert
                expect(lblAutoCashout.image).toMatchSnapshot(lblAutoCashout.name, { maxDiffPixelRatio: 0 });
            });
        });
        test("Verify player can disable auto cash out", async () => {
            await test.step("Click disable auto cash out", async () => {
                await this.game.clickLocator(baseLocatorNames.btnEnableAutoCashOut);
            });
            await test.step("Verify the auto cashout icon is disable", async () => {
                const lblAutoCashout = await this.game.captureLocator(baseLocatorNames.lblAutoCashoutDisable);
                // Assert
                expect(lblAutoCashout.image).toMatchSnapshot(lblAutoCashout.name, { maxDiffPixelRatio: 0 });
            });
        });
        test("Verify that player be able to increase auto cashout", async () => {
            //Act
            await test.step("Click on increase button 2 times", async () => {
                for (let i = 0; i < 2; i++) {
                    await this.game.clickLocator(baseLocatorNames.btnIncreaseAutoCashout);
                }
            });

            //Assert
            await test.step("Verify number of auto cashout", async () => {
                const imgAutoCashout = await this.game.capture(baseLocatorNames.imgAutoCashoutIncrease);
                expect(imgAutoCashout.image).toMatchSnapshot(imgAutoCashout.name, { maxDiffPixelRatio: 0 });
            });
        });
        test("Verify that player be able to decrease auto cashout", async () => {
            //Act
            await test.step("Click on decrease button 2 times", async () => {
                for (let i = 0; i < 2; i++) {
                    await this.game.clickLocator(baseLocatorNames.btnDecreaseAutoCashout);
                }
            });

            //Assert
            await test.step("Verify number of auto cashout", async () => {
                const imgAutoCashout = await this.game.capture(baseLocatorNames.imgAutoCashoutDecrease);
                expect(imgAutoCashout.image).toMatchSnapshot(imgAutoCashout.name, { maxDiffPixelRatio: 0 });
            });
        });
    }

    protected placeBetAndCashoutTests() {
        const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
        test("Verify place bet button", async () => {
            await test.step("Wait for start place bet", async () => {
                await this.game.waitUntilPlaceBet();
            });
            await test.step("Capture place bet button and compare with snapshot", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceBet);
                // Assert
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
        });

        test("Verify player be able to cancel early bet", async () => {
            await test.step("Wait for start cash out", async () => {
                await this.game.waitForEvent(CrashGameEvent.StartCashOut);
                await this.game.waitForTimeout(300);
            });
            await test.step("Capture early bet button and compare with snapshot", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceEarlyBet);
                // Assert
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
            await test.step("Click place early bet then clicks again to cancel bet", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet,1000);
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet);
            });
            await test.step("Capture early bet button and compare with snapshot", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceEarlyBet);
                // Assert
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
            
        });

        test("Verify player be able to place early bet and cash out 50%", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await test.step("Click early bet", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet);
            });
            await test.step("Verify button bet waitting", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnEarlyBetAccepted);
                // Assert
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
            await test.step("Verify bet amount when new round started", async () => {
                const placeBetResponse = await this.game.waitForEndBet();
                expect(placeBetResponse.endBet).toBe(this.options.placeBetAmount);
            });
            await test.step("Verify button place bet accepted", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceBetBetAccepted);
                // Assert
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
            await test.step("Click cashout 50% and verify win amount", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
                this.game.attachSocketAndCaptureEvent(CrashGameEvent.CashOut);
                await this.game.waitForEvent(CrashGameEvent.StartFly); //Wait for start fly
                let settledResults = await this.game.latestCaptureEvent(GameEvent.Settlement);
                if (settledResults === "") {
                    //Have not crash yet
                    await this.game.waitForEvent(CrashGameEvent.StartCashOut); //wait for start cash out
                    await cashOutHalf(this.game); //click cash out 50%
                    let cashOutResult = await this.game.latestCaptureEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.halfCashOut.cashOutWin);
                } else {
                    // If crash at base, place bet again
                    await placeBet(this.game);
                    await this.game.waitForEvent(CrashGameEvent.StartCashOut); //wait for start cash out
                    await cashOutHalf(this.game); //click cash out 50%
                    let cashOutResult = await this.game.latestCaptureEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.halfCashOut.cashOutWin);
                }
            });
        });

        test("Verify player be able to place bet and cash out", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout * 2);
            await test.step("Wait for new round and click place bet", async () => {
                await placeBet(this.game);
            });
            await test.step("Verify place bet button", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceBetBetAccepted);
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
            let settledResults;
            await test.step("Click cashout and verify win amount", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
                this.game.attachSocketAndCaptureEvent(CrashGameEvent.CashOut);
                await this.game.waitForEvent(CrashGameEvent.StartFly); //Wait for start fly
                settledResults = await this.game.latestCaptureEvent(GameEvent.Settlement);
                if (settledResults === "") {
                    //Have not crash yet
                    await this.game.waitForEvent(CrashGameEvent.StartCashOut); //wait for start cash out
                    await cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.latestCaptureEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.cashOut.cashOutWin);
                } else {
                    // If crash at base, place bet again
                    await placeBet(this.game);
                    await this.game.waitForEvent(CrashGameEvent.StartCashOut); //wait for start cash out
                    await cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.latestCaptureEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.cashOut.cashOutWin);
                }
            });
            const settledata = {
                settledResults: settledResults.settlementResult,
                roundId: settledResults.roundId.toString(),
                betwin: settledResults.winAmount.toString() || "0",
                bet: bet.amount.toString(),
            };
            global.settledata = settledata;
        });
    }

    protected md5PopupTests() {
        test("Verify opening md5 popup when clicking on statistic icon last round", async () => {
            //Act
            await test.step("Click on statistic icon last round", async () => {
                await this.game.clickLocator(baseLocatorNames.btnStatisticLastRound);
            });
            //Assert
            await test.step("Verify the popup is opened", async () => {
                const popMD5 = await this.game.capture(baseLocatorNames.popMD5);
                expect(popMD5.image).toMatchSnapshot(popMD5.name, { maxDiffPixelRatio: 0.3 });
            });
            await test.step("Close the popup", async () => {
                await this.game.clickOutSide();
            });
        });

        test("Verify MD5 popup of running round", async () => {
            //Act
            await test.step("Wait for start new round", async () => {
                await this.game.waitUntilPlaceBet();
            });
            await test.step("Click on statistic icon running round", async () => {
                await this.game.clickLocator(baseLocatorNames.btnStatisticRunningRound);
            });
            //Assert
            await test.step("Verify field result is cleared", async () => {
                const lblResultCleared = await this.game.capture(baseLocatorNames.lblResultCleared);
                expect(lblResultCleared.image).toMatchSnapshot(lblResultCleared.name, { maxDiffPixelRatio: 0 });
            });
            await test.step("Close the popup", async () => {
                await this.game.clickOutSide();
            });
        });
    }

    protected ticketHistoryTests() {
        test("Verify data of history of above round", async () => {
            // Act 1
            await this.game.clickHistory(timeout);
            const ticketdata = await getDataFistRowHistory(this.game);

            const indexHistory: any = this.options.indexTicketHistory;

            const winamount = ticketdata[ticketdata?.length - 1];
            const totalbet = ticketdata[ticketdata?.length + indexHistory.totalbet];
            const dateIndex = ticketdata.findIndex((value) => {
                return value.includes("/");
            });
            const roundId = ticketdata[dateIndex + 1];

            // Assert
            expect(parseFloat(winamount)).toBeCloseTo(parseFloat(global.settledata.betwin), -1);
            expect(totalbet).toEqual(global.settledata.bet);
            expect(parseInt(roundId)).toBeCloseTo(parseInt(global.settledata.roundId), -1);

            // Act 2
            if (indexHistory.isIdLink) {
                await this.game.clickLocator(baseLocatorNames.locHistoryRoundId, 1500);
                const roundID = await this.game.getTextLocator(baseLocatorNames.lblHistoryDetailRoundId, "0123456789");
                // Assert 2
                expect(parseInt(roundID)).toEqual(parseInt(global.settledata.roundId));
            }

            //Post-Act
            await this.game.clickOutSide();
            await this.game.clickOutSide();
        });
    }
    protected returnGameLobby(): void {
        test("Verify player redirect to gamelooby after clicking home icon", async () => {
            // Act 1
            await this.game.waitForTimeout(2000);
            await this.game.clickHome(timeout / 2, baseLocatorNames.btnHome);
            await this.game.waitUntilGameLobbyUiLoad();
            const gamelobby = await this.game.capture(baseLocatorNames.imgGameLobby);
            expect(gamelobby.image).toMatchSnapshot(gamelobby.name);
        });
    }

    protected turnbackGame(): void {
        test("Verify player able to go back game by clicking on game icon", async () => {
            // Act 1.
            await this.game.waitForTimeout(timeout / 2);
            const pathLobbyImg = this.options.snapshotFolderPath + "-snapshots/" + "lobby.png";
            const pathGameIcon = this.options.snapshotFolderPath + "-snapshots/" + "gameIcon.png";
            await this.game.page.screenshot({ path: pathLobbyImg, fullPage: true });
            const gameicon = (await this.game.detectImageLocation(pathLobbyImg, pathGameIcon)) || { x: 0, y: 0 };
            console.log(gameicon);
            await this.game.page.mouse.click(gameicon.x, gameicon.y);
            await this.game.waitForTimeout(timeout * 3);
            const imgControlArea = await this.game.capture(baseLocatorNames.imgControlArea);
            // Assert
            expect(imgControlArea.image).toMatchSnapshot(imgControlArea.name);
        });
    }

    protected leaderBoardTests(): void {
        test("Verify UI of leaderboard", async () => {
            await test.step("Wait for start new round", async () => {
                await this.game.waitUntilPlaceBet();
            });
            await test.step("Verify UI of leader board ", async () => {
                const imgLeaderBoard = await this.game.captureLocator(baseLocatorNames.imgLeaderBoard);
                expect(imgLeaderBoard.image).toMatchSnapshot(imgLeaderBoard.name, {maxDiffPixelRatio : 0.3});
            });
        });

        test("Verify icon space man at leaderboard", async () => {
            await test.step("Verify icon spaceman on board", async () => {
                const icoSpaceMan = await this.game.captureLocator(baseLocatorNames.icoSpaceManOnBoard);
                expect(icoSpaceMan.image).toMatchSnapshot(icoSpaceMan.name, {maxDiffPixelRatio : 0.3});
            });
            await test.step("Verify icon spaceman cash out", async () => {
                const icoSpaceMan = await this.game.captureLocator(baseLocatorNames.icoSpaceManCashOut);
                expect(icoSpaceMan.image).toMatchSnapshot(icoSpaceMan.name, {maxDiffPixelRatio : 0.3});
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

        test.describe.serial(`${this.options.gameConfiguration.name} E2E Testing`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.gameGuides.init(this.game);
                this.betHistory.init(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.mainUITests();
        this.leaderBoardTests();
        this.md5PopupTests();
        this.autoCashoutTests();
        this.betAmountTests();
        this.autoPlayTests();
        this.placeBetAndCashoutTests();
        this.ticketHistoryTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
        this.returnGameLobby();
        this.turnbackGame();
    }
}

const openAutoPlayBoard = async (game: BaseGame) => {
    await game.clickOutSide();
    await game.clickLocator(baseLocatorNames.btnAutoPlay);
};

const selectAutoPlay = async (game: BaseGame, totalPlay: number) => {
    await game.clickLocator(baseLocatorNames.btnAutoPlay, 1500);
    await game.clickLocator(baseLocatorNames[`btnAutoPlay${totalPlay}`]);
    await game.clickLocator(baseLocatorNames.btnAutoPlayStart, 100);
};

export interface Expectdata {
    betdate: string;
    roundID: string;
    totalstake: string;
    betwin: string;
}

const enableAutoCashOut = async (game: BaseGame) => {
    game.clickLocator(baseLocatorNames.btnEnableAutoCashOut, 1000);
};

const openAutoCashoutPopup = async (game: BaseGame) => {
    game.clickLocator(baseLocatorNames.btnAutoCashOut, 1000);
};

const openBetAmoutPopup = async (game: BaseGame) => {
    game.clickLocator(baseLocatorNames.btnBetAmount, 1000);
};

const placeBet = async (game: BaseGame) => {
    await game.waitUntilPlaceBet();
    await game.clickLocator(baseLocatorNames.btnPlaceBet);
};

const cashOutHalf = async (game: BaseGame) => {
    await game.waitForTimeout(200);
    await game.clickLocator(baseLocatorNames.btnCashOutHalf);
};

const cashOut = async (game: BaseGame) => {
    await game.waitForTimeout(200);
    await game.clickLocator(baseLocatorNames.btnCashOut);
};

const getDataFistRowHistory = async (game: BaseGame, elementname: string = baseLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname, "0123456789:/., ", "history");
    return tempdata?.split(" ") || "";
};

const waitForSettlement = async (game: BaseGame) => {
    const message = await game.waitForEvent(GameEvent.Settlement);
    await game.waitForTimeout(2500); // add sleep due to feature Publish round result prior to settlement
    const winningByChoice = game.latestCaptureEvent(GameEvent.WinStatus);

    let settledResults = {
        settlementResult: message?.finish?.settlementResult,
        winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
        roundId: message.finish.roundId || 0,
    };
    settledResults["winAmount"] = winningByChoice.status.win ? winningByChoice.status.bet : 0;
    return settledResults;
};
