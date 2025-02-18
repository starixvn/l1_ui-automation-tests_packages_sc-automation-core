import { expect } from "@playwright/test";
import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import * as adminLocator from "../components/base-admin-locator";
import { IBaseOptions } from "./base-options";

export class CardBetDetailsGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    tdataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];
    rdataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];
    operatorId = this.configAdmin[`${process.env.npm_config_project}operatorId`]
    mornitorlocator = this.configAdmin.mornitorlocator
    settleNextRound = this.configAdmin.isSettleNextRound;

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Set result for running hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.tdataSet["Settle_Running"]
            );
        });

        admintest("User Place a Bet to get running handId", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            let currentRoundID = Number(await this.getClientRunningRound());
            global.roundId = currentRoundID;
        });

        admintest("Verify bet details on handId is running", async () => {
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.admin.waitForTimeout(1000);
            await this.verifyBetDetails(betdetailsTab, global.roundId ,this.tdataSet["Expect_Running"].snapshot);
            await this.standCard();
        });

        admintest("Verify RER on handId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Running"]);
            await this.cancelBet();
        });
    }

    protected TC2() {
        admintest("Verify bet details of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,1,this.configAdmin.accountId,this.operatorId);
            const archivedRound = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain).innerText();
            expect(archivedRound).toContain("No data available");
            await betdetailsTab.close();
        });

        admintest("Verify RER of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_NoData"]);
        });
    }

    protected TC3() {
        admintest("Set result win for a hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.tdataSet["Settle_Win"]
            );
        });
        admintest("Placebet on win hand", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            let currentRoundID = Number(await this.getClientRunningRound());
            await this.standCard();
            global.roundId = currentRoundID;
        });

        admintest("Verify bet details of case placebet on win hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab, global.roundId ,this.tdataSet["Expect_Win"].snapshot);
        });

        admintest("Verify RER of case hand is win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Win"]);
        });
    }

    protected TC4() {
        admintest("Set result lose for hand ", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.tdataSet["Settle_Lose"]
            );
        });
        admintest("Placebet on lose hand", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            await this.game.waitForTimeout(8000); //wait for deal card
            await this.standCard();
            let currentRoundID = Number(await this.getClientRunningRound());
            global.roundId = currentRoundID;
        });

        admintest("Verify bet details of case placebet on lose hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab, global.roundId ,this.tdataSet["Expect_Lose"].snapshot);
        });

        admintest("Verify RER of case handId is loose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Lose"]);
        });
    }

    protected TC5() {
        admintest("Set result draw for hand ", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.tdataSet["Settle_Draw"]
            );
        });
        admintest("Placebet on draw hand", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            await this.followCardAndSettle();
            let currentRoundID = Number(await this.getClientRunningRound());
            await this.cancelBet();
            global.roundId = currentRoundID;
        });

        admintest("Verify bet details of case placebet on draw hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab, global.roundId ,this.tdataSet["Expect_Draw"].snapshot);
        });

        admintest("Verify RER of case handId is draw", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Draw"]);
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

        admintest.describe.serial(`${this.options.gameConfiguration.name} Admin 1W Bet Details Tests`, () => {
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
        this.TC5();
    }

    async verifyRER(getData: any, expectedData: any) {
        const checkData = await JSON.parse(getData).result;
        expect(checkData.totalAmount).toBe(expectedData.totalAmount);
        expect(checkData.totalWin).toBe(expectedData.totalWin);
        expect(checkData.errorCode).toBe(expectedData.errorCode);
        expect(checkData.errorDescription).toBe(expectedData.errorDescription);
    }

    async followCardAndSettle() {
        this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
        await this.game.waitForTimeout(8000);
        await this.game.clickLocator("standcard", 10000);
        await this.game.clickLocator("followcard", 5000);
        await this.game.waitForTimeout();
        await this.game.latestCaptureEvent(GameEvent.EndBet);
    }

    async followCardThenCancel() {
        await this.game.clickLocator("standcard", 10000);
        await this.game.clickLocator("cancelbet", 2000);
    }

    async getClientRunningRound() {
        return this.game.getTextLocator("roundId");
    }

    async standCard() {
        await this.game.clickLocator("standcard", 1000);
        if(this.game.locator("btnConfirmStand")){
            await this.game.clickLocator("btnConfirmStand");
        }
        console.log("standdd")
        await this.game.waitForTimeout(8000);
    }

    async cancelBet() {
        for (let i = 0; i < 3; i++) {
            await this.game.clickLocator("cancelbet", 2000);
        }
    }

    async verifyBetDetails(page: any, roundID: number, expectSnapshot: object) {
        let roundId = await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText()
       expect(roundId.includes(roundID)).toBe(true);

        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key],{  maxDiffPixelRatio : 0.2 });
        }
    }


}
