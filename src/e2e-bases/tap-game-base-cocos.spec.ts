import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptionsCocos } from "./base-options";
import { performanceTest } from "../game-components/performance/performance";
import { GameGuides } from "../game-components/guides/guides.spec";
import { TapGame_Locators } from "../components/base-cocos-game-locator";



const projectName = process.env.npm_config_project?.includes("l1")
    ? "SG"
    : process.env.npm_config_project?.includes("l2")
      ? "VG"
      : process.env.npm_config_project;

export class TapGameBaseCocos {
    protected game: BaseGame;
    protected player: BasePlayer;
    performanceTest: performanceTest = new performanceTest();
    protected gameGuides: GameGuides = new GameGuides();
    settledResults: any;

    constructor(protected options: IBaseOptionsCocos) {}

    private get locators() {
        return this.options.locators || TapGame_Locators
    }


    protected inGameUITests() {
        test("Verify User Can Find All UI Elements", async () => {
            await test.step("Verify User Can Find All UI Elements", async () => {
                // Get list of locators to verify, default to lblRoundId if not specified
            const locatorsToVerify = this.options.uiLocatorsToVerify ?? {lblRoundId: "Phien"};
                
                for (const [locatorKey, locatorValue] of Object.entries(locatorsToVerify)) {
                    expect(
                        await this.game.isCocosLocatorExists(locatorValue),
                        `${locatorKey} not found`
                    ).toBe(true);
                }
            });
        });
    }

    

