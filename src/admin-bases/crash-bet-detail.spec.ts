import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { expect } from "@playwright/test";
let playerId = "";
let operatorId = "";

const CrashGameEvent = {
    StartCashOut: (msg) => msg?.c?.t == 0,
    CashOut: (msg) => msg?.cashOut,
    HalfCashOut: (msg) => msg?.halfCashOut,
};

export class CrashBetDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    tdataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];
    rdataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];
    mornitorlocator = this.configAdmin.mornitorlocator;
    settleNextCrash = this.configAdmin.isSettleNextRound;
    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const userData = await this.game.setPlayerIdFromLocalStorage();
            playerId = userData.playerId;
            operatorId = userData.operatorId;   
            const archivedRoundID = 1;
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                archivedRoundID,
                playerId,
                operatorId,
            );
            const noData = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain).innerText();
            expect(noData).toContain("No data available");
            await betdetailsTab.close();
        });

        admintest("Verify RER of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                playerId,
                operatorId,
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_NoData"]);
        });
    }

    protected TC2() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet();
            const currentRoundId = await this.getClientRunningRound();
            global.settleRoundID = Number(currentRoundId)
        });
        admintest("THEN player able to place a bet and settle on running round", async () => {
            // Arrange

            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Act
            await this.placeBet();
            await this.game.waitForSpecificEvent(CrashGameEvent.StartCashOut); //wait for start cash out
            await this.cashOut();
        });

        admintest("Verify BetDetails of case of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                playerId,
                operatorId,
            );
            const noData = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain).innerText();
            expect(noData).toContain("No data available");
            await betdetailsTab.close();
        });

        admintest("Verify RER of case of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                playerId,
                operatorId,
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_NoData"]);
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet();
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, this.tdataSet["Settle_Win"]);
            const currentRoundId = await this.getClientRunningRound();
            global.settleRoundID = Number(currentRoundId) + (this.settleNextRound ? 1 : 0);
            if (this.settleNextRound) {
                await this.game.waitUntilNextRound();
                await this.game.waitForTimeout(this.options.waitBetTimeout);
            }
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Act
            await this.placeBet();
            await this.game.waitForSpecificEvent(CrashGameEvent.StartCashOut); //wait for start cash out
            await this.cashOut()
            await this.game.waitForTimeout(5000)

        });

        admintest("Verify BetDetails of case placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                playerId,
                operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID, this.tdataSet["Expect_Win"]);
        });

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                playerId,
                operatorId,
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Win"]);
        });
    }

    protected TC4() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet()
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, this.tdataSet["Settle_Lose"]);
            const currentRoundId = await this.getClientRunningRound();
            global.settleRoundID = Number(currentRoundId) + (this.settleNextRound ? 1 : 0);
            if (this.settleNextRound) {
                await this.game.waitUntilNextRound();
                await this.game.waitForTimeout(this.options.waitBetTimeout);
            }
        });
        admintest("THEN player able to place a bet and lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            await this.placeBet();
            await this.game.waitForSpecificEvent(CrashGameEvent.StartCashOut); //wait for start cash out
            await this.cashOut()
            await this.game.waitForTimeout(5000)

        });

        admintest("Verify BetDetails of case placebet 1 choice and lose", async () => {
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                playerId,
                operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID, this.tdataSet["Expect_Lose"]);
        });

        admintest("Verify RER of Lose case", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                playerId,
                operatorId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Lose"]);
        });
    }

    start(): void {
        admintest.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.options.snapshotFolderPath + "-snapshots/" + name;

                return snapshotPath;
            };
        });

        admintest.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: [this.options.locators],
        });

        admintest.describe.serial(`${this.options.gameConfiguration.name} Bet Detail Tests`, () => {
            admintest.beforeAll(async ({ baseGame, baseAdmin }) => {
                this.game = baseGame;
                this.admin = baseAdmin;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.TC1();
        this.TC2();
        this.TC3();
        this.TC4();
    }

    async getClientRunningRound() {
        return this.game.getTextLocator("roundId");
    }

    async verifyBetDetails(page: any, roundID: number, expectSnapshot: object) {
        let roundId = await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText();

        expect(roundId.includes(roundID)).toBe(true);

        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key],{  maxDiffPixelRatio : 0.2 });
        }
        await page.close();
    }

    async fillGameResult(newTab: any, data: object) {
        for (const [key, value] of Object.entries(data)) {
            await newTab.click(key);
            await newTab.waitForTimeout(200);
            await newTab.click(value);
            await newTab.waitForTimeout(200);
        }
        await newTab.close();
    }

    async verifyRER(getData: any, expectedData: any) {
        const checkData = await JSON.parse(getData).Result;
        expect(checkData.TotalAmount).toBe(expectedData.totalAmount);
        expect(checkData.ErrorCode).toBe(expectedData.errorCode);
        expect(checkData.ErrorDescription).toBe(expectedData.errorDescription);
    }

    async cashOut () {
        await this.game.waitForTimeout(200);
        await this.game.clickLocator("btnCashOut");
    };
    
    async placeBet () {
        await this.game.waitUntilPlaceBet();
        await this.game.clickLocator("btnPlaceBet");
    };
    
    async waitForSettlement () {
        const message = await this.game.waitForEvent(GameEvent.Settlement);
        await this.game.waitForTimeout(2500); // add sleep due to feature Publish round result prior to settlement
        const winningByChoice = this.game.latestCaptureEvent(GameEvent.WinStatus);
    
        let settledResults = {
            settlementResult: message?.finish?.settlementResult,
            winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
            roundId: message.finish.roundId || 0,
        };
        settledResults["winAmount"] = winningByChoice.status.win ? winningByChoice.status.bet : 0;
        return settledResults;
    };

}
