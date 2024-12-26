import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { commonControls } from "../components/base-number-game-locator";
import { expect } from "@playwright/test";

export class NumberTicketDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                currentRoundID,
                this.configAdmin.accountId,
                this.dataSet.operatorId,
            );
            const detailsRunning = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(detailsRunning).toHaveScreenshot(`detailsRunning.png`);
            await betdetailsTab.close();
            global.settleRoundID = currentRoundID;
        });

        admintest("Verify BetDetails of completed round without placebet", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForEvent(GameEvent.Settlement);

            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.dataSet.operatorId,
            );
            expect(await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId)).toHaveText(global.settleRoundID);
            const detailsSettle = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblTable2);
            await expect(detailsSettle).toHaveScreenshot(`emptyBetDetailsTable2.png`);
            await betdetailsTab.close();
        });
    }

    protected TC2() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                1,
                this.configAdmin.accountId,
                this.dataSet.operatorId,
            );
            const archivedRound = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(archivedRound).toHaveScreenshot(`archivedRound.png`);
            await betdetailsTab.close();
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const odds = await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["win_settle1"]);
            global.settleRoundID = currentRoundID;
            global.odds = odds;
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[0],
                amount: this.options.placeBetAmount ?? 10,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };

            // Act
            await this.placeBetOnRound(bet);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = global.odds;
            const betTimes = await this.getClientTicketBetTimes();
            global.expectedData = { bet, settledResults, betTimes };
        });

        admintest("Verify BetDetails of case placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(2000);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.dataSet.operatorId,
            );

            await this.verifyBetDetails(betdetailsTab, global.settleRoundID, this.dataSet["win_expect1"].snapshot, global.expectedData);
        });
    }

    protected TC4() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["win_settle2"]);
            global.settleRoundID = currentRoundID;
        });
        admintest("THEN player able to place a bet and settle on running round", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[0],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            // Act
            await this.placeBetOnRound(bet);
        });

        admintest("Verify BetDetails of case of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.dataSet.operatorId,
            );
            const detailsRunning = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(detailsRunning).toHaveScreenshot(`detailsRunning.png`);
            await betdetailsTab.close();
        });
    }

    protected TC5() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const odds = await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["loose_settle1"]);
            global.settleRoundID = currentRoundID;
            global.odds = odds;
        });
        admintest("THEN player able to place a bet and lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[0],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            // Act
            await this.placeBetOnRound(bet);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = global.odds;
            const betTimes = await this.getClientTicketBetTimes();
            global.expectedData = { bet, settledResults, betTimes };
        });

        admintest("Verify BetDetails of case placebet 1 choice and lose", async () => {
            await this.game.waitForTimeout(2000);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID, this.dataSet["loose_expect1"].snapshot, global.expectedData);
        });
    }

    protected TC6() {
        admintest("Verify case Player placebet multiple choices and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const odds = await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["loose_settle2"]);
            global.settleRoundID = currentRoundID;
            global.odds = odds;
        });
        admintest("THEN player able to placebet multiple choices and lose all", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const amount = this.options.placeBetAmount ?? 1;
            const bet = {
                choices: [this.options.placeBetChoices[0], this.options.placeBetChoices[2]],
                amount: this.options.placeBetAmount ?? 10,
                locators: [
                    this.options.locators.betchoices[this.options.placeBetChoices[0]],
                    this.options.locators.betchoices[this.options.placeBetChoices[2]],
                ],
            };
            // Act
            for (const iterator of bet.locators) {
                await this.game.click(`#chip-${amount}`);
                await this.game.click(iterator);
                await this.game.waitForTimeout(800);
            }
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = global.odds;
            const betTimes = await this.getClientTicketBetTimes();
            global.expectedData = { bet, settledResults, betTimes };
        });

        admintest("Verify BetDetails of case placebet multiple choices and lose all", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyBetDetailsMultipleChoices(
                betdetailsTab,
                global.settleRoundID,
                this.dataSet["loose_multiple_choices_expect"].snapshot,
                global.expectedData,
            );
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

        admintest.describe.serial(`${this.options.gameConfiguration.name} Ticket Detail Tests`, () => {
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
        this.TC6();
    }

    async placeBetOnRound(bet: any) {
        await this.game.click(`#chip-${bet.amount}`);
        await this.game.click(bet.locator, 1000);
    }

    async getClientRunningRound() {
        const runningRoundID = await this.game.getText(commonControls.lblRoundId);
        return runningRoundID.trim().replace("#", "");
    }

    async getClientTicketBetTimes() {
        await this.player.gnOpenHistory();
        const settleTime = (await this.game.getText("//table/tbody/tr[1]/td[1]", "innerHTML")).replace(/<br>| /g, " ");
        await this.game.click("//table/tbody/tr[1]/td[2]");
        const placeBetTime = (await this.game.getText("//div[@id='bet-detail']//table/tbody/tr[1]/td[1]", "innerHTML")).replace(
            /<br>| /g,
            " ",
        );
        await this.game.page.reload();
        await this.game.waitForTimeout(3000);
        return { settleTime, placeBetTime };
    }

    async verifyBetDetails(page: any, roundID: any, expectSnapshot: object, expectData: any) {
        await page.waitForTimeout(3000);
        await page.waitForLoadState('domcontentloaded')

        let gsettleClient = await expectData.betTimes.settleTime.split(" ")[0].split(":");
        let gplaceBetClient = await expectData.betTimes.placeBetTime.split(" ")[0].split(":");
        const settleTimeClient = `${gsettleClient[1]}:${gsettleClient[2]}`;
        const placeBetTimeClient = `${gplaceBetClient[1]}:${gplaceBetClient[2]}`;
        const betchoice = expectData.bet.choice.charAt(0).toUpperCase() + expectData.bet.choice.slice(1);
        const winamount = expectData.settledResults.winAmount === 0 ? -expectData.bet.amount : expectData.settledResults.winAmount;
        const cleanwinamount = winamount % 2 === 0 ? parseInt(winamount) : (winamount - expectData.bet.amount).toFixed(1);
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblBetDate)).toContainText(settleTimeClient);
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblPlaceBetTime)).toContainText(placeBetTimeClient);
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblBetChoices)).toContainText(betchoice);
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblStake)).toContainText(expectData.bet.amount.toString());
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId)).toContainText(roundID);
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblOdds)).toContainText(expectData.settledResults.odds[expectData.bet.choice].toString())
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblTotalWin)).toContainText(expectData.settledResults.winAmount.toString())
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblWinLoss)).toContainText(cleanwinamount.toString());

        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key]);
        }
        await page.close();
    }

    async verifyBetDetailsMultipleChoices(page: any, roundID: any, expectSnapshot: object, expectData: any) {
        await page.waitForTimeout(3000);
        await page.waitForLoadState('domcontentloaded')

        let gsettleClient = await expectData.betTimes.settleTime.split(" ")[0].split(":");
        const settleTimeClient = `${gsettleClient[1]}:${gsettleClient[2]}`;
        const winamount = expectData.settledResults.winAmount === 0 ? -expectData.bet.amount * 2 : expectData.settledResults.winAmount;
        const cleanwinamount = winamount % 2 === 0 ? parseInt(winamount) : (winamount - expectData.bet.amount * 2).toFixed(1);

        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblBetDate)).toContainText(settleTimeClient);
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblStake)).toContainText(expectData.bet.amount.toString());
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId)).toContainText(roundID);
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblOdds)).toContainText(expectData.settledResults.odds[expectData.bet.choices[1]].toString())
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblOdds2)).toContainText(expectData.settledResults.odds[expectData.bet.choices[0]].toString())
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblTotalWin)).toContainText(expectData.settledResults.winAmount.toString())
        expect(await page.locator(adminLocator.commonUiBetDetailsTicket.lblWinLoss)).toContainText(cleanwinamount.toString());
      
        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key]);
        }
        await page.close();
    }

}
