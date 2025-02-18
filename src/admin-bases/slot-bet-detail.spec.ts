import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { expect } from "@playwright/test";

export class SlotBetDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    tdataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];
    rdataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];
    operatorId = this.configAdmin[`${process.env.npm_config_project}operatorId`]
    mornitorlocator = this.configAdmin.mornitorlocator
    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,1,this.configAdmin.accountId,this.operatorId);
            const noData = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain).innerText();
            expect(noData).toContain("No data available");
            await betdetailsTab.close()
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

    protected TC2() {
        admintest("Set result win for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                 this.tdataSet["Settle_Win"]
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
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab, global.roundId,  this.tdataSet["Expect_Win"].snapshot);
        });

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId,
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Win"]);
        });
    }

    protected TC3() {
        admintest("Set result loose for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                 this.tdataSet["Settle_Lose"]
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
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab,global.roundId,  this.tdataSet["Expect_Lose"].snapshot);
        });

        admintest("Verify RER of Lose case", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Lose"]);
        });
    }

    protected TC4() {
        admintest("Set result freespin for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                 this.tdataSet["settle_freespin"]
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
            const settledResults_freespin1 = await this.game.waitForSettlement();//wait for freespin 1
            const settledResults_freespin2 = await this.game.waitForSettlement();//wait for freespin 2
            const settledResults_freespin3 = await this.game.waitForSettlement();//wait for freespin 3
            global.roundId = mainsettledResults.roundId;
            global.freespin1 = settledResults_freespin1;
            global.freespin2 = settledResults_freespin2;
            global.freespin3 = settledResults_freespin3;
            await this.game.waitForTimeout(8000);
        });

        admintest("Verify BetDetails of bonus", async () => {
            let betdetailsTab :any
            const roundIdFreeSpin = [global.freespin1.roundId,global.freespin2.roundId,global.freespin3.roundId]
            betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab,global.roundId,  this.tdataSet["expect_freespin"].snapshot);
            await betdetailsTab.close()

            for (const iterator of roundIdFreeSpin) {
                betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,iterator,this.configAdmin.accountId);
                const round = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText()
                expect((round.includes(iterator))).toBe(true);
                expect((round.includes("Free Spins"))).toBe(true);
                await betdetailsTab.close()
            }
            
        });

        admintest("Verify RER of freespin", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            let getRER1 = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id,global.freespin1.roundId,this.options.Adminconfiguration.accountId);
            let getRER2 = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id,global.freespin2.roundId,this.options.Adminconfiguration.accountId);
            let getRER3 = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id,global.freespin3.roundId,this.options.Adminconfiguration.accountId);

            await this.verifyRER(getRER, this.rdataSet["Expect_Freespin"]);
            await this.verifyRER(getRER1, this.rdataSet["Expect_FreespinRound"],global.freespin1.winAmount);
            await this.verifyRER(getRER2, this.rdataSet["Expect_FreespinRound"],global.freespin2.winAmount);
            await this.verifyRER(getRER3, this.rdataSet["Expect_FreespinRound"],global.freespin3.winAmount);
        });
    }

    protected TC5() {
        admintest("Set result bonus for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                 this.tdataSet["Settle_Bonus"]
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
            await this.game.waitForTimeout(8000);
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
            let betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab ,global.roundId,  this.tdataSet["expect_bonus"].snapshot);
            betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            const totalBonus = await betdetailsTab.locator("//*/div[@id='game-ticket']/table[2]/tbody/tr[1]/td[4]").innerText()
            const win = await betdetailsTab.locator("//*/div[@id='game-ticket']/table[2]/tbody/tr[1]/td[6]").innerText()
            const totalWin = await betdetailsTab.locator("//*/div[@id='game-ticket']/table[2]/tbody/tr[3]/td[6]").innerText()
            expect(totalBonus).toBe("3 Bonus");
            expect(win).toBe(global.winamount.toString());
            expect(totalWin).toBe(global.winamount.toString());

        });

        
        admintest("Verify RER of bonus", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Bonus"],global.winamount);
            await this.admin.waitForTimeout(5000);

        });
    }

    protected TC6() {
        admintest("Set result jackpot for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                 this.tdataSet["Settle_Jackpot"]
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
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.roundId,this.configAdmin.accountId,this.operatorId);
            await this.verifyBetDetails(betdetailsTab,global.roundId , this.tdataSet["Expect_Jackpot"].snapshot);        
        });

        admintest("Verify RER of jackpot", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.rdataSet["Expect_Jackpot"],global.winamount);
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
        if (process.env.npm_config_jackpot) {
            this.TC6();
        }
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

    async verifyBetDetails(page: any, roundID:number, expectSnapshot: object, expectedValue?: object) {
        let bettime = await page.locator(adminLocator.commonUiBetDetailsTicket.lblBetDate).innerText()
        let roundId = await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText()

        expect(await this.checkDate(bettime)).toBe(true);
        expect(roundId.includes(roundID)).toBe(true);

        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key],{  maxDiffPixelRatio : 0.2 });
        }
        for (const key in expectedValue) {
            expect(await page.locator(key).innerText()).toBe(expectedValue[key]);
        }
        await page.close();
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

    async verifyRER(getData: any, expectedData: any, winAmount?: number) {
        const checkData = await JSON.parse(getData).result;
        expect(checkData.totalAmount).toBe(expectedData.totalAmount);
        if (winAmount) {
         expect(checkData.totalWin).toBe(winAmount);
        }
        else{
            expect(checkData.totalWin).toBe(expectedData.totalWin);
        }
        expect(checkData.errorCode).toBe(expectedData.errorCode);
        expect(checkData.errorDescription).toBe(expectedData.errorDescription);
    }
}
