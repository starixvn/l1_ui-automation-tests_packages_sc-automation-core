import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { baseLocatorNames } from "../components/base-game-locator";
import { GameGuides } from "../game-components/guides/guides.spec";
import { GameEvent } from "../_shared";
import verifyImage from "../expects/verify-image";

const timeout = 3000;

export class CardGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}

    protected inGameUiTests() {
        test("Verify the in-game UI should be displayed correctly on table: game name, buttons, hands, chips,Stake: 0 and no button display", async () => {
            // Act
            const gameUi = await this.game.capture(baseLocatorNames.imgGameName);
            // Assert
            expect(gameUi.image).toMatchSnapshot(gameUi.name);
        });

        test("Verify default state of chip bar", async () => {
            const chipbar = await this.game.capture(`defaultChipBar${process.env.npm_config_project}`);
            // Assert
            expect(chipbar.image).toMatchSnapshot(chipbar.name);
        });

        test("Verify list items after clicking on hambuger menu", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.clickLocator(baseLocatorNames.hamburgerMenu);

            // Act
            const lstMenuItems = await this.game.capture(baseLocatorNames.lstMenuItems);

            // Assert
            expect(lstMenuItems.image).toMatchSnapshot(lstMenuItems.name);
            await this.game.clickOutSide();
        });
    }

    protected gamePlayButtonsTests() {
        test("Verify button Deal and Clear", async () => {
            // Act
            const betchoices = this.options.placeBetChoices;
            await this.selectChoices(betchoices);
            //Assert
            await verifyImage(this.game, baseLocatorNames.btnClear)
            await verifyImage(this.game, baseLocatorNames.btnDeal)
        });

        test("Verify button Hit and Stand", async () => {
            // Act
            await this.game.clickLocator(baseLocatorNames.btnDeal, timeout*3)
            //Assert
            await verifyImage(this.game, baseLocatorNames.btnHitCard);
            await verifyImage(this.game, baseLocatorNames.btnStand);
        });
        
        test("Verify chip bar is hidden after deal", async () => {
            //Assert
            await verifyImage(this.game, baseLocatorNames.imgChipBarHidden);
        });

        test("Verify button Rebet and New Bet", async () => {
            // Act
            await this.game.clickLocator(baseLocatorNames.btnStand); 
            if(this.game.locator(baseLocatorNames.btnConfirmStand)){
                await this.game.clickLocator(baseLocatorNames.btnConfirmStand)
            }
            await this.game.waitForTimeout(timeout*3);
            //Assert
            await verifyImage(this.game, baseLocatorNames.btnRebet);
            await verifyImage(this.game, baseLocatorNames.btnNewbet);
            //Pre-act
            await this.newBet();
        });
    }

    protected provablyFairTests() {
        test("Verify PF icon and UI of PF popup before deal", async () => {
            await verifyImage(this.game, baseLocatorNames.icoPF);
            // Act
            await this.openPFPopup();
            //Assert
            await verifyImage(this.game, baseLocatorNames.imgPFPopup);
        });

        test("Verify client seed popup", async () => {
            await test.step("Verify client seed popup", async () => {
                await this.game.clickLocator(baseLocatorNames.lblClientSeed, 5000);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed);
            });

            await test.step("Clear client seed", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeedClear);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeedCleared);
            });   

            await test.step("Input client seed 102", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeed1);
                await this.game.clickLocator(baseLocatorNames.btnClientSeed0);
                await this.game.clickLocator(baseLocatorNames.btnClientSeed2);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed102);
            });   

            await test.step("Backspace a number", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeedBackspace);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed10);
            });   

            await test.step("Save client seed", async () => {
                await this.game.clickLocator(baseLocatorNames.btnClientSeed2);
                await this.game.clickLocator(baseLocatorNames.btnClientSeedSave, 1000);
                await verifyImage(this.game, baseLocatorNames.imgClientSeed102);
            });   

            await test.step("Open client seed again and verify the value", async () => {
                await this.game.clickLocator(baseLocatorNames.lblClientSeed, 1000);
                await verifyImage(this.game, baseLocatorNames.popNewClientSeed102);
                await this.game.clickOutSide();
                await verifyImage(this.game, baseLocatorNames.imgClientSeed102);
            });

            await test.step("Verify increase and decrease client seed", async () => {
                for(let i = 1; i<=3; i++){
                    await this.game.clickLocator(baseLocatorNames.btnIncreaseClientSeed);
                }
                await verifyImage(this.game, baseLocatorNames.imgClientSeed1);
                for(let i = 1; i<=3; i++){
                    await this.game.clickLocator(baseLocatorNames.btnDecreaseClientSeed);
                }
                await verifyImage(this.game, baseLocatorNames.imgClientSeed102);
            });
        });

        test("Verify opening game guide when click on tooltip icon", async () => {
            //Act
            await this.game.clickLocator(baseLocatorNames.icoPFTooltip, timeout*2)
            //Assert
            await verifyImage(this.game, baseLocatorNames.imgGameGuidePF);
            //Pre-act
            await this.game.clickOutSide();
            await this.game.clickOutSide();
        });

        test("Verify PF setting popup in case place bet", async () => {
            //Act
            await this.selectChoices(this.options.placeBetChoices);
            await this.game.clickLocator(baseLocatorNames.btnHitCard, timeout*3);
            await this.game.clickLocator(baseLocatorNames.icoPF);
            await this.game.clickLocator(baseLocatorNames.lblClientSeed);
            //Assert
            await verifyImage(this.game, baseLocatorNames.imgClientSeed102Inactive);
            //Pre-act
            await this.game.clickOutSide();
            await this.game.clickLocator(baseLocatorNames.btnStand); 
            if(this.game.locator(baseLocatorNames.btnConfirmStand)){
                await this.game.clickLocator(baseLocatorNames.btnConfirmStand)
            }
            await this.game.waitForTimeout(timeout*2);
        });

        
        test("Verify PF popup from history", async () => {
            //Act
            await this.game.clickHistory();
            await this.game.clickLocator(baseLocatorNames.btnHistoryVerify, 1000);
            //Assert
            await verifyImage(this.game, baseLocatorNames.imgPFPopupServerSeed);
            await verifyImage(this.game, baseLocatorNames.imgPFPopupClientSeed);
            await verifyImage(this.game, baseLocatorNames.imgPFPopupServerSeedSHA256);
            await verifyImage(this.game, baseLocatorNames.imgPFPopupResult);
            await verifyImage(this.game, baseLocatorNames.btnPFPopupVerify);
            await this.game.clickLocator(baseLocatorNames.btnPFPopupVerify); 
            await verifyImage(this.game, baseLocatorNames.imgVerifySuccessful);
            await this.game.clickOutSide();
            await this.game.clickOutSide();
        });

    }


    protected placebetandCancelBehaviours() {
        test("Verify user can place bet and cancel bet on one hand", async () => {
            const betchoices = this.options.placeBetChoices;
            // Act
            await this.selectChoices(betchoices);

            // Act
            const btnCancel = await this.game.capture(baseLocatorNames.btnCancelChoice1);
            const lblTotalBet = await this.game.capture(`lblTotalBet${process.env.npm_config_project}`);

            // Assert
            expect(btnCancel.image).toMatchSnapshot(btnCancel.name);
            expect(lblTotalBet.image).toMatchSnapshot(lblTotalBet.name);
            await this.cancelbet();
        });

        test("Verify user can place bet and cancel bet on multiple hands", async () => {
            // Act
            const lblDefaultTotalBet = await this.game.capture(baseLocatorNames.lblDefaultTotalBet);
            const betchoices = this.options.multiPlaceBetChoices;

            await this.selectChoices(betchoices);

            // Act
            const btnCancel1 = await this.game.capture(baseLocatorNames.btnCancelChoice1);
            const btnCancel2 = await this.game.capture(baseLocatorNames.btnCancelChoice2);
            const btnCancel3 = await this.game.capture(baseLocatorNames.btnCancelChoice3);

            // Assert
            expect(btnCancel1.image).toMatchSnapshot(btnCancel1.name);
            expect(btnCancel2.image).toMatchSnapshot(btnCancel2.name);
            expect(btnCancel3.image).toMatchSnapshot(btnCancel3.name);
            await this.cancelbet();
            await this.game.clickLocator(baseLocatorNames.cancelbet, 1000);
            expect(lblDefaultTotalBet.image).toMatchSnapshot(lblDefaultTotalBet.name);
        });
    }

    protected placebetandsettlement(): void {
        const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount };

        test("Verify player able to placebet and Stand Card after deal", async () => {
            // Act 1
            const settledResults = await this.placebetStand(bet.amount, bet.choice);

            // Assert

            await this.verifySetlementResults(settledResults, bet);

        });

        test("Verify player can start a new bet on one hand and stand card if total >= 16", async () => {
            // Act 1
            await this.newBet();

            const settledResults = await this.placebetStandOver16(bet.amount, bet.choice);

            // Assert

            await this.verifySetlementResults(settledResults, bet);
        });

        test("Verify player can start a new bet with double amount after deal", async () => {
            test.skip(this.game.gameConfiguration.isDoubleFunction === false, "This game don't have double function")
            const betdouble = { choice: bet.choice, amount: (bet.amount as number) * 2 };
            await this.newBet();
            // Act 1
            const settledResults = await this.placebetDouble(bet.amount, bet.choice);
            // Assert
            if(settledResults.playerPontoon || settledResults.dealerPontoon){
                await this.verifySetlementResults(settledResults, bet);
            }
            else{
                await this.verifySetlementResults(settledResults, betdouble);
            }

        });


        test("Verify player can rebet", async () => {
            // Act 1
            const settledResults = await this.reBet();

            // Assert
            await this.verifySetlementResults(settledResults, bet);
        });

        test("Verify player can place bet on multiple hands", async () => {
            const multiplebets = { choices: this.options.multiPlaceBetChoices, amount: bet.amount };
            await this.newBet();
            // Act 1
            const settledResults = await this.placebetMultipleChoice(multiplebets.amount, multiplebets.choices);

            //Assert
            await this.verifyMultipleSetlementResults(settledResults)

        });
    }
    
    protected ticketHistoryTests() {
        test("Verify history data after placebet and settle", async () => {
            // Act 1
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount };
            await this.newBet()
            const settledResults = await this.placebetStand(bet.amount, bet.choice);

            await this.game.clickHistory(timeout);
            const ticketdata = await this.getDataFistRowHistory();

            const indexHistory: any = this.options.indexTicketHistory;

            const winamount = ticketdata[ticketdata?.length - 1];
            const totalbet = ticketdata[ticketdata?.length + indexHistory.totalbet];
            const dateIndex = ticketdata.findIndex((value) => {
                return value.includes("/");
            });
            const roundId = ticketdata[dateIndex + 1];

            // Assert
            expect(parseFloat(winamount)).toBeCloseTo(parseFloat(settledResults.betwin), -1);
            expect(parseInt(totalbet)).toEqual(settledResults.totalAmount);
            expect(parseInt(roundId)).toBeCloseTo(parseInt(settledResults.handid), -1);

            // Act 2
            if (indexHistory.isIdLink) {
                await this.game.clickLocator(baseLocatorNames.locHistoryRoundId, timeout);
                const roundID = await this.game.getTextLocator(baseLocatorNames.lblHistoryDetailRoundId, "0123456789");
                // Assert 2
                expect(parseInt(roundID)).toEqual(parseInt(settledResults.handid));
            }

            //Post-Act
            await this.game.clickOutSide();
            await this.game.clickOutSide();
        });
    }

    protected returnGameLobby(): void {
        test("Verify player redirect to gamelooby after clicking home icon", async () => {
            // Act 1
            await this.game.waitForTimeout(timeout);
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

            const gameNavigate: any = this.options.gameLobbyNavigation;

            await this.game.clickLocator(gameNavigate[0], timeout);
            await this.game.clickLocator(gameNavigate[1], timeout * 2);

            const imgGameName = await this.game.capture(baseLocatorNames.imgGameName);
            // Assert
            expect(imgGameName.image).toMatchSnapshot(imgGameName.name);
        });
    }

    
    protected jackPotBanner(): void {
        test("Verify JackPot banner still displayed when user return game lobby", async () => {
            // Act 1
            await this.game.waitForTimeout(2000);
            await this.game.clickHome(timeout / 2, baseLocatorNames.btnHome);
            await this.game.waitUntilGameLobbyUiLoad();
            const jackPotBanner = await this.game.capture(baseLocatorNames.jackPotbanner);
            expect(jackPotBanner.image).toMatchSnapshot(jackPotBanner.name);
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
        this.inGameUiTests();
        this.provablyFairTests();
        this.gamePlayButtonsTests();
        this.placebetandCancelBehaviours();
        this.placebetandsettlement()
        this.ticketHistoryTests()
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
        this.returnGameLobby();
        this.turnbackGame();
        if (process.env.npm_config_project === "l2") {
            this.jackPotBanner()
        }
    }

    async selectChoices(choices: any) {
        for (const iterator of choices) {
            await this.game.clickLocator(iterator, 1000);
        }
    }

    async cancelbet() {
        await this.game.clickLocator(baseLocatorNames.btnCancel, timeout);
    }

    async newBet() {
        await this.game.waitForTimeout(timeout);
        await this.game.clickLocator(baseLocatorNames.btnCancel, timeout);
    }

    async placebetStandOver16(amount: any, choices: any) {
        this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
        this.game.attachSocketAndCaptureEvent(GameEvent.Stand);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        this.game.attachSocketAndCaptureEvent(GameEvent.HitCard);
        let playercard: any;

        await this.game.clickStake(amount);
        await this.game.clickLocator(choices);

        await this.game.clickLocator(baseLocatorNames.btnHitCard, timeout*3);
        let endDeal = await this.game.latestCaptureEvent(GameEvent.Deal).deal;
        const isUnder16 = endDeal.hands[0].total.every((item) => item <= 16);
        const isDealer21 = await this.isDealer21(endDeal);
        const playertotal = Math.max(endDeal.hands[0].total[0], endDeal.hands[0].total[1] ?? 0)

        if (playertotal < 21 && isDealer21 === false) {
            if (isUnder16) {
                await this.game.clickLocator(baseLocatorNames.btnHitCard, timeout);
                playercard = (await this.game.latestCaptureEvent(GameEvent.HitCard)).hit;
                await this.game.clickLocator(baseLocatorNames.btnCancel);
                if(this.game.locator(baseLocatorNames.btnConfirmStand)){
                    await this.game.clickLocator(baseLocatorNames.btnConfirmStand)
                }
                await this.game.waitForTimeout(timeout);
            } else {
                await this.game.clickLocator(baseLocatorNames.btnCancel, timeout);
                playercard = (await this.game.latestCaptureEvent(GameEvent.Stand)).stand;
            }
        }
        else{
            playercard = {bet:endDeal.hands[0].bet,total:[playertotal],id:endDeal.hands[0].id}
        }

        let settled = await this.game.latestCaptureEvent(GameEvent.Settlement).finish;

        return {
            dealerTotal: settled.settlementResult,
            winningHands: settled.winningHands[0] ?? 0,
            totalAmount: playercard?.bet ?? endDeal.deal.hands[0].bet,
            betwin: settled.winningHands[0]?.betwin ?? 0,
            playerTotal: Math.max(playercard.total[0], playercard.total[1] ?? 0) ?? 0,
            handid: playercard.id,
        };
    }

    async placebetStand(amount: any, choices: any) {
        this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
        this.game.attachSocketAndCaptureEvent(GameEvent.Stand);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        let playercard: any;

        await this.game.clickStake(amount);
        await this.game.clickLocator(choices);

        await this.game.clickLocator(baseLocatorNames.btnHitCard, timeout*3);
        let endDeal = await this.game.latestCaptureEvent(GameEvent.Deal).deal;
        const isDealer21 = await this.isDealer21(endDeal);
        const playertotal = Math.max(endDeal.hands[0].total[0], endDeal.hands[0].total[1] ?? 0);

        if (playertotal < 21 && isDealer21 === false) {
            await this.game.clickLocator(baseLocatorNames.btnCancel);
            if(this.game.locator(baseLocatorNames.btnConfirmStand)){
                await this.game.clickLocator(baseLocatorNames.btnConfirmStand)
            }
            await this.game.waitForTimeout(timeout*3);
            playercard = (await this.game.latestCaptureEvent(GameEvent.Stand)).stand;
        }
        else{
            playercard = {bet:endDeal.hands[0].bet,total:[playertotal],id:endDeal.hands[0].id}
        }

        let settled = await this.game.latestCaptureEvent(GameEvent.Settlement).finish;

        return {
            dealerTotal: settled.settlementResult,
            winningHands: settled.winningHands[0] ?? 0,
            totalAmount: playercard?.bet ?? endDeal.hands[0].bet,
            betwin: settled.winningHands[0]?.betwin ?? 0,
            playerTotal: Math.max(playercard.total[0], playercard.total[1] ?? 0) ?? 0,
            handid: playercard.id,
        };
    }


    async placebetDouble(amount: any, choices: any) {
        this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
        this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        this.game.attachSocketAndCaptureEvent(GameEvent.Double);
        let playercard: any;

        await this.game.clickStake(amount);
        await this.game.clickLocator(choices);

        await this.game.clickLocator(baseLocatorNames.btnHitCard, timeout*3);
        let endDeal = await this.game.latestCaptureEvent(GameEvent.Deal).deal;
        const isDealer21 = await this.isDealer21(endDeal);
        const playertotal = Math.max(endDeal.hands[0].total[0])
        const isPlayerPontoon =  playertotal == 21 ? true : false;

        if (playertotal < 21 && isDealer21 === false) {
            await this.game.clickLocator(baseLocatorNames.btnDouble, timeout*3);
            playercard = (await this.game.latestCaptureEvent(GameEvent.Double)).double;
            if (Math.max(playercard.total[0])<=21) {
                await this.game.clickLocator(baseLocatorNames.btnCancel, timeout);
            }
        }
        else{
            playercard = {bet:endDeal.hands[0].bet,total:[playertotal],id:endDeal.hands[0].id}
        }

        let settled = await this.game.latestCaptureEvent(GameEvent.Settlement).finish;

        return {
            dealerPontoon: isDealer21,
            playerPontoon: isPlayerPontoon,
            dealerTotal: settled.settlementResult,
            winningHands: settled.winningHands[0] ?? 0,
            totalAmount: playercard?.bet ?? endDeal.hands[0].bet,
            betwin: settled.winningHands[0]?.betwin ?? 0,
            playerTotal: Math.max(playercard.total[0]) ?? 0,
            handid: playercard.id,
        };
    }

    async reBet() {
        this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
        this.game.attachSocketAndCaptureEvent(GameEvent.Stand);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        let playercard: any;

        await this.game.waitForTimeout(timeout);
        await this.game.clickLocator(baseLocatorNames.btnHitCard, timeout*3);
        let endDeal = await this.game.latestCaptureEvent(GameEvent.Deal).deal;
        const isDealer21 = await this.isDealer21(endDeal);
        const playertotal = Math.max(endDeal.hands[0].total[0], endDeal.hands[0].total[1] ?? 0)

        if (playertotal < 21 && isDealer21 === false) {
            await this.game.clickLocator(baseLocatorNames.btnCancel);
            if(this.game.locator(baseLocatorNames.btnConfirmStand)){
                await this.game.clickLocator(baseLocatorNames.btnConfirmStand)
            }
            await this.game.waitForTimeout(timeout*3)
            playercard = (await this.game.latestCaptureEvent(GameEvent.Stand)).stand;
        }
        else{
            playercard = {bet:endDeal.hands[0].bet,total:[playertotal],id:endDeal.hands[0].id}
        }

        let settled = await this.game.latestCaptureEvent(GameEvent.Settlement).finish;

        return {
            dealerTotal: settled.settlementResult,
            winningHands: settled.winningHands[0] ?? 0,
            totalAmount: playercard?.bet ?? endDeal.hands[0].bet,
            betwin: settled.winningHands[0]?.betwin ?? 0,
            playerTotal: Math.max(playercard.total[0], playercard.total[1] ?? 0) ?? 0,
            handid: playercard.id,
        };
    }

    async placebetMultipleChoice(amount: any, choices: any) {
        this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        this.game.attachSocketAndCaptureEvent(GameEvent.Stand);

        await this.game.clickStake(amount);
        for (const iterator of choices) {
            await this.game.clickLocator(iterator, 1000);
          }

        await this.game.clickLocator(baseLocatorNames.btnHitCard, timeout*4);
        let endDeal = await this.game.latestCaptureEvent(GameEvent.Deal).deal;
        const isDealer21 = await this.isDealer21(endDeal);
        let playerresults:any =[]

        if (isDealer21 === false) {
            let data:any
          
              for (let index = 0; index < choices.length; index++) {
                const playertotal = Math.max(endDeal.hands[index].total[0])
                if (playertotal < 21) {
                    await this.game.clickLocator(baseLocatorNames.btnCancel);
                    if(this.game.locator(baseLocatorNames.btnConfirmStand)){
                        await this.game.clickLocator(baseLocatorNames.btnConfirmStand);
                    }
                    await this.game.waitForTimeout(timeout);
                }
                data = [{pos: endDeal.hands[index].pos,
                  bet: endDeal.hands[index].bet,
                  total: Math.max(...endDeal.hands[index].total),
                  id: endDeal.hands[index].id,
                }]
                playerresults = playerresults.concat(data);
              }
            };

    let settled = await this.game.latestCaptureEvent(GameEvent.Settlement).finish;
        return {
    dealerTotal: settled.settlementResult,
    winningHands: settled.winningHands || 0,
    totalAmount: endDeal.totalAmount,
    betwin: settled.winningHands[0]?.betwin || 0,
    playerhands: playerresults,
         };
    }

    protected async verifySetlementResults(settledResults: any, betdata: any) {
        expect(settledResults.totalAmount).toBe(betdata.amount);
        let qualifiedPoint = this.game.gameConfiguration.qualifiedPoint ??  0; 
        const playerWins =
            settledResults.playerTotal <= 21 && settledResults.playerTotal >= qualifiedPoint &&
            (settledResults.dealerTotal > 21 || settledResults.playerTotal > settledResults.dealerTotal);

        if (playerWins) {
            expect(settledResults.betwin > 0).toBe(true);
        } else {
            expect(settledResults.betwin == 0).toBe(true);
        }
    }

    protected async isDealer21(endDeal: any){
        if(endDeal.dealer.length == 0){
            return false
        }
        else{
            return true
        }
    }

    protected async verifyMultipleSetlementResults(settledResults: any) {
        const playerWins = settledResults.winningHands.length > 0 ? true : false;
        if (playerWins) {
            let passResult = false;
            for (const iterator of settledResults.winningHands) {
                if (!settledResults.playerhands.some((b) => b.id === iterator.id)) {
                    passResult = false;
                } else {
                    passResult = true;
                }
            }
            expect(passResult).toBe(true);
        } else {
            expect(settledResults.betwin == 0).toBe(true);
        }
    }

    async getDataFistRowHistory (elementname: string = baseLocatorNames.lblHistoryFirstRow){
        let tempdata = await this.game.getTextLocator(elementname, "0123456789:/, ", "history");
        return tempdata?.split(" ") || "";
    };

    async openPFPopup (){
        await this.game.clickLocator(baseLocatorNames.icoPF, 1000)
    };
    
}
