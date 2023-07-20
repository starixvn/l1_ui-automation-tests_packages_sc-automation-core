import type { Page } from "@playwright/test";
import type { WebSocket as PlaywrightWs } from "playwright-core";
import { GameEvent, waitForMessage, parseSocketPayload } from "./../_shared";
import { ssoToGame, getConfig } from "./../auth/auth";
import { ImageLocator, ImageSnapshot } from "./base-image-locator";
import { GameConfiguration } from "./game-configuration";
import { Tesseract } from "tesseract.ts";
import { CSLocatorNames } from "./base-classic-slot-locator";

export class BaseGame {
    readonly LobbyTimeout: number = 35000;
    readonly BetBoardPostfix: string = "BetBoard";

    readonly page: Page;
    readonly locators: Array<ImageLocator>;
    readonly gameConfiguration: GameConfiguration;

    msgpack: boolean;
    gameSocket: PlaywrightWs;
    capturedEvents: any;
    odds: any = null;

    constructor(page: Page, locators: Array<ImageLocator>, gameConfiguration: GameConfiguration) {
        this.page = page;
        this.locators = locators;
        this.gameConfiguration = gameConfiguration;
        this.capturedEvents = {};
    }

    async login() {
        const env = (process.env.npm_config_env ?? "local").toLowerCase();
        const projectCode = process.env.npm_config_project ?? "l1";
        let account: string;
        if (env.includes("local")) {
            account = this.gameConfiguration.accounts[env];
        } else {
            account = projectCode === "l1" ? this.gameConfiguration.accounts[env] : this.gameConfiguration.accounts[`l2${env}`];
        }
        await ssoToGame(this.page, this.gameConfiguration.id, account, this.gameConfiguration.productId, env, projectCode);
        this.msgpack = getConfig().enabledMsgPack;
        this.page.on("websocket", async (ws) => {
            if (ws.url().includes(this.gameConfiguration.socketName ?? this.gameConfiguration.name.toLowerCase())) {
                this.gameSocket = ws;

                ws.on("framereceived", async (msg: any) => {
                    const { payload } = msg ?? "";

                    if (this.odds === null && payload.includes(GameEvent.GameConfig)) {
                        const ingameResponse = parseSocketPayload(payload, this.msgpack).message;
                        this.odds = ingameResponse.gameConfigs.odds;
                    }

                    Object.keys(this.capturedEvents)?.forEach((event) => {
                        if (payload.includes(event)) {
                            this.capturedEvents[event] = parseSocketPayload(payload, this.msgpack).message;
                        }
                    });
                });
            }
        });
        await this.logConsole();

        if (!env.includes("local")) {
            await this.page.waitForTimeout(this.LobbyTimeout * 2);
        } else {
            await this.page.waitForTimeout(this.LobbyTimeout);
        }
    }

    async getTextLocator(locatorName: string) {
        const buffer = await this.capture(locatorName);
        const data = await Tesseract.recognize(buffer.image);
        return data.text.length > 1 ? data.text : null;
    }

    attachSocketAndCaptureEvent(event: string) {
        this.capturedEvents[event] = "";
    }

    latestCaptureEvent(event: string): any | undefined {
        const message = this.capturedEvents[event];
        delete this.capturedEvents[event];

        return message;
    }

    private getGameName(subGameName?: string): string {
        return subGameName ?? this.gameConfiguration.name;
    }

    async waitForEvent(event: string, subGameName?: string): Promise<any> {
        return await waitForMessage(this.gameSocket, event, this.getGameName(subGameName), this.msgpack);
    }

    async waitUntilNextRound(subGameName?: string): Promise<any> {
        this.capturedEvents[GameEvent.WinStatus] = "";

        return await this.waitForEvent(GameEvent.StartRound, subGameName);
    }

    async waitUntilPlaceBet(subGameName?: string): Promise<void> {
        const { wholeRound, placingBets } = this.gameConfiguration.durations;
        await this.waitUntilNextRound(subGameName);
        await this.page.waitForTimeout(wholeRound - placingBets);
    }

