import { expect } from "@playwright/test";
import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import * as adminLocator from "../components/base-admin-locator";
import { IBaseOptions } from "./base-options";
let playerId = "";
let operatorId = "";

export class CardBetDetailsGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    tdataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];
    rdataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];
    mornitorlocator = this.configAdmin.mornitorlocator;
    settleNextRound = this.configAdmin.isSettleNextRound;

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet details of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const userData = await this.game.getPlayerIdFromLocalStorage();
            playerId = userData.playerId;
            operatorId = userData.operatorId;
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                1,
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
            const getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, archivedRoundID, playerId, operatorId);
            await this.verifyRER(getRER, this.rdataSet["Expect_NoData"]);
        });
    }

    protected TC2() {
        admintest("User Place a Bet to get running handId", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            //preconditon
            await this.standCard();
            await this.newRound();
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(2000);
            await this.game.clickLocator("hitcard", 2000);
            let currentRoundID = Number(await this.getClientRunningRound());
            global.roundId = currentRoundID;
        });

        admintest("Verify bet details on handId is running", async () => {
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.roundId,
                playerId,
                operatorId,
            );
            const noData = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain).innerText();
            expect(noData).toContain("Unfinished Game");
            await betdetailsTab.close();
        });

        admintest("Verify RER on handId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, global.roundId, playerId, operatorId);
            await this.verifyRER(getRER, this.rdataSet["Expect_Running"]);
            await this.game.waitForTimeout(5000);
            await this.standCard();
            await this.newRound();
        });
    }

    protected TC3() {
        admintest("Set result win for a hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, this.tdataSet["Settle_Win"]);
        });
        admintest("Placebet on win hand", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(2000);
            await this.hitCardThenSettle();
            let currentRoundID = Number(await this.getClientRunningRound());
            global.roundId = currentRoundID;
        });

        admintest("Verify bet details of case placebet on win hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.roundId,
                playerId,
                operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.roundId, this.tdataSet["Expect_Win"]);
        });

        admintest("Verify RER of case hand is win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, global.roundId, playerId, operatorId);
            await this.verifyRER(getRER, this.rdataSet["Expect_Win"]);
        });
    }

    protected TC4() {
        admintest("Set result lose for a hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, this.tdataSet["Settle_Lose"]);
        });
        admintest("Placebet on lose hand", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(2000);
            await this.hitCardThenSettle();
            let currentRoundID = Number(await this.getClientRunningRound());
            global.roundId = currentRoundID;
        });

        admintest("Verify bet details of case placebet on lose hand", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.roundId,
                playerId,
                operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.roundId, this.tdataSet["Expect_Lose"]);
        });

        admintest("Verify RER of case hand is lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, global.roundId, playerId, operatorId);
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
    }

    async hitCardThenSettle() {
        await this.game.clickLocator("hitcard", 10000);
        await this.game.clickLocator("standcard", 2000);
        await this.newRound();
    }

    async newRound() {
        await this.game.clickLocator("cancelbet", 2000);
        await this.game.waitForTimeout(5000);
    }

    async getClientRunningRound() {
        return this.game.getTextLocator("roundId");
    }

    async standCard() {
        await this.game.clickLocator("standcard", 1000);
        if (this.game.locator("btnConfirmStand")) {
            await this.game.clickLocator("btnConfirmStand");
        }
        await this.game.waitForTimeout(8000);
    }

    async verifyBetDetails(page: any, roundID: number, expectSnapshot: object) {
        let roundId = await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText();
        expect(roundId.includes(roundID)).toBe(true);

        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key], { maxDiffPixelRatio: 0.2 });
        }
    }

    async fillGameResult(newTab: any, data: any) {
        await newTab.fill(data.nickname.locator, this.game.username);
        await newTab.fill(data.dealer.locator, data.dealer.value);
        await newTab.fill(data.hand.locator, data.hand.value);
        await newTab.click(data.btnSubmit);
        await newTab.close();
    }

    async verifyRER(getData: any, expectedData: any) {
        const checkData = await JSON.parse(getData).Result;
        expect(checkData.TotalAmount).toBe(expectedData.totalAmount);
        expect(checkData.ErrorCode).toBe(expectedData.errorCode);
        expect(checkData.ErrorDescription).toBe(expectedData.errorDescription);
    }
}
