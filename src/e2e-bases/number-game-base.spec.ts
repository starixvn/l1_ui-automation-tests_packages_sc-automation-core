import { test, BasePlayer, BaseGame , BaseElementLocator, ImageSnapshot} from "../components";
import { expect } from "../expects";
import { GameEvent } from "../_shared";
import { commonControls } from "../components/base-number-game-locator";
import { IBaseOptions } from "./base-options";

export class NumberGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected inGameUITests() {
        test("Verify in game UI @A_1 @A_7", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            await this.game.verifyImageLocators(this.options.locators.inGameUIE2E);
        });

        test("Verify controls are visible @A_2", async () => {
            // Assert
            await this.game.verifyLocatorsVisible(this.options.locators.controlsE2E);
        });

        test("Verify menu list items @A_2", async () => {
            // Assert
            await this.game.click(commonControls.iconMenu);
            await this.game.verifyLocatorsVisible(this.options.locators.menuItems);
            await this.game.click(commonControls.iconMenu);
        });
    }

    protected pfSettingTests() {
        test("Verify default state of PF setting popup @A_17", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.click(commonControls.iconPF);
            await this.game.verifyLocatorsVisible(this.options.locators.pfSettingControls);
            await this.game.click(commonControls.iconClosePfSetting);
        });

        test("Verify PF setting after reload page @A_19", async () => {
            // Assert
            await this.game.click(commonControls.iconPF);
            const bfRandom = await this.game.page.locator("#random-seed").isChecked();
            await this.game.page.reload({ waitUntil: "domcontentloaded" })
            await this.game.waitForTimeout(3000);
            await this.game.click(commonControls.iconPF);
            const afRandom = await this.game.page.locator("#random-seed").isChecked();
            expect(bfRandom).toBe(afRandom);
            await this.game.click(commonControls.iconClosePfSetting);

        });

        test("Verify PF setting after go back game from lobby @A_20", async () => {
            // Assert
            await this.game.click(commonControls.iconPF);
            const bfRandom = await this.game.page.locator("#random-seed").isChecked();
            await this.game.click(commonControls.iconClosePfSetting);
            await this.game.click(commonControls.iconHome);           
            await this.game.click(this.options.locators.lobbyGameIcon, 1000);
            await this.game.click(commonControls.iconPF);
            const afRandom = await this.game.page.locator("#random-seed").isChecked();
            expect(bfRandom).toBe(afRandom);
            await this.game.click(commonControls.iconClosePfSetting);
        });
    }

    protected quickBetTests() {
        test("Verify UI of Quick bet button OFF @A_3", async () => {
            // Assert
            await this.player.gnSetQuickBet(false);
            expect(await this.game.page.locator(commonControls.iconQuickBet).screenshot()).toMatchSnapshot(
                this.options.locators.quickBetState[0],
            );
        });

        test("Verify UI of Quick bet button ON @A_4", async () => {
            // Assert
            const isCheck = await this.game.page.locator(commonControls.chkQuickBet).isChecked();
            if (isCheck == true) {
                await this.game.click(commonControls.iconQuickBet);
                await this.game.waitForTimeout(1000);
            }
            await this.game.click(commonControls.iconQuickBet);
            const popupQBcontrols = [commonControls.btnCancelQB, commonControls.btnConfirmQB];
            await this.game.verifyLocatorsVisible(popupQBcontrols);
            await this.game.verifyValueLocators(this.options.locators.quickbetMessage);
            await this.game.waitForTimeout(1000);
        });

        test("Click on button Cancel of Quick Bet popup @A_5", async () => {
            await this.game.click(commonControls.btnCancelQB);
            await this.game.waitForTimeout(1000);
            expect(await this.game.page.locator(commonControls.iconQuickBet).screenshot()).toMatchSnapshot(
                this.options.locators.quickBetState[0],
            );
        });

        test("Click on button Enable Quick Bet of Quick Bet popup @A_6", async () => {
            await this.game.gnWaitUntilPlaceBet();
            await this.player.gnSetQuickBet(true);
            expect(await this.game.page.locator(commonControls.iconQuickBet).screenshot()).toMatchSnapshot(
                this.options.locators.quickBetState[1],
            );
        });
    }

    protected chipTests() {
        test("Verify chip selected when open game @A_8", async () => {
            const chipLocators = this.options.locators.chip;
            for (const key in chipLocators) {
                expect(await this.game.page.locator(key).screenshot()).toMatchSnapshot(chipLocators[key]);
                await this.game.click(commonControls.btnChipSliderNext, 500);
            }
            for (let index = 0; index < Object.keys(chipLocators).length; index++) {
                await this.game.click(commonControls.btnChipSliderPre, 300);
            }
        });

        test("Verify betting by each bet chip @A_9", async () => {
            const chipLocators = this.options.locators.chip;
            const betchoice = this.options.locators.betchoices[this.options.placeBetChoices[0]];
            const ownbet = commonControls.lblPlayerOwnBet;
            await this.game.gnWaitUntilPlaceBet();
            await this.player.gnSetQuickBet(false);

            for (const key in chipLocators) {
                await this.game.click(betchoice, 200);
                let expectedValue = key.replace("#chip-", "");
                await this.game.verifyText(ownbet, Number(expectedValue).toLocaleString());
                await this.game.click(commonControls.btnCancelbet, 200);
                await this.game.click(commonControls.btnChipSliderNext, 200);
            }
            for (let index = 0; index < Object.keys(chipLocators).length; index++) {
                await this.game.click(commonControls.btnChipSliderPre, 300);
            }
        });
    }

    protected balanceTests() {
        test("Verify Player's balance when Player placebet single choice @A_10", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            let bfbalance = await this.game.getText(commonControls.lblBalance);
            const bet = {
                choice: this.options.placeBetChoices[2],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[2]],
            };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            const placeBetResponse = await this.player.gnQuickPlaceBet(bet.locator, bet.amount);
            let afbalance = await this.game.getText(commonControls.lblBalance);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = placeBetResponse.odds;

            // Assert
            expect(parseInt(bfbalance.replace(",", "")) - bet.amount).toBe(parseInt(afbalance.replace(",", "")));
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            expect(bet).toMatchWinning(settledResults);
        });

        test("Verify Player's balance when Player placebet multiple choices @A_11", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            let bfbalance = await this.game.getText(commonControls.lblBalance);
            const amount = this.options.placeBetAmount ?? 1;
            const multiplechoices = [
                this.options.locators.betchoices[this.options.placeBetChoices[0]],
                this.options.locators.betchoices[this.options.placeBetChoices[2]],
            ];
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            const odds = await this.player.gnPlaceHedgeBet(multiplechoices, amount);
            await this.game.waitForTimeout(2000);

            let afbalance = await this.game.getText(commonControls.lblBalance);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = odds;

            // Assert
            expect(parseInt(bfbalance.replace(",", "")) - amount * 2).toBe(parseInt(afbalance.replace(",", "")));
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
        });
    }

    protected timerTests() {
        test("Verify time and msg of bet round @A_12", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.player.gnSetQuickBet(true);
            const bet = {
                choice: this.options.placeBetChoices[2],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[2]],
            };
            await this.game.click(`#chip-${bet.amount}`);
            await this.game.gnWaitUntilPlaceBet(0);
            const startrountTime =
                this.options.gameConfiguration.durations.wholeRound - this.options.gameConfiguration.durations.shakeThePlateDuration;
            for (let index = 1; index < this.options.gameConfiguration.durations.placingBets; index++) {
                if (index === 1) {
                    expect(await this.game.getText(commonControls.lblTimerCoundDown)).toBe(`${startrountTime}`);
                }
                else if(index === 2 ||index === 7 || index === this.options.gameConfiguration.durations.placingBets - 1){
                    await this.game.click(bet.locator,0);
                    await this.game.verifyText(commonControls.lblTimerMsg, this.options.locators.placeBetMsg.spb);

                }  
                await this.game.waitForTimeout(1000);
            }
            for (let index = 1; index <= this.options.gameConfiguration.durations.lockingBet; index++) {
                await this.game.verifyText(commonControls.lblTimerMsg, this.options.locators.placeBetMsg.epb);
                if (index === 2) {
                    await this.game.click(bet.locator);
                }
                await this.game.waitForTimeout(1000);
            }
            await this.game.waitForTimeout(1000);
            await this.game.verifyText(commonControls.lblTimerMsg, this.options.locators.placeBetMsg.orb);

            // Assert
            await this.game.waitForTimeout(this.options.gameConfiguration.durations.shakeThePlateDuration);
            await this.player.gnOpenHistory();
            await this.game.verifyText(
                this.options.locators.ticketHistory["amount"],
                String(bet.amount * (this.options.gameConfiguration.durations.placingBets - 1)),
            );
            await this.player.gnClosePopUp();
        });
    }

    protected statisticBoardTests() {
        test("Verify Statistic bar icon @A_14", async () => {
            // Arrange
            await this.game.verifyImageLocators(this.options.locators.statisticbar);
        });

        test("Verify user can slide left/right to switch road @A_15", async () => {
            // Arrange
            await this.game.verifyImageLocators(this.options.locators.statisticbar);
            await this.game.page.click(commonControls.btnStatisticNext);
            await this.game.waitForTimeout(1000);
            expect(await this.game.page.locator(commonControls.tblbigRoad).isVisible()).toBe(true);
            await this.game.page.locator(commonControls.btnStatisticPrev).first().click();
            await this.game.waitForTimeout(1000);
            expect(await this.game.page.locator(commonControls.tblbeadRoad).isVisible()).toBe(true);
        });

        test("Verify total rows and columns of Bead Road & Big Road@A_15", async () => {
            // Arrange
            const totalcellBIR = await this.game.page.$$eval(commonControls.cellsbigRoad, (elements) => elements.length);
            const totalcellBER = await this.game.page.$$eval(commonControls.cellsbeadRoad, (elements) => elements.length);
            expect(totalcellBIR).toBe(108);
            expect(totalcellBER).toBe(108);
        });

        test("Verify statistic result data of the latest 108 rounds @A_16", async () => {
            // Arrange
            await this.game.waitUntilPlaceBet();
            let totalP = await this.game.page
                .locator("//div[@id='bead-road']//span[contains(@class,'scoreboard-elements_player')]")
                .count();
            let totalB = await this.game.page
                .locator("//div[@id='bead-road']//span[contains(@class,'scoreboard-elements_banker')]")
                .count();
            let totalT = await this.game.page.locator("//div[@id='bead-road']//span[contains(@class,'scoreboard-elements_tie')]").count();

            totalP = parseInt(((totalP / 108) * 100).toFixed(0));
            totalB = parseInt(((totalB / 108) * 100).toFixed(0));
            totalT = parseInt(((totalT / 108) * 100).toFixed(0));

            await this.game.verifyText(commonControls.PStatistic, totalP + "%");
            await this.game.verifyText(commonControls.BStatistic, totalB + "%");
            await this.game.verifyText(commonControls.TStatistic, totalT + "%");
        });
    }

    protected placeBetSettle1Tests() {
        test("Verify user can place a bet with random client seed @A_13", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[2],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[2]],
            };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            await this.player.gnSettingPF("");
            const placeBetResponse = await this.player.gnQuickPlaceBet(bet.locator, bet.amount);
            let turn = await this.game.getText(commonControls.lblTurn);
            const match = turn.match(/\d+/);
            turn = match ? match[0] : "";
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = placeBetResponse.odds;
            settledResults.turn = turn;
            global.settledResults = settledResults;
            global.placeBetResponse = placeBetResponse;
        });
        test("Verify bet ticket history of random client seed @A_13", async () => {
            // Assert
            await this.player.gnOpenHistory();
            // Act
            await this.game.verifyValueLocators(this.options.locators.historyHeader);
            let expectedValue = {
                drawId: global.settledResults.drawId,
                player: global.settledResults.result.player,
                banker: global.settledResults.result.banker,
                amount: this.options.placeBetAmount,
                winAmount: global.settledResults.winAmount,
            };

            for (const key in expectedValue) {
                await this.game.verifyText(this.options.locators.ticketHistory[key], expectedValue[key]);
            }
            expectedValue["odds"] = global.settledResults.odds[this.options.placeBetChoices[2]];
            await this.game.verifyDateTimeFormat("//tbody/tr[1]/td[1]");
            global.expectedValue = expectedValue;
        });
        test("Verify bet ticket details of random client seed @A_13", async () => {
            //Open History Detail
            await this.game.click(this.options.locators.ticketHistory["drawId"], 1000);
            await this.game.verifyDateTimeFormat("//div[@id='bet-detail']//tbody/tr[1]/td[1]");
            for (const key in global.expectedValue) {
                await this.game.verifyText(this.options.locators.ticketDetail[key], global.expectedValue[key]);
            }
            await this.game.verifyLocatorsVisible([commonControls.icon_Pf_HistoryDetail]);
            await this.game.click(commonControls.icon_Pf_HistoryDetail, 1000);
        });

        test("Verify PF details of random client seed @A_13 @A_17", async () => {
            // Verify PF History Detail
            const PFControls = [
                commonControls.txtServerSeed256_Pf_HistoryDetail,
                commonControls.txtServerSeed_Pf_HistoryDetail,
                commonControls.txtMergeClientSeed_Pf_HistoryDetail,
                commonControls.txtCombinedHash_Pf_HistoryDetail,
            ];
            await this.game.verifyLocatorsVisible(PFControls);
            const drawIdTurn = await this.game.getText(commonControls.lbl_Pf_drawIdTurn_HistoryDetail);
            const serverSeed256 = await this.game.page.locator(commonControls.txtServerSeed256_Pf_HistoryDetail).getAttribute("value");
            const serverSeed = await this.game.page.locator(commonControls.txtServerSeed_Pf_HistoryDetail).getAttribute("value");
            const mergeClientSeed = await this.game.page.locator(commonControls.txtMergeClientSeed_Pf_HistoryDetail).getAttribute("value");
            const combinedHash = await this.game.page.locator(commonControls.txtCombinedHash_Pf_HistoryDetail).getAttribute("value");
            const settlePF = global.settledResults.pf;
            expect(drawIdTurn.includes(global.settledResults.turn)).toBe(true);
            expect(serverSeed256).toBe(settlePF.serverSeedHash);
            expect(serverSeed).toBe(settlePF.serverSeed);
            expect(mergeClientSeed).toBe(settlePF.mergeClientSeed);
            expect(combinedHash).toBe(settlePF.finalHash);
        });

        test("User return main UI of game @A_17", async () => {
            // Verify PF History Detail
            await this.game.click(commonControls.iconClose_Pf_HistoryDetail, 1000);
            await this.game.click(commonControls.iconCloseHistoryDetail, 1000);
            await this.player.gnClosePopUp();
            await this.game.verifyLocatorsVisible(this.options.locators.controlsE2E);
        });
    }

    protected placeBetSettle2Tests() { 
        test("Verify user can place a bet with manual client seed @A_18", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[2],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[2]],
            };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            const manualSeed = "6969";
            const odds = await this.game.gnWaitUntilPlaceBet();
            await this.player.gnSettingPF(manualSeed);
            await this.player.gnBetOn(bet.locator, bet.amount);
            const endBets =await this.game.waitForEndBet();
            let turn = await this.game.getText(commonControls.lblTurn);
            const match = turn.match(/\d+/);
            turn = match ? match[0] : "";
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = odds;
            settledResults.turn = turn;
            global.settledResults = settledResults;
            global.placeBetResponse = endBets;
        });
        test("Verify bet ticket history of manual client seed @A_18", async () => {
            // Assert
            await this.player.gnOpenHistory();
            // Act
            await this.game.verifyValueLocators(this.options.locators.historyHeader);
            let expectedValue = {
                drawId: global.settledResults.drawId,
                player: global.settledResults.result.player,
                banker: global.settledResults.result.banker,
                amount: this.options.placeBetAmount,
                winAmount: global.settledResults.winAmount,
            };

            for (const key in expectedValue) {
                await this.game.verifyText(this.options.locators.ticketHistory[key], expectedValue[key]);
            }
            expectedValue["odds"] = global.settledResults.odds[this.options.placeBetChoices[2]];
            await this.game.verifyDateTimeFormat("//tbody/tr[1]/td[1]");
            global.expectedValue = expectedValue;
        });
        test("Verify bet ticket details of manual client seed @A_18 ", async () => {
            //Open History Detail
            await this.game.click(this.options.locators.ticketHistory["drawId"], 1000);
            await this.game.verifyDateTimeFormat("//div[@id='bet-detail']//tbody/tr[1]/td[1]");
            for (const key in global.expectedValue) {
                await this.game.verifyText(this.options.locators.ticketDetail[key], global.expectedValue[key]);
            }
            await this.game.verifyLocatorsVisible([commonControls.icon_Pf_HistoryDetail]);
            await this.game.click(commonControls.icon_Pf_HistoryDetail, 1000);
        });

        test("Verify PF details of manual client seed @A_18", async () => {
            // Verify PF History Detail
            const PFControls = [
                commonControls.txtServerSeed256_Pf_HistoryDetail,
                commonControls.txtServerSeed_Pf_HistoryDetail,
                commonControls.txtMergeClientSeed_Pf_HistoryDetail,
                commonControls.txtCombinedHash_Pf_HistoryDetail,
            ];
            await this.game.verifyLocatorsVisible(PFControls);
            const drawIdTurn = await this.game.getText(commonControls.lbl_Pf_drawIdTurn_HistoryDetail);
            const serverSeed256 = await this.game.page.locator(commonControls.txtServerSeed256_Pf_HistoryDetail).getAttribute("value");
            const serverSeed = await this.game.page.locator(commonControls.txtServerSeed_Pf_HistoryDetail).getAttribute("value");
            const mergeClientSeed = await this.game.page.locator(commonControls.txtMergeClientSeed_Pf_HistoryDetail).getAttribute("value");
            const combinedHash = await this.game.page.locator(commonControls.txtCombinedHash_Pf_HistoryDetail).getAttribute("value");
            const settlePF = global.settledResults.pf;
            expect(drawIdTurn.includes(global.settledResults.turn)).toBe(true);
            expect(serverSeed256).toBe(settlePF.serverSeedHash);
            expect(serverSeed).toBe(settlePF.serverSeed);
            expect(mergeClientSeed).toBe(settlePF.mergeClientSeed);
            expect(combinedHash).toBe(settlePF.finalHash);
        });

        test("Verify user can open PF intro from Pf verification @A_22", async () => {
            await this.game.click(commonControls.icon_Pfverify_PfIntro, 1000);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
            await this.game.click(commonControls.icon_PfIntro_Close, 1000);
        });

        test("Verify user can open PF intro from client seed info @A_23", async () => {
            await this.game.click(commonControls.link_Pfverify_Pfintro, 1000);
            await this.game.click(commonControls.icon_ClientSeed_PfIntro, 1000);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
            await this.game.click(commonControls.icon_PfIntro_Close, 1000);
            await this.game.click(commonControls.iconCloseClientSeed, 1000);

        });

        test("Verify user can open PF intro from verfiy pf @A_24", async () => {
            await this.game.click(commonControls.btn_VerifyPf, 1000);
            await this.game.click(commonControls.icon_VerifyPf_PfIntro, 2000);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
            await this.game.click('div:nth-child(13) > #pf-verify-detail-modal > .modal-container_title__Ut3sm > .icon-close', 1000);
            await this.game.click(commonControls.iconCloseVerifyPf, 1000);

        });

        test("User return main UI of game @A_18", async () => {
            // Verify PF History Detail
            await this.game.click(commonControls.iconClose_Pf_HistoryDetail, 1000);
            await this.game.click(commonControls.iconCloseHistoryDetail, 1000);
            await this.player.gnClosePopUp();
            await this.game.verifyLocatorsVisible(this.options.locators.controlsE2E);
        });

        test("Verify user can open PF intro from PF setting pf @A_25", async () => {
            await this.game.click(commonControls.iconPF, 1000);
            await this.game.click(commonControls.iconPfIntroPfSetting, 2000);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
        });

        test("Verify content of Pf intro @A_26", async () => {
            const pfIntro = await capturePfIntroContent(this.game);
            pfIntro.forEach((content) => {
                expect(content.image).toMatchSnapshot(content.name);
            });
            await this.game.click(commonControls.icon_PfIntro_Close, 1000);
            await this.game.click(commonControls.iconClosePfSetting, 1000);
        });
    }

    
    protected lobbyTests() {
        test("User go to game lobby", async () => {
            await this.game.click(commonControls.iconHome,3000);    
            const lobbyControls = [this.options.locators.lobbyGameIcon,commonControls.lbl_lobby_timmer,
                commonControls.tbl_lobby_statistic,commonControls.img_lobby_gameimg,commonControls.lbl_lobby_currentUsers];    
            await this.game.verifyLocatorsVisible(lobbyControls);     
        });

        test("User can go back to game success", async () => {  
            await this.game.click(this.options.locators.lobbyGameIcon, 3000);
            await this.game.verifyLocatorsVisible(this.options.locators.controlsE2E);
        });
    }

    protected gameGuideTests() {
        test("AND player could open guide and clarify guide content @A_21", async () => {
            // Arrange
            await this.player.gnOpenGuide();
            const getGuideContent = await this.game.getGuideContent();
            const expectedGuideContent1 = this.options.locators.vnguide1.replace(/[\n\r]/g, "").replace(/ /g, "");
            const expectedGuideContent2 = this.options.locators.vnguide2.replace(/[\n\r]/g, "").replace(/ /g, "");
            const cleanedGuideContent = getGuideContent.replace(/[\n\r]/g, "").replace(/ /g, "");
            // Act
            expect(cleanedGuideContent).toContain(expectedGuideContent1);
            expect(cleanedGuideContent).toContain(expectedGuideContent2);
            await this.player.gnClosePopUp();
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
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameUITests();
        this.quickBetTests();
        this.pfSettingTests();
        this.chipTests();
        this.balanceTests();
        this.timerTests();
        this.statisticBoardTests();
        this.placeBetSettle1Tests();
        this.placeBetSettle2Tests();
        this.gameGuideTests();
        this.lobbyTests();
    }
}


const capturePfIntroContent= async (game: BaseGame) => {
    const images = new Array<ImageSnapshot>();
    const guidepages = await game.getCountFrameLocator("//*[@id='container-guide']//div[@class='guide-item']");

    for (let index = 1; index <= guidepages; index++) {
        const filename = `pfIntro-${index}`
        const contentFrame = new BaseElementLocator(filename, `//*[@id='container-guide']//div[@class='guide-item'][${index}]`);
        const contentImage = await contentFrame.snapshot(game.page);
        images.push(contentImage);
    }

    return images; 
}

