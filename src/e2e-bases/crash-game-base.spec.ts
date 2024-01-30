import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { baseLocatorNames } from "../components/base-game-locator";
import { GameGuides } from "../game-components/guides/guides.spec";
import { BetHistory } from "../game-components/history/history.spec";
import verifyImage from "../expects/verify-image";

const timeout = 4000;

const  CrashGameEvent = {
    StartCashOut: (msg) => msg?.c?.t == 0,
    CashOut : (msg) => msg?.cashOut,
    HalfCashOut : (msg) => msg?.halfCashOut,
}


export class CrashGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();
    protected betHistory: BetHistory = new BetHistory();

    constructor(protected options: IBaseOptions) {}

    protected mainUITests() {
        test("Verify default control area", async () => {
                //Assert
                await verifyImage(this.game, `imgControlArea${process.env.npm_config_project}`);
        });

        test("Verify UI of the rocket", async () => {
            //Act
            await test.step("Wait for start new round", async () => {
                await this.game.waitUntilPlaceBet();
                await this.game.waitForTimeout(2000);
            });
                //Assert
            await test.step("Get rocket image", async () => {
                await verifyImage(this.game, baseLocatorNames.imgRocket, 0.3);
            })
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
                await verifyImage(this.game, baseLocatorNames.mnuHamburgerExpandSoundOn);
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
                 //Assert
                await verifyImage(this.game, baseLocatorNames.mnuHamburgerExpandSoundOff);
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
                await verifyImage(this.game,`popBetAmount${process.env.npm_config_project}`);
            });
        });

        test("Verify max bet amount", async () => {
            //Act
            await test.step("Click on max chip 5 times", async () => {
                for (let i = 0; i < 5; i++) {
                    await this.game.clickLocator(baseLocatorNames.btnMaxChip);
                }
            });
            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                await verifyImage(this.game,`popBetAmountMaxChip${process.env.npm_config_project}`);
            });

            await test.step("Click confirm button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnMaxChip);
            });
            await test.step("Verify that bet amount show correctly", async () => {
                await verifyImage(this.game,`imgBetAmountMaxChip${process.env.npm_config_project}`);
            });
        });

        test("Verify player be able to clear bet amount", async () => {
            //Act
            await test.step("Click on clear button", async () => {
                this.game.clickLocator(baseLocatorNames.btnClearBetAmount);
            });
            //Assert
            await test.step("Verify the bet amount is clear and confirm button is disable", async () => {
                await verifyImage(this.game,`popBetAmount${process.env.npm_config_project}`);
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
                await verifyImage(this.game,`imgBetAmountFirstChip${process.env.npm_config_project}`);

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
                await verifyImage(this.game,`imgBetAmountIncrease${process.env.npm_config_project}`);
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
                await verifyImage(this.game,`imgBetAmountFirstChip${process.env.npm_config_project}`);
            });
        });
    }

    protected autoPlayTests(totalAutoPlay:number = 10) {
        test("Verify default state of auto-play button", async () => {
            await test.step("Capture default auto-play button and compare with snapshot", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay);
            });
        });

        test("Verify default state of auto-play popup", async () => {
            // Act
            await test.step("Open auto play popup", async () => {
                await openAutoPlayBoard(this.game);
            });

            await test.step("Capture default auto-play popup and compare with snapshot", async () => {
                await verifyImage(this.game,baseLocatorNames.popAutoPlay);

            });

            await test.step("Click outside to close the popup", async () => {
                await this.game.clickOutSide(1000);
            });
        });

        test("Verify start auto-play at running time", async () => {
            await test.step("Wait for rocket start fly", async () => {
                await waitForStartCashOut(this.game);
            });
            await test.step("Start auto-play", async () => {
                await selectAutoPlay(this.game, totalAutoPlay);
            });
            await test.step("Verify button place bet accepted", async () => {
                await verifyImage(this.game,baseLocatorNames.btnEarlyBetAccepted);
            });

            await test.step("Verify number of auto-play is 9", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay9Remaining);

            });
        });

        test("Verify player be able to stop auto-play by cancel early bet", async () => {
            await test.step("Click on place bet button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet, 3000);
            });
            await test.step("Verify auto play button", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay);

            });
            await test.step("Verify button place bet ", async () => {
                await verifyImage(this.game,baseLocatorNames.btnPlaceEarlyBet);

            });
        });

        test("Verify auto-play button in case place early bet then start autoplay", async () => {
            await test.step("Click on place bet button", async () => {
                await waitForStartCashOut(this.game);
                await this.game.waitForTimeout(500);
            });
            await test.step("Click on place bet button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet);
            });
            await test.step("Start auto-play", async () => {
                await selectAutoPlay(this.game, totalAutoPlay);
            });
            await test.step("Verify auto play button", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay10Remaining);

            });
            await test.step("Cancel auto-play", async () => {
                await this.game.clickLocator(baseLocatorNames.btnAutoPlay);
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet);
            });
        });

        test("Verify auto-play button in case player place bet then start auto-play", async () => {
            await test.step("Place bet", async () => {
                await placeBet(this.game);
            });
            await test.step("Start auto-play", async () => {
                await selectAutoPlay(this.game, totalAutoPlay);
            });
            await test.step("Verify number of auto-play is 10", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay10Remaining);
            });
            await test.step("Stop auto play", async () => {
                this.game.clickLocator(baseLocatorNames.btnAutoPlay);
            });
        });

        test("Verify player can start 10 auto play and finish 10 round", async () => {
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
                await verifyImage(this.game,baseLocatorNames.btnPlaceBetBetAccepted);

            });

            await test.step("Verify number of auto-play is 9", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay9Remaining);

            });
            for (let index = 1; index <= totalAutoPlay; index++) {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
                const settledResults = await waitForSettlement(this.game);
                settledResultsAutoPlay.push(settledResults.roundId);
            }

            await test.step(`Verify number of spins`, async () => {
                expect(settledResultsAutoPlay.length >= 10).toBe(true);
            });

            await test.step("Verify that auto-play button is back to default", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay);
            });

            await test.step(`Close popup`, async () => {
                this.game.waitForTimeout(timeout);
                this.game.clickOutSide();
            });

            await test.step(`Disable auto cashout`, async () => {
                await enableAutoCashOut(this.game);
            });
        });

        test("Verify that player can stop auto-play by click on auto-play button", async () => {

            test.setTimeout(this.options.gameConfiguration.maxTimeout * 2);
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
                await this.game.clickLocator(baseLocatorNames.btnAutoPlay, 3000);
            });

            await test.step("Verify UI of auto play button", async () => {
                await verifyImage(this.game,baseLocatorNames.btnAutoPlay);
            });
        });
    }

    protected autoCashoutTests() {
        test("Verify default state of auto cashout popup", async () => {
            await test.step("Open auto cashout popup", async () => {
                await openAutoCashoutPopup(this.game);
            });
            await test.step("Capture default auto cashout button and compare with snapshot", async () => {
                await verifyImage(this.game,baseLocatorNames.popAutoCashout);
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
                await verifyImage(this.game,baseLocatorNames.lblAutoCashoutMultiplierMaxLength);

            });
            await test.step("Click confirm", async () => {
                await this.game.clickLocator(baseLocatorNames.btnConfirmAutoCashout);
            });
            await test.step("Verify multiplier number is applied", async () => {
                await verifyImage(this.game,baseLocatorNames.lblAutoCashoutMultiplierMaxLengthApplied);
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
                await verifyImage(this.game,baseLocatorNames.lblMultiplier2001);
            });
            await test.step("Verify confirm button is disabled", async () => {
                await verifyImage(this.game,baseLocatorNames.btnConfirmAutoCashoutDisabled);
            });
        });
        test("Verify backspace a number in auto cashout popup", async () => {
            await test.step("Click backspace button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnBackspace);
            });
            await test.step("Verify the number is deleted", async () => {
                await verifyImage(this.game,baseLocatorNames.lblMultiplier200);

            });
        });
        test("Verify clear multiplier in auto cashout popup", async () => {
            await test.step("Click clear button", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClearAutoCashout);
            });
            await test.step("Verify the number is cleared", async () => {
                await verifyImage(this.game,baseLocatorNames.lblMultiplierCleared);
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
                await verifyImage(this.game,baseLocatorNames.lblAutoCashoutEnable);

            });
        });
        test("Verify player can disable auto cash out", async () => {
            await test.step("Click disable auto cash out", async () => {
                await this.game.clickLocator(baseLocatorNames.btnEnableAutoCashOut);
            });
            await test.step("Verify the auto cashout icon is disable", async () => {
                await verifyImage(this.game,baseLocatorNames.lblAutoCashoutDisable);

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
                await verifyImage(this.game,baseLocatorNames.imgAutoCashoutIncrease);

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
                await verifyImage(this.game,baseLocatorNames.imgAutoCashoutDecrease);

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
                await verifyImage(this.game,baseLocatorNames.btnPlaceBet);
            });
        });

        test("Verify player be able to cancel early bet", async () => {
            await test.step("Wait for start cash out", async () => {
                await waitForStartCashOut(this.game);
                await this.game.waitForTimeout(300);
            });
            await test.step("Capture early bet button and compare with snapshot", async () => {
                await verifyImage(this.game,baseLocatorNames.btnPlaceEarlyBet);

            });
            await test.step("Click place early bet then clicks again to cancel bet", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet,1000);
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet);
            });
            await test.step("Capture early bet button and compare with snapshot", async () => {
                await verifyImage(this.game,baseLocatorNames.btnPlaceEarlyBet);
            });
            
        });

        test("Verify player be able to place early bet and cash out 50%", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await test.step("Click early bet", async () => {
                await this.game.clickLocator(baseLocatorNames.btnPlaceBet);
            });
            await test.step("Verify button bet waitting", async () => {
                await verifyImage(this.game,baseLocatorNames.btnEarlyBetAccepted);

            });
            await test.step("Verify bet amount when new round started", async () => {
                const placeBetResponse = await this.game.waitForEndBet();
                expect(placeBetResponse.endBet).toBe(this.options.placeBetAmount);
            });
            await test.step("Verify button place bet accepted", async () => {
                await verifyImage(this.game,baseLocatorNames.btnPlaceBetBetAccepted);

            });
            await test.step("Click cashout 50% and verify win amount", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
                await waitForStartCashOut(this.game); //Wait for start fly
                let settledResults = await this.game.latestCaptureEvent(GameEvent.Settlement);
                if (settledResults === "") {
                    //Have not crash yet
                    cashOutHalf(this.game); //click cash out 50%
                    let cashOutResult = await this.game.waitForSpecificEvent(CrashGameEvent.HalfCashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.halfCashOut.cashOutWin);
                } else {
                    // If crash at base, place bet again
                    await placeBet(this.game);
                    await waitForStartCashOut(this.game); //wait for start cash out
                    await cashOutHalf(this.game); //click cash out 50%
                    let cashOutResult = await this.game.waitForSpecificEvent(CrashGameEvent.CashOut);
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
                await verifyImage(this.game,baseLocatorNames.btnPlaceBetBetAccepted);

            });
            let settledResults;
            await test.step("Click cashout and verify win amount", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
                await waitForStartCashOut(this.game); //Wait for start fly
                settledResults = await this.game.latestCaptureEvent(GameEvent.Settlement);
                if (settledResults === "") {
                    //Have not crash yet
                    cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.waitForSpecificEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.cashOut.cashOutWin);
                } else {
                    // If crash at base, place bet again
                    await placeBet(this.game);
                    await waitForStartCashOut(this.game); //wait for start cash out
                    await cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.waitForSpecificEvent(CrashGameEvent.CashOut);
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
                await verifyImage(this.game,baseLocatorNames.popMD5,0.3 );
            });
        });

        test("Verify opening md5 section on game guide when click on tooltip icon ", async () => {
            //Act
            await test.step("Click on tooltip icon", async () => {
                await this.game.clickLocator(baseLocatorNames.btnTooltipMd5, 3000);
            });
            //Assert
            await test.step("Verify the game guide is opened in MD5 section", async () => {
                await verifyImage(this.game,baseLocatorNames.popGuideMd5);

            });
            await test.step("Close the popup", async () => {
                await this.game.clickOutSide();
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
                await verifyImage(this.game,baseLocatorNames.lblResultCleared);
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

            await verifyImage(this.game,baseLocatorNames.imgGameLobby);

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
            await verifyImage(this.game,baseLocatorNames.imgControlArea);
        });
    }

    protected leaderBoardTests(): void {

        test("Verify UI of leader board in collapse mode", async () => {
            await test.step("Verify icon spaceman on board", async () => {
                await verifyImage(this.game,baseLocatorNames.icoSpaceManOnBoard);

            });
            await test.step("Verify icon spaceman cash out", async () => {
                await verifyImage(this.game,baseLocatorNames.icoSpaceManCashOut);

            });
            await test.step("Verify text crashed", async () => {
                await verifyImage(this.game,baseLocatorNames.txtCrashed);

            });
            await test.step("Verify icon expand", async () => {
                await verifyImage(this.game,baseLocatorNames.icoExpand);

            });
        });

        test("Verify UI of leader board in expand mode", async () => {
            await test.step("Click icon expand", async () => {
                await this.game.clickLocator(baseLocatorNames.icoExpand);
            });
            await test.step("Verify icon collapse", async () => {
                await verifyImage(this.game,baseLocatorNames.icoCollapse);

            });
            await test.step("Verify leader board table", async () => {
                await verifyImage(this.game,baseLocatorNames.imgLeaderboardTable);

            });
        });


        test("Verify main player in leaderboard", async () => {
            await test.step("Wait for start new round and place bet", async () => {
                await placeBet(this.game);
            });
            await test.step("Verify main player bet amount in leader board", async () => {
                await verifyImage(this.game,`imgMainPlayerBetAmountLeaderBoard${process.env.npm_config_project}`, 0.01);
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

const waitForStartCashOut = async (game: BaseGame) => {
    await game.waitForSpecificEvent(CrashGameEvent.StartCashOut);
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