    protected AutoPlay() {

        test("Verify user can open Auto Play Bet Setting Popup", async () => {
            await this.game.clickCocos(this.locators.btnAutoPlay, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.btnStartAutoPlay)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.btnIncreaseStep)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.btnDecreaseStep)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.lblAutoPlayMultiplier)).toBe(true);
        });

        test("Verify user can increase step in Auto Play Bet Setting Popup", async () => {
            let numStep, multiplier = '';
            for (let i = 1; i < 24; i++) {
                numStep = await this.game.findLabelText(this.locators.txtNumStepAutoPlay);
                multiplier = await this.game.findLabelText(this.locators.lblAutoPlayMultiplier);
                await this.game.clickCocos(this.locators.btnIncreaseStep, 100);
                expect(await this.game.findLabelText(this.locators.txtNumStepAutoPlay)).toBe((Number(numStep) + 1).toString());
                expect(await this.game.findLabelText(this.locators.lblAutoPlayMultiplier)).not.toBe(multiplier.toString());
            }
        });

        test("Verify user can decrease step in Auto Play Bet Setting Popup", async () => {
            let numStep, multiplier = '';
            for (let i = 1; i < 24; i++) {
                numStep = await this.game.findLabelText(this.locators.txtNumStepAutoPlay);
                multiplier = await this.game.findLabelText(this.locators.lblAutoPlayMultiplier);
                await this.game.clickCocos(this.locators.btnDecreaseStep, 100);
                expect(await this.game.findLabelText(this.locators.txtNumStepAutoPlay)).toBe((Number(numStep) - 1).toString());
                expect(await this.game.findLabelText(this.locators.lblAutoPlayMultiplier)).not.toBe(multiplier.toString());
            }
        });

        

        test("Verify user can auto play bet with configured step", async () => {
            const totalAutoPlay = 10, step = 2;
            await this.setAutoPlayBet(totalAutoPlay, step);
            await this.game.clickCocos(this.locators.btnStartAutoPlay,1000);
            for (let i = 1; i < totalAutoPlay; i++) {
                let countDown = await this.game.findLabelText(this.locators.lblCountDownAutoPlay);
                await this.waitForSettlement();
                expect(Number(await this.game.findLabelText(this.locators.lblCountDownAutoPlay))).toBe(Number(countDown) - 1);
            }
        });

        test("Verify auto play popup appears", async () => {
            await this.game.waitForTimeout(5000);
            expect(await this.game.isCocosLocatorExists(this.locators.btnStartAutoPlay)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.btnIncreaseStep)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.btnDecreaseStep)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.lblAutoPlayMultiplier)).toBe(true);
            await this.game.clickCocos(this.locators.btnCloseAutoPlay,1000);
        });

    }

    protected PlaceBetMode() {

        test("Verify user can place bet in medium mode", async () => {
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.game.clickCocos(this.locators.btnGameMode, 1000);
            await this.game.clickCocos(this.locators.lblMediummode, 1000);
            await this.game.clickCocos(this.locators.btnPlay, 2000);
            await this.game.clickCocos(this.locators.btnCashOut, 1000);
            const settlement = await this.waitForWinStatus();
            console.log(settlement);
            await this.game.waitForTimeout(5000);

        });

        test("Verify user can place bet in hard mode", async () => {
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.game.clickCocos(this.locators.btnGameMode, 1000);
            await this.game.clickCocos(this.locators.btnPlay, 2000);
            await this.game.clickCocos(this.locators.btnCashOut, 1000);
            const settlement = await this.waitForWinStatus();
            console.log(settlement);
            await this.game.waitForTimeout(5000);

        });

        test("Verify user can place bet in hardcore mode", async () => {
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.game.clickCocos(this.locators.btnGameMode, 1000);
            await this.game.clickCocos(this.locators.lblHardcoremode, 1000);
            await this.game.clickCocos(this.locators.btnPlay, 2000);
            await this.game.clickCocos(this.locators.btnCashOut, 1000);
            const settlement = await this.waitForWinStatus();
            console.log(settlement);
            await this.game.waitForTimeout(5000);

        });

        test("Verify user can place bet in easy mode", async () => {
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.game.clickCocos(this.locators.btnGameMode, 1000);
            await this.game.clickCocos(this.locators.lblMediummode, 1000);
            await this.game.clickCocos(this.locators.btnPlay, 2000);
            await this.game.clickCocos(this.locators.btnCashOut, 1000);
            const settlement = await this.waitForWinStatus();
            console.log(settlement);
            await this.game.waitForTimeout(5000);
        });

    }

    protected placeBetAndSettleTests() {

        test("Verify user can setting client seed in PF popup", async () => {
            await this.game.clickCocos(this.locators.btnPfSetting, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.iconPFGuideSetting)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.btnCopyServerSeed)).toBe(true);
            await this.game.clickCocos(this.locators.ckbRandomSeed, 1000);
            const randomSeed = await this.game.findLabelText(this.locators.txtRandomSeed);
            this.settledResults.clientSeed = randomSeed;
        });

        test("Test complete bet lifecycle: placement → settlement → validation", async (    ) => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
            const amount = this.game.gameConfigs.chips[0]
            const bet = { 
                totalTaps:  this.options.totalTaps ?? 1,
                amountLocator: this.locators.pathBetChip + amount,
                amount: amount
            };
            await test.step("Verify that the bet is successfully placed", async () => {
                // Act - Place bet with retry until success
                const {winStatus, recentBet, roundId} = await this.player.placeBetTapGame( this.locators, bet.amountLocator??'', bet.totalTaps);
                this.settledResults.winStatus = winStatus.status.win;
                this.settledResults.totalWin = winStatus.status.win ? winStatus.status.bet : 0;
                this.settledResults.multiplier = winStatus.status.win ? recentBet.recentBet.multiplier : '-';
                this.settledResults.amount = amount;
                this.settledResults.roundId = roundId;
            });
            expect(bet.amount).toBe(this.settledResults.amount.toString());
        });

        
        test("Verify bet ticket in history popup", async () => {
            await this.openHistoryPopup();
            expect(await this.game.findLabelText(this.locators.txtHistoryRound+`/${this.settledResults.roundId}/node/round/lblRound`)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.txtHistoryRound+`/${this.settledResults.roundId}/node/lblTotalStake`)).toBe(this.settledResults.amount.toString());
            expect(await this.game.findLabelText(this.locators.txtHistoryRound+`/${this.settledResults.roundId}/node/lblWin`)).toBe(this.settledResults.totalWin.toString());
        });

        test("Verify bet ticket detail data in history popup", async () => {
            await this.game.clickCocos(this.locators.txtHistoryRound + `/${this.settledResults.roundId}/node/round`, 1000);
            expect(await this.game.findLabelText(this.locators.lblHistoryDetailRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.lblHistoryDetailMultiplier)).toContain(this.settledResults.multiplier.toString());
            expect(await this.game.findLabelText(this.locators.lblHistoryDetailTotalBet)).toBe(this.settledResults.amount.toString());
            expect(await this.game.findLabelText(this.locators.lblHistoryDetailTotalWin)).toBe(this.settledResults.totalWin.toString());
        });

        test("Verify user can verify pf data", async () => {
            await this.game.clickCocos(this.locators.btnHistoryDetailPF, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.iconHistoryDetailPFGuide)).toBe(true);
            expect(await this.game.findLabelText(this.locators.lblHistoryDetailPFRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.lblClientSeed)).toBe(this.settledResults.clientSeed.toString());
            await this.game.clickCocos(this.locators.btnCloseHistoryDetailPF, 1000);
        });

        test("Verify user can close history popup", async () => {
            await this.game.clickCocos(this.locators.btnCloseHistoryDetail, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.lblHistoryDetailRoundId)).toBe(false);
        });
    }


    start(): void {
        test.beforeAll(async ({ baseGame }) => {
            this.game = baseGame;
            this.player = new BasePlayer(this.game);
            this.settledResults = {};
            this.gameGuides.init(this.game);
        });

        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                return `${this.options.snapshotFolderPath}-snapshots/${name}`;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: [this.options.locators],
        });

        test.describe.serial(`${projectName} - ${this.options.gameConfiguration.name} Smoke Tests`, () => {
            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameUITests();
        this.AutoPlay();
        this.PlaceBetMode();
        this.placeBetAndSettleTests();
        this.gameGuides.cocosTests(this.options.gameConfiguration.maxTimeout, this.locators);
        this.gameGuides.cocosTestsPFguide(this.options.gameConfiguration.maxTimeout, this.locators);
    }

    async openHistoryPopup() {
        await this.game.clickCocos(this.locators.btnHistory,1000);

    }

    async setAutoPlayBet(totalAutoPlay:number = 10, step:number = 1) {
        await this.game.clickCocos(this.locators.pathNumAutoPlay + totalAutoPlay,1000);
        await this.game.clickCocos(this.locators.txtNumStepAutoPlay,1000);
        await this.game.page.keyboard.press('Backspace');
        await this.game.waitForTimeout(500);
        await this.game.page.keyboard.press('Backspace');
        await this.game.waitForTimeout(500);
        await this.game.page.keyboard.type(step.toString());
        await this.game.waitForTimeout(500);
        await this.game.clickCocos(this.locators.btnStartAutoPlay,1000);
    }

    async waitForSettlement() {
        return await this.game.waitForEvent(GameEvent.WinStatus);
    }

    async waitForWinStatus() {
        return await this.game.latestCaptureEvent(GameEvent.WinStatus);
    }

}
