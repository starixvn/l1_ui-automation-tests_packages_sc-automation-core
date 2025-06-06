import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import * as adminLocator from "../components/base-admin-locator";
import { expect } from "@playwright/test";
let playerId = "";

export class CascadingAdminBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    gameName = this.configAdmin.gameName ?? "Missed_Game_Name";
    oddsdataSet = this.configAdmin[`${process.env.npm_config_project}odds`];
    mornitorlocator = this.configAdmin.mornitorlocator;
    operatorId = this.configAdmin[`${process.env.npm_config_project}operatorId`];
    botRatio = this.configAdmin["botRatio"];
    expectBotRatio = this.configAdmin["expectBotRatio"];
    constructor(protected options: IBaseOptions) {}

    protected Mornitoring() {
        admintest("Verify game items in Monitoring page", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.selectLeftMenu("Game Monitoring");

            const locators = [
                `//*/td[text()='${this.gameName}']`,
                `//*/td[text()='${this.gameName}']//following::td[1]`,
                `//*/td[text()='${this.gameName}']//following::td[2]`,
                `//*/td[text()='${this.gameName}']//following::td[3]`,
            ];
            await this.admin.verifyLocatorsVisible(locators);
        });

        admintest("Verify user can open monitoring page", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const mornitorLocator = `//*/td[text()='${this.gameName}']//following::td[1]`;
            await this.admin.page.focus(mornitorLocator);
            const [newtab] = await Promise.all([
                this.admin.page.context().waitForEvent("page"),
                await this.admin.page.click(mornitorLocator),
            ]);
            await newtab.waitForLoadState();
            const gameNameText = await newtab.locator("//div[@class='page-title']").innerText();
            expect(gameNameText.toLowerCase()).toBe(this.gameName.replace(" ", "").toLowerCase() + " result controller");
            await newtab.close();
        });

        admintest("Verify user can open round history page and can search round data", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            await this.player.placeBet(bet.choice, bet.amount);
            const settlement = await this.game.waitForSettlement();
            await this.game.clickOutSide();
            await this.admin.clickLocator(`//*/td[text()='${this.gameName}']//following::td[2]`, 1000);
            await this.admin.textLocatorShouldBe("//*/div[@class='page-title']", this.gameName);
            await this.admin.verifyLocatorsVisible(Object.values(adminLocator.gameMornitoringRoundHistory));
            await this.admin.page.locator(adminLocator.gameMornitoringRoundHistory.roundId).fill(settlement.roundId.toString());
            await this.admin.page.locator(adminLocator.gameMornitoringRoundHistory.excludeUUS_checkbox).uncheck();
            await this.admin.clickLocator(adminLocator.gameMornitoringRoundHistory.submit_btn);
            await this.admin.verifyLocatorsVisible([`//table[@id='tbl-slot-game']//td/a[contains(text(),'${settlement.roundId}')]`]);
            await this.admin.page.locator(`//table[@id='tbl-slot-game']//td/a[contains(text(),'${settlement.roundId}')]`).click();
            await this.admin.textLocatorShouldBe(`//div[@id='modal']//h5[@class='modal-title']`, `Bet History`);
            await this.admin.verifyNoBrokenImages();
            await this.admin.clickLocator("//div[@id='modal']//div[@class='modal-header']/button[@class='close']/span");
        });
    }

    protected OnlineUser() {
        admintest(`Verify user can open online user page and check ${this.gameName} in game list`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.selectLeftMenu("Online User");
            await expect(this.admin.page.locator("#content")).toContainText("Online Users");
            await expect(this.admin.page.getByLabel("Game")).toContainText(this.gameName);
            await expect(this.admin.page.getByLabel("Include Testing Users")).toBeVisible();
        });

        admintest(`Verify user can search online user`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.page.getByLabel("Include Testing Users").check();
            const userData = await this.game.getPlayerIdFromLocalStorage();
            playerId = userData.playerId;
            await this.admin.page.getByLabel("Search:").fill(playerId);
            await expect(this.admin.page.locator("tbody")).toContainText(playerId);
        });
    }

    protected GameManagement_Setting() {
        admintest(`Verify user can search ${this.gameName} in game list`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.selectLeftMenu("Game Management");
            await expect(this.admin.page.locator("#content")).toContainText("Game Management");
            await this.admin.page.getByLabel("Search:").fill(this.gameName);
            await expect(this.admin.page.locator(adminLocator.gameManagement.game_name)).toContainText(this.gameName);
        });

        admintest(`Verify Setting popup show with appropriate data`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(`//button[contains(@onclick,'${this.operatorId}')]`);
            const locators = Object.values(adminLocator.gameManagementSettingCascading);
            await this.admin.verifyLocatorsVisible(locators);
            await this.admin.clickLocator(adminLocator.gameManagementSettingCascading.site_exclusion_tab);
            const locators2 = Object.values(adminLocator.gameManagemenSiteExclusion);
            await this.admin.verifyLocatorsVisible(locators2);
            await this.admin.clickLocator(adminLocator.gameManagemenSiteExclusion.close_btn, 1000);
        });
    }

    protected GameManagement_Odds() {
        admintest(`Verify user open odds popup and check there are 10 sections for 9 main symbols and Scatter symbol`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.odds);
            const locators = Object.values(adminLocator.gameManagementOddsCascading);
            await this.admin.verifyLocatorsVisible(locators);
        });

        admintest(`Verify no broken images`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.verifyNoBrokenImages();
        });

        admintest(`Verify user update odds and it apply to game`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.updateOddsCascading(
                this.oddsdataSet.index,
                this.oddsdataSet.from,
                this.oddsdataSet.to,
                this.oddsdataSet.odds,
                true,
            );
        });

        admintest(`Verify new odds apply to game`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            await this.game.page.reload();
            await this.player.placeBet(bet.choice, bet.amount);
            const settlement = await this.game.waitForSettlement();
            const isValid = checkOdds(settlement.odds.symbols, this.oddsdataSet);
            expect(isValid).toBe(true);
        });
    }

    protected GameManagement_GeneralSetting() {
        admintest(`Verify user open general setting popup and check content`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.general_settings);
            const locators = Object.values(adminLocator.gameManagementGeneralSetting);
            await this.admin.verifyLocatorsVisible(locators);
        });

        admintest(`Verify admin can change mode-easy and user can placebet without error`, async () => {
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.page.getByLabel("Mode").selectOption("Easy");
            await this.admin.clickLocator(adminLocator.gameManagementGeneralSetting.save_btn, 1000);
            await this.player.placeBet(bet.choice, bet.amount);
            const settlement = await this.game.waitForSettlement();
            await this.game.clickOutSide();
            expect(settlement.roundId).toBeGreaterThan(0);
        });

        admintest(`Verify admin can change mode-medium and user can placebet without error`, async () => {
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.general_settings, 1000);
            await this.admin.page.getByLabel("Mode").selectOption("Medium");
            await this.admin.clickLocator(adminLocator.gameManagementGeneralSetting.save_btn, 3000);
            await this.player.placeBet(bet.choice, bet.amount);
            const settlement = await this.game.waitForSettlement();
            await this.game.clickOutSide();
            expect(settlement.roundId).toBeGreaterThan(0);
        });

        admintest(`Verify admin can change mode-hard and user can placebet without error`, async () => {
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.general_settings, 1000);
            await this.admin.page.getByLabel("Mode").selectOption("Hard");
            await this.admin.clickLocator(adminLocator.gameManagementGeneralSetting.save_btn, 1000);
            await this.player.placeBet(bet.choice, bet.amount);
            const settlement = await this.game.waitForSettlement();
            await this.game.clickOutSide();
            expect(settlement.roundId).toBeGreaterThan(0);
        });
    }

    protected GameManagement_BotRatio() {
        admintest(`Verify admin can open bot ratio popup and check content`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.bot_ratio);
            const locators = Object.values(adminLocator.gameManagementBotRatio);
            await this.admin.verifyLocatorsVisible(locators);
        });

        admintest(`Verify admin can set bot ratio`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.updateBotRatioGameManagement(this.botRatio);
            await this.admin.clickLocator(adminLocator.gameManagement.bot_ratio);
            await this.admin.verifyBotRatioGameManagement(this.expectBotRatio);
            await this.admin.clickLocator(adminLocator.gameManagementBotRatio.close_btn);
        });
    }

    protected GameManagement_BotEnabled() {
        admintest(`Verify admin can open bot enabled popup and check bot status`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.general_settings);
            await this.admin.page.locator(adminLocator.gameManagementGeneralSetting.bot_enable_checkbox).check();
            await this.admin.clickLocator(adminLocator.gameManagementGeneralSetting.save_btn, 10000); // wait bot enabled
            await expect(this.admin.page.locator(adminLocator.gameManagement.bot_enabled)).toBeVisible();
        });

        admintest(`Verify round id is increasing by bot`, async () => {
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.player.placeBet(bet.choice, bet.amount);
            const settlement1 = await this.game.waitForSettlement();
            await this.game.clickOutSide();
            await this.game.waitForTimeout(15000);//wait for bot placebet
            await this.player.placeBet(bet.choice, bet.amount);
            const settlement2 = await this.game.waitForSettlement();
            await this.game.clickOutSide();
            expect(settlement2.roundId).toBeGreaterThan(settlement1.roundId + 1);
        });
    }

    protected GameManagement_BotDisabled() {
        admintest(`Verify admin can open bot disabled popup and check bot status`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.general_settings);
            await this.admin.page.locator(adminLocator.gameManagementGeneralSetting.bot_enable_checkbox).uncheck();
            await this.admin.clickLocator(adminLocator.gameManagementGeneralSetting.save_btn, 10000); // wait bot disabled
            await expect(this.admin.page.locator(adminLocator.gameManagement.bot_disabled)).toBeVisible();
        });
    }

    protected GameManagement_DisableMessage() {
        admintest(`Verify admin can open disable message popup and check content`, async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.clickLocator(adminLocator.gameManagement.disable_message);
            const locators = Object.values(adminLocator.gameManagementDisableMessage);
            await this.admin.verifyLocatorsVisible(locators);
            await this.admin.clickLocator(adminLocator.gameManagementDisableMessage.close_btn);
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
        this.Mornitoring();
        this.OnlineUser();
        this.GameManagement_Setting();
        this.GameManagement_Odds();
        this.GameManagement_GeneralSetting();
        this.GameManagement_BotRatio();
        this.GameManagement_DisableMessage();
        this.GameManagement_BotEnabled();
        this.GameManagement_BotDisabled();
    }
}

function checkOdds(returnValue, dataToCheck) {
    const { index, from, to, odds } = dataToCheck;

    // Check if the index exists in the return value
    if (returnValue[index]) {
        // Find the entry that matches the 'from', 'to', and 'odds'
        const match = returnValue[index].find(
            (entry) => entry.from === parseInt(from) && entry.to === parseInt(to) && entry.odds === parseInt(odds),
        );

        // Return true if a match is found, otherwise false
        return match !== undefined;
    }

    // Return false if the index does not exist
    return false;
}
