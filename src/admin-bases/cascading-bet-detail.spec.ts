import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { expect } from "@playwright/test";
let playerId = "";
let operatorId = "";
let nickname = "";

export class CascadingBetDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    rdataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];
    tdataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];
    mornitorlocator = this.configAdmin.mornitorlocator;
    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            playerId = this.configAdmin.accountId ?? "";
            const userInfo = await this.admin.getPlayerInfo(playerId);
            nickname = userInfo.nickname;
            operatorId = userInfo.operatorId;

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
            let getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, archivedRoundID, playerId, operatorId);
            await this.verifyRER(getRER, this.rdataSet["Expect_NoData"]);
        });
    }

    protected TC2() {
        admintest("Set result win for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, nickname, this.rdataSet["Settle_Win"]);
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
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.roundId,
                playerId,
                operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.roundId, this.tdataSet["Expect_Win"]);
            await betdetailsTab.close();
        });

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, global.roundId, playerId, operatorId);
            await this.verifyRER(getRER, this.rdataSet["Expect_Win"]);
        });
    }

    protected TC3() {
        admintest("Set result lose for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, nickname, this.rdataSet["Settle_Lose"]);
        });

        admintest("Placebet on lose choice", async () => {
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

        admintest("Verify BetDetails of case lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.roundId,
                playerId,
                operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.roundId, this.tdataSet["Expect_Lose"]);
            await betdetailsTab.close();
        });

        admintest("Verify RER of Lose case", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, global.roundId, playerId, operatorId);
            await this.verifyRER(getRER, this.rdataSet["Expect_Lose"]);
        });
    }

    protected TC4() {
        admintest("Set result freespin for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, nickname, this.rdataSet["Settle_Freespin"]);
        });

        admintest("Placebet on case got freespin", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const mainsettledResults = await this.game.waitForSettlement(); //wait for main placebet
            const settledResults_freespin1 = await this.game.waitForSettlement(); //wait for freespin 1
            const settledResults_freespin2 = await this.game.waitForSettlement(); //wait for freespin 2
            const settledResults_freespin3 = await this.game.waitForSettlement(); //wait for freespin 3
            global.roundId = mainsettledResults.roundId;
            global.freespin1 = settledResults_freespin1;
            global.freespin2 = settledResults_freespin2;
            global.freespin3 = settledResults_freespin3;
            await this.game.waitForTimeout(8000);
        });

        admintest("Verify BetDetails of freespin", async () => {
            let betdetailsTab: any;
            const roundIdFreeSpin = [global.freespin1.roundId, global.freespin2.roundId, global.freespin3.roundId];
            betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.roundId,
                playerId,
                operatorId,
            );
            await this.verifyBetDetails(betdetailsTab, global.roundId, this.tdataSet["Expect_Freespin"]);
            await betdetailsTab.close();

            for (const iterator of roundIdFreeSpin) {
                betdetailsTab = await this.admin.filterBetDetails(
                    this.admin.page.context(),
                    this.options.gameConfiguration.id,
                    iterator,
                    playerId,
                    operatorId,
                );
                await betdetailsTab.locator("//div/table[1]//tr[1]/td[1]").waitFor({ state: "visible" });
                const roundId = await betdetailsTab.locator("//div/table[1]//tr[1]/td[1]").innerText();
                expect(roundId).toContain(iterator.toString());
                expect(roundId).toContain("(Free Spin)");
                await betdetailsTab.close();
            }
        });

        admintest("Verify RER of freespin", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, global.roundId, playerId, operatorId);
            let getRER1 = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.freespin1.roundId,
                playerId,
                operatorId,
            );
            let getRER2 = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.freespin2.roundId,
                playerId,
                operatorId,
            );
            let getRER3 = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.freespin3.roundId,
                playerId,
                operatorId,
            );

            await this.verifyRER(getRER, this.rdataSet["Expect_Freespin"]);
            await this.verifyRER(getRER1, this.rdataSet["Expect_FreespinRound"]);
            await this.verifyRER(getRER2, this.rdataSet["Expect_FreespinRound"]);
            await this.verifyRER(getRER3, this.rdataSet["Expect_FreespinRound"]);
        });
    }

    protected TC5() {
        admintest("Set result got multiplier for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, nickname, this.rdataSet["Settle_Multiplier"]);
        });

        admintest("Placebet on case got multiplier", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);

            const settledResults = await this.game.waitForSettlement(this.options.gameConfiguration.name, "multiplier"); //wait for main placebet
            global.roundId = settledResults.roundId;
            global.winamount = settledResults.winAmount;
            expect(settledResults.multiplier).toBe(1);
            await this.game.waitForTimeout(8000);
        });

        admintest("Verify RER of multiplier", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id, global.roundId, playerId, operatorId);
            await this.verifyRER(getRER, this.rdataSet["Expect_Multiplier"]);
            await this.admin.waitForTimeout(5000);
        });

        admintest("Verify BetDetails of case case got multiplier", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.roundId,
                playerId,
                operatorId,
            );
            expect(betdetailsTab.locator("//div[@class='note']")).toContainText(
                "Note: Data are only available within the last 7 days from the current date.",
            );
            await this.verifyBetDetails(betdetailsTab, global.roundId, this.tdataSet["Expect_Multiplier"]);
            const totalMultiplier = await betdetailsTab.locator("//*//img[contains(@src,'symbol-10.png')]").count();
            expect(totalMultiplier).toBeGreaterThanOrEqual(1);
            await betdetailsTab.close();
        });

        admintest("Verify BetDetails in multiple languages", async () => {
            const languageTests = [
                {
                    lang: "en-US",
                    note: "Note: Data are only available within the last 7 days from the current date.",
                },
                {
                    lang: "vi-VN",
                    note: "Lưu ý: Bạn chỉ có thể xem dữ liệu cách đây 7 ngày tính từ thời điểm hiện tại.",
                },
                {
                    lang: "id-ID",
                    note: "Catatan: Data hanya tersedia dalam 7 hari terakhir dari tanggal saat ini.",
                },
                {
                    lang: "th-TH",
                    note: "หมายเหตุ: ข้อมูลจะใช้ได้เฉพาะภายใน 7 วันที่ผ่านมานับจากวันที่ปัจจุบัน",
                },
                {
                    lang: "zh-CN",
                    note: "注意: 数据仅在从当前日期起的最后 7 天内可用.",
                },
                {
                    lang: "zh-TW",
                    note: "注意: 數據僅在從當前日期起的最後 7 天內可用.",
                },
            ];

            for (const { lang, note } of languageTests) {
                await admintest.step(`Verify BetDetails in ${lang}`, async () => {
                    await this.verifyBetDetailsInLanguage(lang, note);
                });
            }
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

            admintest.afterAll(async ({ baseGame, baseAdmin }) => {
                await baseGame.page.close();
                await baseAdmin.page.close();
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

    async verifyBetDetails(page: any, roundID: number, expectData: object) {
        expect(await page.locator("//div/table[1]//tr[1]/td[1]")).toContainText(roundID.toString());

        for (const [key, value] of Object.entries(expectData)) {
            const count = await page.locator(`//tr[1]/td[2]/table[@class='table-result-board']//img[contains(@src,'${key}.png')]`).count();
            expect.soft(count, `Expected ${key} to have ${value} elements`).toBe(value);
        }
    }

    protected async verifyBetDetailsInLanguage(language: string, expectedNote: string) {
        admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        const betdetailsTab = await this.admin.filterBetDetails(
            this.admin.page.context(),
            this.options.gameConfiguration.id,
            global.roundId,
            playerId,
            operatorId,
            language,
        );

        // Verify bet details
        await this.verifyBetDetails(betdetailsTab, global.roundId, this.tdataSet["Expect_Multiplier"]);

        // Verify note text
        await expect(betdetailsTab.locator("//div[@class='note']")).toContainText(expectedNote);

        // Verify multiplier count
        const totalMultiplier = await betdetailsTab.locator("//*//img[contains(@src,'symbol-10.png')]").count();
        expect(totalMultiplier).toBeGreaterThanOrEqual(1);

        await betdetailsTab.close();
    }

    async verifyRER(getData: any, expectedData: any) {
        const checkData = await JSON.parse(getData).Result;
        expect(checkData.TotalAmount).toBe(expectedData.totalAmount);
        expect(checkData.ErrorCode).toBe(expectedData.errorCode);
        expect(checkData.ErrorDescription).toBe(expectedData.errorDescription);
    }

    async fillGameResult(newTab: any, nickname: string, data: Record<string, string | number>) {
        await newTab.type("#Nickname", nickname);
        for (const [key, value] of Object.entries(data)) {
            await newTab.selectOption(key, String(value));
        }
        await newTab.click("//button[@id='submit']");
        await newTab.waitForTimeout(3000);
        await newTab.close();
    }
}
