import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { expect } from "@playwright/test";

export class TicketDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,1,this.configAdmin.accountId);
            const archivedRound = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(archivedRound).toHaveScreenshot(`archivedRound`);
        });
    }

    protected TC2() {
        admintest("Set result win for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_win"]
            );
        });
        admintest("Placebet on win choice", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();
            await this.game.waitForTimeout(5000); 
            global.roundId = settledResults.roundId;
        });

        admintest("Verify BetDetails of case win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, this.options.Adminconfiguration.datasetTicket["expect_win"].snapshot);
        });
    }

    protected TC3() {
        admintest("Set result loose for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_loose"]
            );
            await this.admin.waitForTimeout(5000);

        });
        admintest("Placebet on loose choice", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();
            global.roundId = settledResults.roundId;
            await this.game.waitForTimeout(5000);
        });

        admintest("Verify BetDetails of case loose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, this.options.Adminconfiguration.datasetTicket["expect_loose"].snapshot);
        });
    }

    protected TC4() {
        admintest("Set result freespin for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_freespin"]
            );
        });
        admintest("Placebet on case got freespin", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const mainsettledResults =await this.game.waitForSettlement();//wait for main placebet
            await this.game.waitForSettlement();//wait for freespin 1
            await this.game.waitForSettlement();//wait for freespin 2
            await this.game.waitForSettlement();//wait for freespin 3
            global.roundId = mainsettledResults.roundId;
            await this.game.waitForTimeout(8000);
        });

        admintest("Verify BetDetails of bonus", async () => {
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, this.options.Adminconfiguration.datasetTicket["expect_freespin"].snapshot);
        });
    }

    protected TC5() {
        admintest("Set result bonus for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_bonus"]
            );
        });
        admintest("Placebet on case got bonus", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent("bonuses");

            await this.player.placeBet(bet.choice, bet.amount);
            const bonus = await this.game.waitForEvent("bonuses");
            await this.game.waitForTimeout(5000);
            let x = 305
            for (let index = 1; index <= bonus.bonuses.bonus; index++) {
                await this.game.page.mouse.click(x,366)
                x+=150
                if (index == bonus.bonuses.bonus) {
                    const settledResults = await this.game.waitForSettlement();
                    global.roundId = settledResults.roundId;
                    global.winamount = settledResults.winAmount;
                }
                await this.game.waitForTimeout(800);
            }

        });

        admintest("Verify BetDetails of case case got bonus", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab ,this.options.Adminconfiguration.datasetTicket["expect_bonus"].snapshot);
        });
    }

    protected TC6() {
        admintest("Set result jackpot for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_jackpot"]
            );
        });
        admintest("Placebet on case got jackpot", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();
            global.roundId = settledResults.roundId;
            global.winamount = settledResults.winAmount;
            await this.game.waitForTimeout(5000);
        });

        admintest("Verify BetDetails of jackpot", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab ,this.options.Adminconfiguration.datasetTicket["expect_jackpot"].snapshot);        
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
            locators: this.options.locators,
        });

        admintest.describe.serial(`${this.options.gameConfiguration.name} Ticket Detail Tests`, () => {
            admintest.beforeAll(async ({ baseGame,baseAdmin}) => {
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

    async placeBetOnRound(bet: { choice: string; amount: number }, roundId: number, isWaitForSettlement = true) {
        this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        let currentRoundID = Number(await this.getClientRunningRound());
        if (currentRoundID < roundId && isWaitForSettlement) {
            // Act
            await this.player.placeBet(bet.choice, bet.amount);
            await this.game.waitForEvent(GameEvent.Settlement);
        }
        else if (currentRoundID ===  roundId && isWaitForSettlement) {

            await this.game.clickStake(bet.amount);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(800);
            await this.game.waitForEvent(GameEvent.Settlement);
        }
        else if (currentRoundID ===  roundId) {

            await this.game.clickStake(bet.amount);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(800);
        }
        else if (currentRoundID !=  roundId) {
            await this.game.waitUntilPlaceBet()
            await this.game.clickStake(bet.amount);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(800);
        }
    }

    async getClientRunningRound() {
        return this.game.getTextLocator("roundId");
    }

    async verifyBetDetails(page: any, expectSnapshot: object, expectedValue?: object) {
        expect(this.checkDate(await page.locator("//*[@id='game-ticket']/table[1]/tbody//td[1]").innerText())).toBe(true);
        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key]);
        }
        for (const key in expectedValue) {
            expect(await page.locator(key).innerText()).toBe(expectedValue[key]);
        }
    }


    async checkDate(dateString:string) {
        // Parse the date string
        const date = new Date(dateString);
    
        // Get the current date
        const currentDate = new Date();
    
        // Compare the year, month, and day
        const sameYear = date.getFullYear() === currentDate.getFullYear();
        const sameMonth = date.getMonth() === currentDate.getMonth();
        const sameDay = date.getDate() === currentDate.getDate();
    
        // If all three are true, the dates are the same
        return sameYear && sameMonth && sameDay;
    }
}