    async waitForEndBet(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.EndBet, subGameName);
    }

    async waitForDeal(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.Deal, subGameName);
    }

    async waitForEndDeal(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.EndDeal, subGameName);
    }

    async waitForStandBet(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.Stand, subGameName);
    }

    async waitForSettlement(subGameName?: string): Promise<any> {
        const message = await this.waitForEvent(GameEvent.Settlement, subGameName);
        await this.page.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement
        const winningByChoice = this.latestCaptureEvent(GameEvent.WinStatus);

        let settledResults = {
            settlementResult: message?.finish?.settlementResult,
            odds: this.odds,
            winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
        };
        if (this.gameConfiguration.slotsgame) {
            settledResults["winAmount"] = message?.finish?.betWin ?? 0;
        } else {
            settledResults["winAmount"] = winningByChoice.status.win ? winningByChoice.status.bet : 0;
        }
        return settledResults;
    }

    async waitForTimeout(time = 5000): Promise<void> {
        await this.page.waitForTimeout(time);
    }

    async capture(locatorName: string): Promise<ImageSnapshot> {
        const locator = this.locator(locatorName);

        return locator ? await locator.snapshot(this.page) : Promise.resolve({ name: "", image: Buffer.from("") });
    }

    async captureDealer(): Promise<ImageSnapshot> {
        return this.capture("dealer");
    }

    async captureChoice(choice: string): Promise<ImageSnapshot> {
        return this.capture(`${choice}Choice`);
    }

    async captureOwnbet(choice: string): Promise<ImageSnapshot> {
        return this.capture(`${choice}Ownbet`);
    }

    async captureHistory(): Promise<ImageSnapshot> {
        return this.capture(`historyPopup`);
    }

    async captureLocator(locator: string): Promise<ImageSnapshot> {
        return this.capture(locator);
    }

    async clickToChoice(choice: string): Promise<void> {
        const postfix = this.gameConfiguration.betBoard ? this.BetBoardPostfix : "";
        await this.clickLocator(`${choice}Choice${postfix}`, 0);
    }

    async clickToSlotsChoice(choice: string): Promise<void> {
        await this.clickLocator("choiceMenu", 2000);
        await this.clickLocator("clearChoices", 1500);
        await this.clickLocator(`${choice}Choice`, 2000);
        await this.clickLocator("submitPayline", 1000);
    }

    async clickLocator(element: string, wait = 500): Promise<void> {
        const locator = this.locator(element);
        if (locator) {
            await locator.click(this.page);
            await this.waitForTimeout(wait);
        }
    }

    locator(name: string): ImageLocator | undefined {
        return this.locators.find((x) => x.name === name);
    }

    async clickHistory(waitTime: number = 500): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(CSLocatorNames.mnuHamburger);
        const historyMenu = this.locator("historyMenu") || this.locator(CSLocatorNames.icoHistory);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
        if (historyMenu) {
            await historyMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
    }

    async clickGuide(waitTime: number = 500): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(CSLocatorNames.mnuHamburger);
        const guideMenu = this.locator("guideMenu") || this.locator(CSLocatorNames.icoGuide);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(500);
        }

        if (guideMenu) {
            await guideMenu.click(this.page);
            await this.page.waitForLoadState("domcontentloaded");
            await this.waitForTimeout(waitTime);
        }
    }

    async getGuideContent() {
        let getguidecontent = this.page.frameLocator("iframe").locator("id=container-guide").textContent();
        return getguidecontent;
    }

    async captureErrorMessage(): Promise<ImageSnapshot> {
        return this.capture(`errorMessage`);
    }

    async captureErrorBetLimit(): Promise<ImageSnapshot> {
        return this.capture(`msgMaxbetLimit`);
    }

    async clickStake(amount: number = 1): Promise<void> {
        await this.locator(`stake${amount}`)?.click(this.page);
    }

    async clickStand(): Promise<void> {
        await this.waitForTimeout(6000);
        await this.clickLocator("standcard", 0);
    }

    async clickSlotsStake(amount: number = 1): Promise<void> {
        await this.clickLocator("stakeMenu");
        await this.waitForTimeout(500);
        await this.clickLocator(`stake${amount}`);
    }

    async clickSubmitBet(): Promise<void> {
        await this.waitForTimeout(500);

        let submitButton = this.locator(`submit${this.BetBoardPostfix}`);
        let spinButton = this.locator("spin") || this.locator(CSLocatorNames.btnSpin);

        if (submitButton) {
            await submitButton.click(this.page);
        } else if (spinButton) {
            await spinButton.click(this.page);
        } else {
            await this.locator("hitcard")?.click(this.page);
        }
    }

    async clickOutSide(timeout = 500): Promise<void> {
        const locator = this.locator("outside") || this.locator(CSLocatorNames.btnClosePopup);
        if (locator) {
            await locator.click(this.page);
        }
        await this.waitForTimeout(timeout);
    }

    async mouseDragDrop(from: Pos, to: Pos): Promise<void> {
        const { xPos: fromX, yPos: fromY } = from;
        const { xPos: toX, yPos: toY } = to;

        await this.page.mouse.move(fromX, fromY);
        await this.page.mouse.down();
        await this.page.waitForTimeout(500);
        await this.page.mouse.move(toX, toY);
        await this.page.waitForTimeout(1000);
        await this.page.mouse.up();
    }

    async mouseWhell(to: Pos): Promise<void> {
        const { xPos, yPos } = to;
        await this.page.mouse.wheel(xPos, yPos);
    }

    async getCountFrameLocator(locator: string) {
        return this.page.frameLocator("iframe").locator(locator).count();
    }

    async captureFrameLocator(locator: string, path: string) {
        return this.page.frameLocator("iframe").locator(locator).screenshot({ path: path });
    }

    async keyboardPress(key: string) {
        return this.page.keyboard.press(key);
    }

    async logConsole() {
        this.page.on("console", (msg) => {
            if (msg.text().length < 3) {
                global.logMsg.push(msg.text());
            }
            console.log(msg.text());
        });
    }
}

export interface Pos {
    xPos: number;
    yPos: number;
}