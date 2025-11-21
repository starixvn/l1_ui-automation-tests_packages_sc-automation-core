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
        this.placeBetAndSettleTests();
        this.gameGuides.cocosTests(this.options.gameConfiguration.maxTimeout, this.locators);
        this.gameGuides.cocosTestsPFguide(this.options.gameConfiguration.maxTimeout, this.locators);
    }

    async openHistoryPopup() {
        await this.game.clickCocos(this.locators.btnHistory,1000);

    }

}
