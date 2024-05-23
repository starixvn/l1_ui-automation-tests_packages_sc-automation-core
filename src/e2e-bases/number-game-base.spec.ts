import { test, BasePlayer, BaseGame, BaseElementLocator, ImageSnapshot } from "../components";
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
            const isInGame = await this.game.page.locator(commonControls.iconHome).isVisible();
            if (!isInGame) {
                await this.game.click(this.options.locators.lobbyGameIcon, 3000);
                await this.game.page.locator(commonControls.iconHome).waitFor({ state: "visible" });
            }
            await this.game.gnWaitUntilPlaceBet();
            const inGameUi =
                process.env.npm_config_android == "true" ? this.options.locators.inGameUIAndroid : this.options.locators.inGameUI;
            await this.game.verifyImageLocators(inGameUi);
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
            await this.game.click(commonControls.iconPF, 500);
            await this.game.verifyLocatorsVisible(this.options.locators.pfSettingControls);
            await this.game.click(commonControls.iconClosePfSetting);
        });

        test("Verify PF setting after reload page @A_19", async () => {
            // Assert
            await this.game.click(commonControls.iconPF);
            const bfRandom = await this.game.page.locator("#random-seed").isChecked();
            await this.game.page.reload({ waitUntil: "domcontentloaded" });
            await this.game.page.waitForLoadState();
            await this.game.click(commonControls.iconPF, 1000);
            const afRandom = await this.game.page.locator("#random-seed").isChecked();
            expect(bfRandom).toBe(afRandom);
            await this.game.click(commonControls.iconClosePfSetting);
        });

        test("Verify PF setting after go back game from lobby @A_20", async () => {
            // Assert
            await this.game.click(commonControls.iconPF);
            const bfRandom = await this.game.page.locator("#random-seed").isChecked();
            await this.game.click(commonControls.iconClosePfSetting);
            await this.game.click(commonControls.iconHome, 3000);
            await this.game.click(this.options.locators.lobbyGameIcon, 3000);
            await this.game.click(commonControls.iconPF);
            const afRandom = await this.game.page.locator("#random-seed").isChecked();
            expect(bfRandom).toBe(afRandom);
            await this.game.click(commonControls.iconClosePfSetting);
        });
    }

    protected chipTests() {
        test("Verify chip selected when open game @A_8", async () => {
            const chipLocators = this.options.locators.chip;
            for (const key in chipLocators) {
                await expect(this.game.page.locator(key), { message: `Chip ${key} does not match expected snapshot` }).toHaveScreenshot(
                    chipLocators[key],
                    { animations: "disabled" },
                );

                await this.game.click(commonControls.btnChipSliderNext, 500);
            }
            for (let index = 0; index < Object.keys(chipLocators).length; index++) {
                await this.game.click(commonControls.btnChipSliderPre, 300);
            }
        });

        test("Verify betting by each bet chip @A_9", async () => {
            let chipLocators = this.options.locators.chip;
            chipLocators = Object.fromEntries(Object.entries(chipLocators).slice(0, 2));
            const betchoice = this.options.locators.betchoices[this.options.placeBetChoices[0]];
            const ownbet = this.options.locators.betchoices[`${this.options.placeBetChoices[0]}OwnBet`];
            await this.game.gnWaitUntilPlaceBet();
            let amount = 0;

            for (const key in chipLocators) {
                await this.game.click(betchoice, 1000);
                let expectedValue = key.replace("#chip-", "");
                amount += parseInt(expectedValue);
                const betamount = (await this.game.page.$(ownbet)) || null;
                expect(await betamount?.innerHTML()).toBe(amount.toString());
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
            await this.game.gnWaitUntilPlaceBet();
            let bfbalance = await this.game.getText(commonControls.lblBalance);
            const bet = {
                choice: this.options.placeBetChoices[2],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[2]],
            };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            await this.game.click(`#chip-${bet.amount}`);
            await this.game.click(bet.locator, 3000);
            let afbalance = await this.game.getText(commonControls.lblBalance);
            let settledResults = await this.game.gnWaitForSettlement();

            // Assert
            expect(parseInt(bfbalance.replace(",", "")) - bet.amount, { message: `${bfbalance} and ${afbalance}` }).toBe(
                parseInt(afbalance.replace(",", "")),
            );
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
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
            expect(parseInt(bfbalance.replace(",", "")) - amount * 2, { message: `${bfbalance} and ${afbalance}` }).toBe(
                parseInt(afbalance.replace(",", "")),
            );
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
        });
    }

    protected suggestionBets() {
        test("Verify sugestionBets on each choice", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);

            for (const key in this.options.locators.suggestionBets) {
                await this.game.gnWaitUntilPlaceBet();

                const bet = {
                    choice: key,
                    amount: this.options.placeBetAmount,
                    locator: this.options.locators.betchoices[key],
                };
                await this.game.click(`#chip-${bet.amount}`, 200);
                await this.game.click(bet.locator, 200);
                await this.game.page.locator(commonControls.btnChipSliderNext).click({ clickCount: 10, delay: 100 });
                await this.game.click(bet.locator, 200);
                await this.game.waitForTimeout(1000);
                await expect(this.game.page.locator(commonControls.dialog_confirm_submit), {
                    message: `suggestion bet of ${bet.choice} is not correct`,
                }).toContainText(this.options.locators.suggestionBets[key].toString());
                await this.game.click(commonControls.btn_no_submit_dialog);
                await this.game.page.locator(commonControls.btnChipSliderPre).click({ clickCount: 10, delay: 100 });
            }
            await this.game.gnWaitForSettlement();
        });
    }

    protected timerTests() {
        test("Verify time and msg of bet round @A_12", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
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
                } else if (index === 2 || index === 7 || index === this.options.gameConfiguration.durations.placingBets - 1) {
                    await this.game.click(bet.locator, 0);
                    await this.game.textLocatorShouldBe(commonControls.lblTimerMsg, this.options.locators.placeBetMsg.spb);
                }
                await this.game.waitForTimeout(1000);
            }
            for (let index = 1; index <= this.options.gameConfiguration.durations.lockingBet; index++) {
                await this.game.textLocatorShouldBe(commonControls.lblTimerMsg, this.options.locators.placeBetMsg.epb);
                if (index === 2) {
                    await this.game.click(bet.locator, 0);
                }
                await this.game.waitForTimeout(1000);
            }
            await this.game.waitForTimeout(1000);
            await this.game.textLocatorShouldBe(commonControls.lblTimerMsg, this.options.locators.placeBetMsg.orb);

            // Assert
            await this.game.waitForTimeout(this.options.gameConfiguration.durations.shakeThePlateDuration);
            await this.player.gnOpenHistory();
            await this.game.textLocatorShouldBe(this.options.locators.ticketHistory["amount"], String(bet.amount * 3));
            await this.player.gnClosePopUp();
        });
    }

    protected statisticBoardTests() {
        test("Verify Statistic bar icon @A_14", async () => {
            // Arrange
            const statisticbar =
                process.env.npm_config_android == "true" ? this.options.locators.statisticbarAndroid : this.options.locators.statisticbar;
            await this.game.verifyImageLocators(statisticbar);
        });

        test("Verify user can slide left/right to switch road @A_15", async () => {
            // Arrange
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
            expect(totalcellBIR, { message: `totalcellBIR ${totalcellBIR}` }).toBe(108);
            expect(totalcellBER, { message: `totalcellBER ${totalcellBER}` }).toBe(108);
        });

        test("Verify statistic result data of the latest 108 rounds @A_16", async () => {
            // Arrange
            await this.game.gnWaitUntilPlaceBet();
            await this.game.waitForTimeout(3000);

            for (const key in this.options.locators.statisticItems) {
                let totalVal = await this.game.page.locator(key).count();
                totalVal = parseInt(((totalVal / 108) * 100).toFixed(0));
                await this.game.textLocatorShouldBe(this.options.locators.statisticItems[key], totalVal + "%");
            }
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
            let settledResults = await this.game.gnWaitForSettlement();
            if (this.options.gameConfiguration.isDraw) {
                let turn = await this.game.getText(commonControls.lblTurn);
                const match = turn.match(/\d+/);
                turn = match ? match[0] : "";
                settledResults.turn = turn;
            }
            delete settledResults.result.time;
            delete settledResults.result.drawId;
            settledResults.odds = placeBetResponse.odds;
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
                amount: this.options.placeBetAmount,
                winAmount: global.settledResults.winAmount,
            };

            for (const key in expectedValue) {
                await this.game.textLocatorShouldBe(this.options.locators.ticketHistory[key], expectedValue[key]);
            }

            for (const key in global.settledResults.result) {
                if (this.options.gameConfiguration.isDraw) {
                    await this.game.textLocatorShouldBe(this.options.locators.ticketHistory[key], global.settledResults.result[key]);
                } else {
                    const locator = this.options.locators.ticketHistory[key];
                    const expectedValue = global.settledResults.result[key].join("").replace(/,/g, "");
                    await expect(this.game.page.locator(locator), { message: `${locator} does not have text ${expectedValue}` }).toHaveText(
                        expectedValue,
                    );
                }
            }

            expectedValue["odds"] = global.settledResults.odds[this.options.placeBetChoices[2]];
            await this.game.verifyDateTimeFormat("//tbody/tr[1]/td[1]");
            global.expectedValue = expectedValue;
        });
        test("Verify bet ticket details of random client seed @A_13", async () => {
            //Open History Detail
            await this.game.click(this.options.locators.ticketHistory["drawId"]);
            await this.game.verifyDateTimeFormat("//div[@id='bet-detail']//tbody/tr[1]/td[1]");
            for (const key in global.expectedValue) {
                await this.game.textLocatorShouldBe(this.options.locators.ticketDetail[key], global.expectedValue[key]);
            }
            await this.game.verifyLocatorsVisible([commonControls.icon_Pf_HistoryDetail]);
            await this.game.click(commonControls.icon_Pf_HistoryDetail);
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
            const serverSeed256 = await this.game.page.locator(commonControls.txtServerSeed256_Pf_HistoryDetail).getAttribute("value");
            const serverSeed = await this.game.page.locator(commonControls.txtServerSeed_Pf_HistoryDetail).getAttribute("value");
            const mergeClientSeed = await this.game.page.locator(commonControls.txtMergeClientSeed_Pf_HistoryDetail).getAttribute("value");
            const combinedHash = await this.game.page.locator(commonControls.txtCombinedHash_Pf_HistoryDetail).getAttribute("value");
            const settlePF = global.settledResults.pf;
            if (this.options.gameConfiguration.isDraw) {
                const drawIdTurn = await this.game.getText(commonControls.lbl_Pf_drawIdTurn_HistoryDetail);
                expect(drawIdTurn.includes(global.settledResults.turn)).toBe(true);
            }
            expect(serverSeed256).toBe(settlePF.serverSeedHash);
            expect(serverSeed).toBe(settlePF.serverSeed);
            expect(mergeClientSeed).toBe(settlePF.mergeClientSeed);
            expect(combinedHash).toBe(settlePF.finalHash);
        });

        test("User return main UI of game @A_17", async () => {
            // Verify PF History Detail
            await this.game.click(commonControls.iconClose_Pf_HistoryDetail);
            await this.game.click(commonControls.iconCloseHistoryDetail);
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
            const endBets = await this.game.waitForEndBet();
            let settledResults = await this.game.gnWaitForSettlement();
            if (this.options.gameConfiguration.isDraw) {
                let turn = await this.game.getText(commonControls.lblTurn);
                const match = turn.match(/\d+/);
                turn = match ? match[0] : "";
                settledResults.turn = turn;
            }
            delete settledResults.result.time;
            delete settledResults.result.drawId;
            settledResults.odds = odds;
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
                amount: this.options.placeBetAmount,
                winAmount: global.settledResults.winAmount,
            };

            for (const key in expectedValue) {
                await this.game.textLocatorShouldBe(this.options.locators.ticketHistory[key], expectedValue[key]);
            }

            for (const key in global.settledResults.result) {
                if (this.options.gameConfiguration.isDraw) {
                    await this.game.textLocatorShouldBe(this.options.locators.ticketHistory[key], global.settledResults.result[key]);
                } else {
                    const locator = this.options.locators.ticketHistory[key];
                    const expectedValue = global.settledResults.result[key].join("").replace(/,/g, "");
                    await expect(this.game.page.locator(locator), { message: `${locator} does not have text ${expectedValue}` }).toHaveText(
                        expectedValue,
                    );
                }
            }

            expectedValue["odds"] = global.settledResults.odds[this.options.placeBetChoices[2]];
            await this.game.verifyDateTimeFormat("//tbody/tr[1]/td[1]");
            global.expectedValue = expectedValue;
        });
        test("Verify bet ticket details of manual client seed @A_18 ", async () => {
            //Open History Detail
            await this.game.click(this.options.locators.ticketHistory["drawId"]);
            await this.game.verifyDateTimeFormat("//div[@id='bet-detail']//tbody/tr[1]/td[1]");
            for (const key in global.expectedValue) {
                await this.game.textLocatorShouldBe(this.options.locators.ticketDetail[key], global.expectedValue[key]);
            }
            await this.game.verifyLocatorsVisible([commonControls.icon_Pf_HistoryDetail]);
            await this.game.click(commonControls.icon_Pf_HistoryDetail);
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
            const serverSeed256 = await this.game.page.locator(commonControls.txtServerSeed256_Pf_HistoryDetail).getAttribute("value");
            const serverSeed = await this.game.page.locator(commonControls.txtServerSeed_Pf_HistoryDetail).getAttribute("value");
            const mergeClientSeed = await this.game.page.locator(commonControls.txtMergeClientSeed_Pf_HistoryDetail).getAttribute("value");
            const combinedHash = await this.game.page.locator(commonControls.txtCombinedHash_Pf_HistoryDetail).getAttribute("value");
            const settlePF = global.settledResults.pf;
            if (this.options.gameConfiguration.isDraw) {
                const drawIdTurn = await this.game.getText(commonControls.lbl_Pf_drawIdTurn_HistoryDetail);
                expect(drawIdTurn.includes(global.settledResults.turn)).toBe(true);
            }
            expect(serverSeed256).toBe(settlePF.serverSeedHash);
            expect(serverSeed).toBe(settlePF.serverSeed);
            expect(mergeClientSeed).toBe(settlePF.mergeClientSeed);
            expect(combinedHash).toBe(settlePF.finalHash);
        });

        test("Verify user can open PF intro from Pf verification @A_22", async () => {
            await this.game.click(commonControls.icon_Pfverify_PfIntro);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
            await this.game.click(commonControls.icon_PfIntro_Close);
        });

        test("Verify user can open PF intro from client seed info @A_23", async () => {
            await this.game.click(commonControls.link_Pfverify_Pfintro);
            await this.game.click(commonControls.icon_ClientSeed_PfIntro);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
            await this.game.click(commonControls.icon_PfIntro_Close);
            await this.game.click(commonControls.iconCloseClientSeed);
        });

        test("Verify user can open PF intro from verfiy pf @A_24", async () => {
            await this.game.click(commonControls.btn_VerifyPf);
            await this.game.click(commonControls.icon_VerifyPf_PfIntro, 2000);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
            await this.game.click(commonControls.icon_PfIntro_Close);
            await this.game.click(commonControls.iconCloseVerifyPf);
        });

        test("User return main UI of game @A_18", async () => {
            // Verify PF History Detail
            await this.game.click(commonControls.iconClose_Pf_HistoryDetail);
            await this.game.click(commonControls.iconCloseHistoryDetail);
            await this.player.gnClosePopUp();
            await this.game.verifyLocatorsVisible(this.options.locators.controlsE2E);
        });

        test("Verify user can open PF intro from PF setting pf @A_25", async () => {
            await this.game.click(commonControls.iconPF);
            await this.game.click(commonControls.iconPfIntroPfSetting, 2000);
            await this.game.verifyLocatorsVisible([commonControls.lbl_PfIntro_title]);
        });

        test("Verify content of Pf intro @A_26", async () => {
            const pfIntro = await capturePfIntroContent(this.game);
            pfIntro.forEach((content) => {
                expect(content.image).toMatchSnapshot(content.name);
            });
            await this.game.click(commonControls.icon_PfIntro_Close);
            await this.game.click(commonControls.iconClosePfSetting);
        });
    }

    protected lobbyTests() {
        test("User go to game lobby @A_27", async () => {
            await this.game.click(commonControls.iconHome,2000);
            const lobbyControls = [
                this.options.locators.lobbyGameIcon,
                this.options.locators.lobbyTimmer,
                this.options.locators.lobbyStatistic,
            ];
            await this.game.verifyLocatorsVisible(lobbyControls);
        });

        test("Verify setting controls @A_27", async () => {
            await this.game.click(commonControls.btn_lobby_setting);
            const settingControls = [commonControls.chk_lobby_music, commonControls.chk_lobby_sound];
            await this.game.verifyLocatorsVisible(settingControls);
            await this.game.click(commonControls.icon_lobby_close);
        });

        test("User can change their's avatar @A_27", async () => {
            const randomInterval = Math.floor(Math.random() * 14) + 2;
            const indexAvatar = [`//img[contains(@src,'F${randomInterval}.jpg')]/parent::div`];
            const avatar = [`//div[contains(@class,'user-info_avatar')]/img[contains(@src,'F${randomInterval}.jpg')]`];

            for (const iterator of indexAvatar) {
                await this.game.click(commonControls.imgAvatar);
                await this.game.click(iterator);
                await this.game.click("//button[@class='btn-green']");
            }
            await this.game.verifyLocatorsVisible(avatar);
        });

        test("User can go back to game success @A_27", async () => {
            await this.game.click(this.options.locators.lobbyGameIcon);
            await this.game.verifyLocatorsVisible(this.options.locators.controlsE2E);
        });

        test("User can switch game by clicking on right navigator @A_27", async () => {
            for (const iterator of this.options.locators.slideGameList) {
                await this.game.textLocatorShouldBe(commonControls.imgGameName, iterator);
                await this.game.click(commonControls.btn_dashboard_next, 3000);
            }
            await this.game.click(commonControls.btn_dashboard_pre, 3000);
        });
        test("User can switch game by clicking on left navigator @A_27", async () => {
            const revertGameList = this.options.locators.slideGameList.reverse();
            for (const iterator of revertGameList) {
                await this.game.textLocatorShouldBe(commonControls.imgGameName, iterator);
                await this.game.click(commonControls.btn_dashboard_pre, 3000);
            }
        });
    }

    protected lobbyAndroidTests() {
        test("User go to game lobby @A_27", async () => {
            await this.game.click(commonControls.iconHome);
            const lobbyControls = [
                this.options.locators.lobbyGameIcon,
                this.options.locators.lobbyTimmer,
                this.options.locators.lobbyStatistic,
            ];
            await this.game.verifyLocatorsVisible(lobbyControls);
        });

        test("Verify setting controls @A_27", async () => {
            await this.game.click(commonControls.btn_lobby_setting);
            const settingControls = [commonControls.chk_lobby_music, commonControls.chk_lobby_sound];
            await this.game.verifyLocatorsVisible(settingControls);
            await this.game.click(commonControls.icon_lobby_close);
        });

        test("User can change their's avatar @A_27", async () => {
            const randomInterval = Math.floor(Math.random() * 14) + 2;
            const indexAvatar = [`//img[contains(@src,'F${randomInterval}.jpg')]/parent::div`];
            const avatar = [`//div[contains(@class,'user-info_avatar')]/img[contains(@src,'F${randomInterval}.jpg')]`];

            for (const iterator of indexAvatar) {
                await this.game.click(commonControls.imgAvatar);
                await this.game.click(iterator);
                await this.game.click("//button[@class='btn-green']");
            }
            await this.game.verifyLocatorsVisible(avatar);
        });

        test("User can go back to game success @A_27", async () => {
            await this.game.click(this.options.locators.lobbyGameIcon);
            await this.game.verifyLocatorsVisible(this.options.locators.controlsE2E);
        });

        test("User can switch game by swipe right navigator @A_27", async () => {
            const deviceScreenResolution = await this.game.page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            });
            const centerPos = { x: deviceScreenResolution.width / 2, y: deviceScreenResolution.height / 2 };
            const toRight = { x: deviceScreenResolution.width - 5, y: centerPos.y };
            for (const iterator of this.options.locators.slideGameList) {
                await this.game.swipePos(centerPos, toRight);
                await this.game.textLocatorShouldBe(commonControls.imgGameName, iterator);
            }
        });
        test("User can switch game by swipe left navigator @A_27", async () => {
            const deviceScreenResolution = await this.game.page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            });
            const centerPos = { x: deviceScreenResolution.width / 2, y: deviceScreenResolution.height / 2 };
            const toLeft = { x: 5, y: centerPos.y };
            const revertGameList = this.options.locators.slideGameList.reverse();
            for (const iterator of revertGameList) {
                await this.game.swipePos(centerPos, toLeft);
                await this.game.textLocatorShouldBe(commonControls.imgGameName, iterator);
            }
        });

        test("User can switch game by swipe up navigator @A_27", async () => {
            const deviceScreenResolution = await this.game.page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            });
            const centerPos = { x: deviceScreenResolution.width / 2, y: deviceScreenResolution.height / 2 };
            const toUp = { x: centerPos.x, y: 5 };
            for (const iterator of this.options.locators.slideGameList) {
                await this.game.swipePos(centerPos, toUp);
                await this.game.textLocatorShouldBe(commonControls.imgGameName, iterator);
            }
        });

        test("User can switch game by swipe down navigator @A_27", async () => {
            const deviceScreenResolution = await this.game.page.evaluate(() => {
                return {
                    width: window.innerWidth,
                    height: window.innerHeight,
                };
            });
            const centerPos = { x: deviceScreenResolution.width / 2, y: deviceScreenResolution.height / 2 };
            const toDown = { x: centerPos.x, y: deviceScreenResolution.height - 5 };
            const revertGameList = this.options.locators.slideGameList.reverse();
            for (const iterator of revertGameList) {
                await this.game.swipePos(centerPos, toDown);
                await this.game.textLocatorShouldBe(commonControls.imgGameName, iterator);
            }
        });
    }
    protected gameGuideTests() {
        test("AND player could open guide and clarify guide content @A_21", async () => {
            // Arrange
            await this.player.gnOpenGuide();
            const getGuideContent = await this.game.getGuideContent();
            const expectedGuideContent1 = this.options.locators.vnguide1.replace(/\s/g, '');
            const expectedGuideContent2 = this.options.locators.vnguide2.replace(/\s/g, '');
            const cleanedGuideContent = getGuideContent.replace(/\s/g, '');
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
        this.pfSettingTests();
        this.chipTests();
        this.suggestionBets();
        this.balanceTests();
        this.timerTests();
        this.placeBetSettle1Tests();
        this.placeBetSettle2Tests();
        this.statisticBoardTests();
        this.gameGuideTests();
        if (process.env.npm_config_android) {
            this.lobbyAndroidTests();
        } else {
            this.lobbyTests();
        }
    }
}

const capturePfIntroContent = async (game: BaseGame) => {
    const images = new Array<ImageSnapshot>();
    await game.page.frameLocator("iframe").locator("#container-guide").waitFor({ state: "visible" });
    const guidepages = await game.getCountFrameLocator("//*[@id='container-guide']//div[@class='guide-item']");

    for (let index = 1; index <= guidepages; index++) {
        const filename = process.env.npm_config_android == "true" ? `pfIntroAndroid-${index}` : `pfIntro-${index}`;
        await game.page.frameLocator("iframe").locator(`//*[@id='container-guide']//div[@class='guide-item'][${index}]`).focus();
        const contentFrame = new BaseElementLocator(filename, `//*[@id='container-guide']//div[@class='guide-item'][${index}]`);
        const contentImage = await contentFrame.snapshot(game.page);
        images.push(contentImage);
    }

    return images;
};
