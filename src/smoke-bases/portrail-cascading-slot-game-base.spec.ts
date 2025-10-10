import { test, BasePlayer, BaseGame } from "../components";
import { IBaseOptions } from "./base-options";
import { Portrail_Cascading_Locators } from "../components/base-cocos-game-locator";
import { expect } from "../expects";
import { GameEvent } from "../_shared";
import { GameGuides } from "../game-components/guides/guides.spec";

export interface SlotGameOptions extends IBaseOptions {
    placeBetAmount?: number;
}

export class PortrailCascadingGameBase {
    game: BaseGame;
    player: BasePlayer;
    settledResults: any;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: SlotGameOptions) {}

    private overrideClickOutSide() {
        // Override the method globally for this project
        this.game.clickOutSide = async () => {
            await this.game.page.mouse.click(470, 10);
        };
    }

    private overrideopenGuide() {
        // Override the method globally for this project
        this.game.openGuide = async () => {
            await this.game.page.waitForTimeout(1000);
            await this.game.clickCocos(Portrail_Cascading_Locators.btnguide);
            await this.game.page.waitForTimeout(10000);
        };
    }

    protected mainUITests() {

        test("Verify welcome screen and Play Now button exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnPlayNow), "Play Now button not found").toBe(true);
        });

        test("Verify User can click Play Now button and navigate to game", async () => {
            const operatorName = (process.env.npm_config_project?.includes("l1")) ? "SABA.games" : "Vgaming.games";
            await this.clickPlayNowButton();
            await this.game.waitForTimeout(5000);
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnSpin), "Spin button not found").toBe(true);
            expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtOperator)).toBe(operatorName);
        });

        test("Verify center message exists", async () => {
            const centerMessages = [
                "Bấm Quay hoặc giữ phím Space",
                "Hệ Số Nhân tăng dần trong Free Spin",
                "Thắng lên đến 2000x tiền cược",
                "Quay trúng",
                "Hệ Số Nhân ngẫu nhiên lên đến 500x",
                "Biểu tượng được tính thắng nằm ở vị trí bất kỳ"
            ];
         
            const actualMessage = await this.game.findLabelText(Portrail_Cascading_Locators.txtMessageCenter);
            expect(centerMessages).toContain(actualMessage.trim());
        });

        test("Verify button increase/decrease bet amount exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnBetIncrease), "Bet increase button not found").toBe(true);
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnBetDecrease), "Bet decrease button not found").toBe(true);
        });

        test("Verify button auto spin exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnAutoSpin), "Auto spin button not found").toBe(true);
        });

        test("Verify button turbo mode exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnTurbo), "Turbo button not found").toBe(true);
        });

        test("Verify button bet amount setting exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.betAmountSetting), "Bet amount setting button not found").toBe(true);
        });

        test("Verify button menu exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnMenu), "Menu button not found").toBe(true);
        });

        test("Verify button game guide exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnguide), "Game guide button not found").toBe(true);
        });

        test("Verify all menu items exists", async () => {
            await this.game.clickCocos(Portrail_Cascading_Locators.btnMenu);
            await this.game.waitForTimeout(2000);
                expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnLobby), "Lobby button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnMusic), "Music button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnSound), "Sound button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.btnHistory), "History button not found").toBe(true);
            await this.game.clickCocos(Portrail_Cascading_Locators.btnMenu);
            await this.game.waitForTimeout(2000);
        });


    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.iconTurboOFF), "Turbo OFF icon not found").toBe(true);

        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
                await this.game.clickCocos(Portrail_Cascading_Locators.btnTurbo);
                expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.iconTurboON), "Turbo ON icon not found").toBe(true);

        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Turbo OFF
            await this.game.clickCocos(Portrail_Cascading_Locators.btnTurbo);
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.iconTurboOFF), "Turbo OFF icon not found").toBe(true);
        });
    }


    protected placeBetAndSettleTests() {
        test("Verify that player be able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betlevel = this.game.gameConfigs.betLevels[0];
            const coinvalue = this.game.gameConfigs.coinValues[1]; // Try index 0 for 0.05
            
            // Debug: Log coinValues array structure
            console.log("coinValues array:", this.game.gameConfigs.coinValues);
            console.log("Selected coinvalue at index 1:", coinvalue);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            await this.game.clickCocos(Portrail_Cascading_Locators.btnTurbo);
            await this.setBetConfiguration(this.game, betlevel, coinvalue);
            const totalBet = await this.game.findLabelText(Portrail_Cascading_Locators.txtbottomTotalBet);
            await this.clickSpinButton();

            await test.step("Get bet result", async () => {
                this.settledResults = await waitForSettlementCascadingSlot(this.game);
            });

            if (this.settledResults.isbigWin) {
                console.log("click bigwwin", this.settledResults.isbigWin);
                await this.game.waitForTimeout(10000);
                await this.game.clickOutSide();
            }
            await this.game.waitForTimeout((this.settledResults.tumble+1) * 3000); //wait for tumbling of the last spin

            this.settledResults.totalBet = totalBet;
            this.settledResults.betlevel = betlevel;
            this.settledResults.coinvalue = coinvalue;

            console.log(this.settledResults);

        });

        test("Verify total win result", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(5000);// wait for animation
            if(this.settledResults.win > 0) {
                expect(Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtcenterWin))).toBe(Number(this.settledResults.win));
                expect(Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtbottomWin))).toBe(Number(this.settledResults.win));
            } else {
                expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtbottomWin)).toBe("0");
            }
        });

        test("Verify bet ticket in history popup", async () => {
            await this.openHistoryPopup();

            expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryTotalBet)).toBe(this.settledResults.totalBet.toString());
            expect(Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryWin))).toBe(Number(this.settledResults.win));
        });

        test("Verify bet ticket detail data in history popup", async () => {
            await this.game.page.mouse.click(600, 127);
            // await this.game.clickCocosByLabel(this.settledResults.roundId.toString());
            await this.game.waitForTimeout(2000);

            expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryDetailRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryDetailBetLevel)).toBe(this.settledResults.betlevel.toString());
            expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryDetailBetCoinValue)).toBe(this.settledResults.coinvalue.toString());
            expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryDetailTotalBet)).toBe(this.settledResults.totalBet.toString());
            expect(Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryDetailWin))).toBe(Number(this.settledResults.win));
                if(this.settledResults.multiplier > 0) {
                expect(await this.game.findLabelText(Portrail_Cascading_Locators.txtHistoryDetailMultiplier)).toBe(this.settledResults.multiplier.toString());
            }
        });

        test("Verify user can close history popup", async () => {
            await this.game.clickCocos(Portrail_Cascading_Locators.btnBackHistory);
            await this.game.waitForTimeout(2000);
            await this.game.clickCocos(Portrail_Cascading_Locators.btnClosePopup);
            await this.game.waitForTimeout(2000);
            expect(await this.game.isCocosLocatorExists(Portrail_Cascading_Locators.txtHistoryRoundId), "History round ID should not be visible after closing popup").toBe(false);
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
            locators: [this.options.locators],
        });

        test.describe.serial(`${this.options.gameConfiguration.name} E2E Testing`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.gameGuides.init(this.game);

                // Override clickOutSide method globally for this project
                this.overrideClickOutSide();
                this.overrideopenGuide();
            });

            this.runScenario();
        });
    }

    async clickSpinButton() {
        await this.game.page.mouse.click(640, 570);
    }

    async clickPlayNowButton() {
        await this.game.page.mouse.click(640, 615);
        await this.game.waitForTimeout(2000);
    }
    
    async openAutoSpinPopup() {
        await this.game.clickCocos(Portrail_Cascading_Locators.btnAutoSpin);
        await this.game.waitForTimeout(2000);
    }

    async openHistoryPopup() {
        await this.game.clickCocos(Portrail_Cascading_Locators.btnMenu);
        await this.game.waitForTimeout(1000);
        await this.game.clickCocos(Portrail_Cascading_Locators.btnHistory);
        await this.game.waitForTimeout(2000);
    }

    protected runScenario() {
        this.mainUITests();
        this.placeBetAndSettleTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);

    }

    async setBetConfiguration(game: BaseGame, betlevel: number, coinvalue: number) {
        await this.game.clickCocos(Portrail_Cascading_Locators.betAmountSetting);
        
        // Adjust Bet Level
        let currentBetLevel = Number(await game.findLabelText(Portrail_Cascading_Locators.txtBetLevelValue));
        
        while (currentBetLevel !== betlevel) {
            if (currentBetLevel < betlevel) {
                await game.clickCocos(Portrail_Cascading_Locators.btnBetLevelIncrease);
            } else {
                await game.clickCocos(Portrail_Cascading_Locators.btnBetLevelDecrease);
            }
            await game.waitForTimeout(500);
            currentBetLevel = Number(await game.findLabelText(Portrail_Cascading_Locators.txtBetLevelValue));
        }
        
        // Adjust Coin Value
        let currentCoinValue = Number(await game.findLabelText(Portrail_Cascading_Locators.txtCoinValue));
        
        while (currentCoinValue !== coinvalue) {
            if (currentCoinValue < coinvalue) {
                await game.clickCocos(Portrail_Cascading_Locators.btnCoinValueIncrease);
            } else {
                await game.clickCocos(Portrail_Cascading_Locators.btnCoinValueDecrease);
            }
            await game.waitForTimeout(500);
            currentCoinValue = Number(await game.findLabelText(Portrail_Cascading_Locators.txtCoinValue));
        }
        
        await this.game.clickCocos(Portrail_Cascading_Locators.iconCloseMainPopup);
        await game.waitForTimeout(1000);
    }
}


const waitForSettlementCascadingSlot = async (game: BaseGame): Promise<any> => {
    const message = await game.waitForEvent(GameEvent.Settlement);
    await game.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement

    let settledResults = {
        isbigWin: message?.finish?.bigWin ?? "",
        reachMaxWin: message?.finish?.reachMaxWin ?? "",
        totalFreeSpins: message?.finish?.totalFreeSpins ?? "",
        totalMultiplier: message?.finish?.totalMultiplier ?? "",
        win: message?.finish?.win ?? "",
        tumble: message.finish.tumbles.length,
        roundId: message?.finish?.roundId ?? "",
        result: message?.finish?.result ?? "",
    };

    return settledResults;
};
