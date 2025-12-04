import type { Page } from "@playwright/test";
import { expect } from "../expects";
import type { WebSocket as PlaywrightWs } from "playwright-core";
import { GameEvent, waitForMessage, parseSocketPayload, waitForSpecificMessage } from "./../_shared";
import { ssoToGame, getConfig, ssoToGame2 } from "./../auth/auth";
import { ImageLocator, ImageSnapshot } from "./base-image-locator";
import { GameConfiguration } from "./game-configuration";
import { createWorker } from "tesseract.js";
import { baseLocatorNames } from "./base-game-locator";
import * as accounts from "../auth/configs/config.account";
import * as numberGameLocator from "./base-number-game-locator";
import fs from "fs";
import { DownloadReport } from "./download-report";
const promClient = require("prom-client");
const PNG = require("pngjs").PNG;
const gatewayUrl = "http://10.10.50.160:9091";
const gauge = new promClient.Gauge({
    name: "performanceTest",
    help: "Game load time in seconds",
    labelNames: ["gameName"],
});

export class BaseGame {
    readonly BetBoardPostfix: string = "BetBoard";
    readonly page: Page;
    readonly locators: any;
    readonly gameConfiguration: GameConfiguration;
    readonly device: any;

    msgpack: boolean;
    gameSocket: PlaywrightWs;
    capturedEvents: any;
    odds: any = null;
    gameConfigs: any = null;
    totalDownloadSize: number = 0;
    trackDownload: boolean;
    files: Array<any>;
    trackDownloadReport: DownloadReport;
    username: string;

    constructor(page: Page, locators: any, gameConfiguration: GameConfiguration, device?: any, trackDownload: boolean = false) {
        this.page = page;
        this.locators = locators[0];
        this.gameConfiguration = gameConfiguration;
        this.capturedEvents = {};
        this.device = device;
        this.trackDownload = trackDownload;
        this.files = [];
        this.trackDownloadReport = new DownloadReport();
    }

    async swipeLocator(fromLocator: string, toLocator: string): Promise<void> {
        const flo = (await this.page.locator(fromLocator).boundingBox()) || { x: 0, y: 0, width: 0, height: 0 };
        const tlo = (await this.page.locator(toLocator).boundingBox()) || { x: 0, y: 0, width: 0, height: 0 };
        const cen1 = { x: flo.x + flo.width / 2, y: flo.y + flo.height / 2 };
        const cen2 = { x: tlo.x + tlo.width / 2, y: tlo.y + tlo.height / 2 };
        await this.device.input.swipe({ x: cen1.x, y: cen1.y }, [{ x: cen2.x, y: cen2.y }], 1);
    }

    async swipePos(fromPos: Pos, toPos: Pos): Promise<void> {
        await this.device.input.swipe({ x: fromPos.x, y: fromPos.y }, [{ x: toPos.x, y: toPos.y }], 1);
    }

    async login() {
        const env = (process.env.npm_config_env ?? "local").toLowerCase();
        const projectCode = process.env.npm_config_project ?? "l1";
        let account: string;
        if (env.includes("local")) {
            account = this.gameConfiguration.accounts[env];
        } else {
            account =
                accounts[`${projectCode}${env}`][this.gameConfiguration.id] ?? this.gameConfiguration.accounts[`${projectCode}${env}`];
        }
        const startTime = performance.now(); // Measure start time

        await ssoToGame(this.page, this.gameConfiguration.id, account, env, projectCode);
        this.msgpack = getConfig().enabledMsgPack;
        if (this.trackDownload) {
            await this.trackDownloadResources(this.page);
        }

        const isQuickBet = process.env.npm_config_quickbet ?? false;

        this.page.on("websocket", async (ws) => {
            const wsUrl = ws.url();
            if (!isQuickBet) {
                if (
                    !wsUrl.includes("notification") &&
                    wsUrl.includes(this.gameConfiguration.socketName ?? this.gameConfiguration.name.toLowerCase())
                ) {
                    this.gameSocket = ws;
                    console.log("wsUrl", ws.url(), this.gameConfiguration.socketName, this.gameConfiguration.name.toLowerCase());

                    ws.on("framereceived", async (msg: any) => {
                        const { payload } = msg ?? "";

                        if (this.odds === null && payload.includes(GameEvent.GameConfig)) {
                            const ingameResponse = parseSocketPayload(payload, this.msgpack).message;
                            this.odds = ingameResponse.gameConfigs?.odds || ingameResponse.odds;
                            this.gameConfigs = ingameResponse.gameConfigs;
                            this.username = ingameResponse.user.name.replace("@", "");
                        }

                        Object.keys(this.capturedEvents)?.forEach((event) => {
                            if (payload.includes(event)) {
                                this.capturedEvents[event] = parseSocketPayload(payload, this.msgpack).message;
                            }
                        });
                    });
                }
            } else {
                if (!wsUrl.includes("notification")) {
                    this.gameSocket = ws;
                    console.log("wsUrl", ws.url(), this.gameConfiguration.socketName, this.gameConfiguration.name.toLowerCase());
                    ws.on("framereceived", async (msg: any) => {
                        const { payload } = msg ?? "";

                        if (this.odds === null && payload.includes(GameEvent.GameConfig)) {
                            const ingameResponse = parseSocketPayload(payload, this.msgpack).message;
                            this.odds = ingameResponse.gameConfigs?.odds || ingameResponse.odds;
                            this.gameConfigs = ingameResponse.gameConfigs;
                        }

                        Object.keys(this.capturedEvents)?.forEach((event) => {
                            if (payload.includes(event)) {
                                this.capturedEvents[event] = parseSocketPayload(payload, this.msgpack).message;
                            }
                        });
                    });
                }
            }
        });

        await this.logConsole();
        if (this.gameConfiguration.id === 0) {
            await this.waitUntilGameLobbyUiLoad();
        } else {
            if (projectCode === "gn") {
                await this.waitUntilXdGameUiLoad();
            } else if (projectCode.includes("pt")) {
                await this.page.locator('#GameCanvas').waitFor();
                await this.waitForTimeout(3000);
                await this.navigateToMicrositeIframe();
            } else if (projectCode.includes("mobi") || projectCode.includes("keno")) {
                await this.waitUntilMobiGameUiLoad();
            } else if (!projectCode.includes("is") && !projectCode.includes("pingoal")) {
                await this.waitUntilGameUiLoad();
            }
        }
        if (this.trackDownload) {
            this.trackDownloadReport.addFirstLoad({
                duration: performance.now() - startTime,
                files: this.files,
                size: this.totalDownloadSize,
            });
            this.trackDownloadReport.saveCSV();
        }
        const endTime = performance.now(); // Measure end time
        const totalSSOTimeSeconds =
            projectCode === "l1" ? ((endTime - startTime - 5000) / 1000).toFixed(2) : ((endTime - startTime - 10000) / 1000).toFixed(2);
        if (env === "prod" && (projectCode === "l1" || projectCode === "l2")) {
            await this.page.mouse.click(5, 5, { delay: 100 }); //handle promotion popup
            console.log(`Total login time: ${totalSSOTimeSeconds} s`, this.gameConfiguration.name);
            const gateway = new promClient.Pushgateway(gatewayUrl, { timeout: 5000 });
            const gaugeLabel = `${projectCode}-${this.gameConfiguration.name}`;

            gauge.labels(gaugeLabel).set(parseFloat(totalSSOTimeSeconds));
            gateway.pushAdd({ jobName: "game_load_time" }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }

    async login2() {
        const env = (process.env.npm_config_env ?? "local").toLowerCase();
        const projectCode = process.env.npm_config_project ?? "l1";
        let account: string;
        if (env.includes("local")) {
            account = this.gameConfiguration.accounts[env];
        } else {
            account =
                accounts[`${projectCode}${env}`][this.gameConfiguration.id] ?? this.gameConfiguration.accounts[`${projectCode}${env}`];
        }

        await ssoToGame2(this.page, this.gameConfiguration.id, account, env, projectCode);
        this.msgpack = getConfig().enabledMsgPack;

        this.page.on("websocket", async (ws) => {
            const wsUrl = ws.url();
            if (
                !wsUrl.includes("notification") &&
                wsUrl.includes(this.gameConfiguration.socketName ?? this.gameConfiguration.name.toLowerCase())
            ) {
                this.gameSocket = ws;
                console.log("wsUrl", ws.url(), this.gameConfiguration.socketName, this.gameConfiguration.name.toLowerCase());

                ws.on("framereceived", async (msg: any) => {
                    const { payload } = msg ?? "";

                    if (this.odds === null && payload.includes(GameEvent.GameConfig)) {
                        const ingameResponse = parseSocketPayload(payload, this.msgpack).message;
                        this.odds = ingameResponse.gameConfigs?.odds || ingameResponse.odds;
                        this.gameConfigs = ingameResponse.gameConfigs;
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
        if (this.gameConfiguration.id === 0) {
            await this.waitUntilGameLobbyUiLoad();
        } else {
            if (projectCode === "gn") {
                await this.waitUntilXdGameUiLoad();
            }  
            else if (projectCode.includes("mobi") || projectCode.includes("keno")) {
                await this.waitUntilMobiGameUiLoad();
            } else if (!projectCode.includes("is") && !projectCode.includes("pingoal")) {
                await this.waitUntilGameUiLoad();
            }
        }
    }

    async waitUntilGameUiLoad(waitRange: number = 1) {
        await this.page.screenshot({ path: `./test-results/beforeInGame.png` });

        await this.page.waitForTimeout(100);
        let filterA: string[] = [];
        const searchString = "LoadScene";
        const searchStringPortrait = "LoadScene Portrait";

        this.page.on("console", (msg) => {
            const msgText = msg.text();
            
            // Check for portrait mode first
            if (msgText.includes(searchStringPortrait)) {
                console.log("Portrait mode detected, switching to portrait handling");
                filterA.push("PORTRAIT_MODE_DETECTED");
                return;
            }
            
            const isRelevantMessage =
                msgText.includes("Open Game") ||
                (msgText.includes(searchString) &&
                    !msgText.includes(searchString + " db") &&
                    !msgText.includes(searchString + " Lobby") &&
                    !msgText.includes(searchString + " microsite-game") &&
                    !msgText.includes("LoadScene Main") &&
                    !msgText.includes("LoadScene game-instant"));

            if (isRelevantMessage) {
                filterA.push(msgText);
            }
        });

        while (filterA.length < waitRange) {
            await this.page.waitForTimeout(50);
        }
        
        await this.waitForTimeout(3000);
        await this.navigateToMicrositeIframe();
        console.log("Landscape Game UI is ready for testing");
        await this.page.screenshot({ path: `./test-results/afterInGame.png` });
    }

    async waitUntilMobiGameUiLoad() {
        await this.page.locator("//div[contains(@class,'games_game-list')]").waitFor();
        console.log("Game UI is ready for testing");
        await this.waitForTimeout(3000);
        await this.page.mouse.click(5, 5, { delay: 100 });
        await this.page.screenshot({ path: `./test-results/afterInGame.png` });
    }

    async waitUntilXdGameUiLoad() {
        await this.page.locator(numberGameLocator.commonControls.lblUserName).waitFor();
        console.log("Game UI is ready for testing");
    }

    async waitUntilGameLobbyUiLoad() {
        let filterA: string[] = [];
        const searchString = "LoadScene Lobby";
        this.page.on("console", (msg) => {
            if (msg.text().includes(searchString)) {
                filterA.push(msg.text());
            }
        });

        while (filterA.length < 1) {
            await this.page.waitForTimeout(100);
        }
        await this.page.waitForTimeout(3000);
        await this.page.mouse.click(5, 5, { delay: 100 });
        console.log("GameLobby UI is ready for testing");
    }

    async getTextLocator(locatorName: string, whitelist: string = "0123456789/:.", lang: string = "eng") {
        const worker = await createWorker();
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        await worker.setParameters({
            tessedit_char_whitelist: whitelist,
        });

        const buffer = await this.capture(locatorName);
        const {
            data: { text },
        } = await worker.recognize(buffer.image);
        await worker.terminate();
        return text;
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
        return subGameName ?? this.gameConfiguration.name.toLowerCase();
    }

    async waitForEvent(event: string, subGameName?: string): Promise<any> {
        return await waitForMessage(this.gameSocket, event, this.getGameName(subGameName), this.msgpack);
    }

    async waitForSpecificEvent(validate: Function, subGameName?: string): Promise<any> {
        return await waitForSpecificMessage(this.gameSocket, validate, this.getGameName(subGameName), this.msgpack);
    }

    async waitUntilNextRound(subGameName?: string): Promise<any> {
        await this.waitForEvent(GameEvent.StartRound, subGameName);
    }

    async waitUntilPlaceBet(subGameName?: string): Promise<void> {
        await this.waitForEvent(GameEvent.StartPlaceBet, subGameName);
        await this.waitForTimeout(4000);
    }

    async gnWaitUntilPlaceBet(timeout = 3000): Promise<void> {
        const odds = await this.waitForEvent(GameEvent.Odds);
        await this.waitForEvent(GameEvent.StartPlaceBet);
        await this.waitForTimeout(timeout);
        return odds.odds;
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

    async waitForSettlement(subGameName?: string, extraInfo?: string): Promise<any> {
        this.capturedEvents[GameEvent.WinStatus] = "";
        const message = await this.waitForEvent(GameEvent.Settlement, subGameName);
        await this.page.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement
        const winningByChoice = this.latestCaptureEvent(GameEvent.WinStatus);

        let settledResults = {
            settlementResult: message?.finish?.settlementResult,
            odds: this.odds,
            winStatus: typeof winningByChoice == "object" && winningByChoice !== null && winningByChoice.status ? winningByChoice.status.win : "",
            roundId: message.finish.roundId || 0,
        };

        if (extraInfo) {
            settledResults[extraInfo] = message.finish[extraInfo];
        }

        if (this.gameConfiguration.slotsgame) {
            settledResults["winAmount"] = message?.finish?.betWin ?? 0;
        } else {
            const hasWin = winningByChoice !== null && winningByChoice !== void 0 && winningByChoice.status && winningByChoice.status.win;
            settledResults["winAmount"] = hasWin ? (winningByChoice.status.bet || 0) : 0;
        }
        return settledResults;
    }

    async gnWaitForSettlement(subGameName?: string): Promise<any> {
        let winningByChoice = this.latestCaptureEvent(GameEvent.WinStatus);
        const message = await this.waitForEvent(GameEvent.Settlement, subGameName);
        if (!winningByChoice) {
            winningByChoice = await this.waitForEvent(GameEvent.WinStatus);
        }

        let settledResults = {
            settlementResult: message?.finish?.settlementResult,
            roundId: message.finish.roundId || 0,
            drawId: message.finish.drawId || 0,
            winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
            winAmount: winningByChoice.status.win ? winningByChoice.status.bet : 0,
            result: message.finish.result,
            pf: message.finish.pf,
        };

        return settledResults;
    }

    async waitForTimeout(time = 5000): Promise<void> {
        if (time > 0) {
            await this.page.waitForTimeout(time);
        }
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
        await this.clickLocator("clearChoices", 2000);
        await this.clickLocator(`${choice}Choice`, 3500);
        await this.clickLocator("submitPayline");
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

    async clickHistory(waitTime: number = 800): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(baseLocatorNames.mnuHamburger);
        const historyMenu = this.locator("historyMenu") || this.locator(baseLocatorNames.icoHistory);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
        if (historyMenu) {
            await historyMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
    }

    async clickJackpot(waitTime: number = 500): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(baseLocatorNames.mnuHamburger);
        const jackpotMenu = this.locator("jackpotMenu") || this.locator(baseLocatorNames.icoJackpot);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
        if (jackpotMenu) {
            await jackpotMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
    }

    async clickHome(waitTime: number = 1000, btnhome: string): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(baseLocatorNames.mnuHamburger);
        const btnHome = this.locator("btnHome") || this.locator(btnhome);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
        if (btnHome) {
            await btnHome.click(this.page);
        }
    }

    async openGuide(waitTime: number = 500, isJP: boolean = false): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu");
        const guideMenu = this.locator(isJP ? "icoGuideJP" : "guideMenu");

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(500);
        }

        if (guideMenu) {
            await guideMenu.click(this.page);
            await this.page.waitForLoadState("load", { timeout: 60000 });
            await this.waitForTimeout(waitTime);
        }
    }

    async getGuideContent() {
        const gameguide = this.page.locator("#game-guide iframe").contentFrame().locator("#container-guide");
        await gameguide.waitFor();
        return await gameguide.innerText();
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
        let spinButton = this.locator("spin") || this.locator(baseLocatorNames.btnSpin);

        if (submitButton) {
            await submitButton.click(this.page);
        } else if (spinButton) {
            await spinButton.click(this.page);
        } else {
            await this.locator("hitcard")?.click(this.page);
        }
    }

    async clickOutSide(timeout = 500): Promise<void> {
        const locator = this.locator("outside");
        if (locator) {
            await locator.click(this.page);
        }
        await this.waitForTimeout(timeout);
    }

    async mouseDragDrop(from: Pos, to: Pos): Promise<void> {
        const { x: fromX, y: fromY } = from;
        const { x: toX, y: toY } = to;

        await this.page.mouse.move(fromX, fromY);
        await this.page.mouse.down();
        await this.page.waitForTimeout(500);
        await this.page.mouse.move(toX, toY);
        await this.page.waitForTimeout(1000);
        await this.page.mouse.up();
    }

    async mouseWhell(to: Pos): Promise<void> {
        const { x, y } = to;
        await this.page.mouse.wheel(x, y);
    }

    async getCountFrameLocator(locator: string) {
        const countframecocos2 = await this.page.frameLocator("iframe").locator(locator).count();
        if (countframecocos2 == 0) {
            if (
                await this.page
                    .frameLocator("#frmGame")
                    .frameLocator("#microsite")
                    .frameLocator("#webview")
                    .locator(`${locator}[1]`)
                    .isVisible()
            ) {
                return await this.page
                    .frameLocator("#frmGame")
                    .frameLocator("#microsite")
                    .frameLocator("#webview")
                    .locator(locator)
                    .count();
            } else if (await this.page.frameLocator("#frmGame").frameLocator("iframe").locator(`${locator}[1]`).isVisible()) {
                return await this.page.frameLocator("#frmGame").frameLocator("iframe").locator(locator).count();
            } else if (await this.page.frameLocator("iframe").frameLocator("#webview").locator(`${locator}[1]`).isVisible()) {
                return await this.page.frameLocator("iframe").frameLocator("#webview").locator(locator).count();
            } else if (
                await this.page
                    .frameLocator('//iframe[contains(@title,"Gaming")]')
                    .frameLocator('//iframe[contains(@title,"Game")]')
                    .frameLocator("#webview")
                    .locator(`${locator}[1]`)
                    .isVisible()
            ) {
                return await this.page
                    .frameLocator('//iframe[contains(@title,"Gaming")]')
                    .frameLocator('//iframe[contains(@title,"Game")]')
                    .frameLocator("#webview")
                    .locator(`${locator}`)
                    .count();
            }
        }
        return countframecocos2;
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

    async waitForFreeSpin(settledResults: any) {
        const totalFreeSpin = settledResults.settlementResult?.freeSpins?.count ?? 0;

        for (let index = 0; index < totalFreeSpin; index++) {
            const newSettledResults = await this.waitForSettlement();
            await this.waitForFreeSpin(newSettledResults);
        }
    }

    async detectImageLocation(bigImagePath: string, smallImagePath: string, threshold: number = 10) {
        try {
            const [bigImage, smallImage] = await Promise.all([loadImage(bigImagePath) as any, loadImage(smallImagePath) as any]);

            const bigWidth = bigImage.width;
            const bigHeight = bigImage.height;
            const smallWidth = smallImage.width;
            const smallHeight = smallImage.height;

            // Iterate over the big image to find differences with the small image
            for (let y = 0; y < bigHeight - smallHeight; y++) {
                for (let x = 0; x < bigWidth - smallWidth; x++) {
                    let match = true;

                    // Compare the pixels of the small image with the corresponding region of the big image
                    for (let j = 0; j < smallHeight; j++) {
                        for (let i = 0; i < smallWidth; i++) {
                            const bigIndex = (bigWidth * (y + j) + (x + i)) << 2;
                            const smallIndex = (smallWidth * j + i) << 2;

                            // Compare RGBA values with the threshold
                            if (
                                !comparePixels(
                                    [
                                        bigImage.data[bigIndex],
                                        bigImage.data[bigIndex + 1],
                                        bigImage.data[bigIndex + 2],
                                        bigImage.data[bigIndex + 3],
                                    ],
                                    [
                                        smallImage.data[smallIndex],
                                        smallImage.data[smallIndex + 1],
                                        smallImage.data[smallIndex + 2],
                                        smallImage.data[smallIndex + 3],
                                    ],
                                    threshold,
                                )
                            ) {
                                match = false;
                            }
                        }
                    }

                    if (match) {
                        return { x: x + smallWidth / 2, y: y + smallHeight / 2 };
                    }
                }
            }

            console.log("Small image not found in the big image.");
            return null;
        } catch (error) {
            console.error("Error occurred while loading images:", error);
            return null;
        }
    }

    async click(locator: string, waittime = 500) {
        await this.page.locator(locator).click();
        await this.waitForTimeout(waittime);
    }

    async verifyImageLocators(expectSnapshot: object) {
        for (const key in expectSnapshot) {
            await expect(this.page.locator(key), { message: `${key} does not match expected screenshot` }).toHaveScreenshot(
                expectSnapshot[key],
                { animations: "disabled" },
            );
        }
    }

    async verifyValueLocators(expectedValue?: object) {
        for (const key in expectedValue) {
            expect(await this.page.locator(key).innerText(), { message: `${key} does not have text ${expectedValue}` }).toBe(
                expectedValue[key],
            );
        }
    }

    async verifyLocatorsVisible(locators: string[]) {
        for (const locator of locators) {
            expect(await this.page.locator(locator).isVisible(), { message: `${locator} is not visible` }).toBe(true);
        }
    }

    async verifyFrameLocatorsVisible(frame: string, locators: string[]) {
        const iframe = await this.page.frameLocator(frame);
        for (const locator of locators) {
            expect(await iframe.locator(locator).isVisible(), { message: `${locator} is not visible` }).toBe(true);
        }
    }

    async textLocatorShouldBe(locator: string, expectedValue: string) {
        await expect(this.page.locator(locator), { message: `${locator} does not have text ${expectedValue}` }).toHaveText(
            expectedValue.toString(),
        );
    }

    async getText(locator: string, datatype: string = "innerText") {
        if (datatype == "innerHTML") {
            return await this.page.locator(locator).innerHTML();
        } else {
            return await this.page.locator(locator).innerText();
        }
    }

    async verifyDateTimeFormat(locator: string) {
        const isTrue = isDateTimeFormat(await this.getText(locator));
        expect(isTrue).toBeTruthy();
    }

    async trackDownloadResources(page: Page) {
        page.on("request", async (request) => {
            try {
                const response = await request.response();

                if (response) {
                    const content = await response.body();
                    const resourceSize = content.byteLength;
                    const contentType = response.headers()["content-type"];

                    this.files.push([
                        request.url(),
                        contentType,
                        this.convertToMb(resourceSize),
                        new Date(request.timing().startTime).toString(),
                    ]);

                    this.totalDownloadSize += resourceSize;
                }
            } catch (error) {
                // console.log(`Error load file ${request.url()}`);
            }
        });
    }

    convertToMb(size: number) {
        return size / 1000 / 1000;
    }

    async checkDuplicatedFileName(inputlist: string[]) {
        const duplicateFiles: string[] = [];
        const encounteredFileNames: Set<string> = new Set();

        for (const file of inputlist) {
            const filename = file.substring(file.lastIndexOf("/") + 1).split(".");
            const fileNameWithExtension = filename[filename.length - 2] + "." + filename[filename.length - 1];
            if (encounteredFileNames.has(fileNameWithExtension)) {
                duplicateFiles.push(fileNameWithExtension);
            } else {
                encounteredFileNames.add(fileNameWithExtension);
            }
        }
        return duplicateFiles;
    }

    async getPlayerIdFromLocalStorage() {
        const local_storage_data = await this.page.evaluate(() => {
            const data: { [key: string]: string | null } = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    data[key] = localStorage.getItem(key);
                }
            }
            return data;
        });

        const storageKey = Object.keys(local_storage_data).find((key) => key.includes("scss"));
        const storageData = storageKey ? JSON.parse(local_storage_data[storageKey] || "{}") : null; // Default to empty object
        const [operatorId = "", playerId = ""] = (storageData?.username || "").split("_"); // Destructure with defaults
        return { operatorId, playerId };
    }

    async isCocosLocatorExists(nodeNameOrPath: string): Promise<boolean> {
        try {
            const result = await this.page.evaluate((nameOrPath) => {
                const cc = window.cc;
                if (!cc || !cc.find) return { success: false, message: 'Cocos Creator not found' };
                
                let targetNode = null;
                
                if (nameOrPath.includes('/')) {
                    // Try full path first
                    targetNode = cc.find(nameOrPath);
                    
                    // If not found and path starts with '/', try partial path matching
                    if (!targetNode && nameOrPath.startsWith('/')) {
                        const canvas = cc.find('Canvas');
                        if (!canvas) {
                            return { success: false, message: 'Canvas not found' };
                        }
                        
                        // Normalize partial path (remove leading slash if present)
                        const partialPath = nameOrPath.startsWith('/') ? nameOrPath.substring(1) : nameOrPath;
                        
                        // Function to get full path of a node from Canvas
                        const getNodePath = (node) => {
                            const path: string[] = [];
                            let current = node;
                            while (current) {
                                const name = current.name || current._name || '';
                                if (name) {
                                    path.unshift(name);
                                }
                                current = current.parent;
                                // Stop at Canvas
                                if (current && (current.name === 'Canvas' || current._name === 'Canvas')) {
                                    break;
                                }
                            }
                            return path.join('/');
                        };
                        
                        // Function to find node by partial path (path ends with partialPath)
                        const findByPartialPath = (parent) => {
                            if (!parent) return null;
                            
                            try {
                                const currentPath = getNodePath(parent);
                                // Check if current path ends with the partial path
                                if (currentPath.endsWith(partialPath)) {
                                    return parent;
                                }
                            } catch (e) {
                                // Ignore errors in path calculation
                            }
                            
                            // Check children
                            const children = parent.children || parent._children || [];
                            for (const child of children) {
                                const found = findByPartialPath(child);
                                if (found) return found;
                            }
                            return null;
                        };
                        
                        targetNode = findByPartialPath(canvas);
                    }
                } else {
                    const findNodeByName = (parent: any, targetName: string) => {
                        if (parent.name === targetName) {
                            return parent;
                        }
                        for (let i = 0; i < parent.children.length; i++) {
                            const found = findNodeByName(parent.children[i], targetName);
                            if (found) return found;
                        }
                        return null;
                    };
                    
                    const canvas = cc.find('Canvas');
                    if (!canvas) return { success: false, message: 'Canvas not found' };
                    targetNode = findNodeByName(canvas, nameOrPath);
                }
                
                if (!targetNode) {
                    return { success: false, message: 'Node not found' };
                }
                
                const isActive = (targetNode as any)._active;
                
                return {
                    success: true,
                    exists: true,
                    isActive: isActive,
                    nodeName: (targetNode as any).name
                };
            }, nodeNameOrPath);
            
            return result.success && result.exists && result.isActive;
            
        } catch (err) {
            console.error(`Error checking Cocos locator existence: ${(err as Error).message}`);
            return false;
        }
    }

     async dynamicClick(locator: any, timeout: number = 500): Promise<void> {
        if (typeof locator === 'string') {
            await this.clickCocos(locator, timeout);
        } else if (locator && typeof locator === 'object' && 'x' in locator && 'y' in locator) {
            await this.page.mouse.click(locator.x, locator.y);
            await this.waitForTimeout(timeout);
        }
    }

    async clickCocos(nodeNameOrPath, timeout = 250, clickMethod: 'auto' | 'button' | 'touch' | 'direct' = 'auto') {
        const result = await this.page.evaluate((params: { nodeNameOrPath: string; clickMethod: string }): { success: boolean; method?: string; message?: string } => {
            const { nodeNameOrPath, clickMethod } = params;
            const cc = window.cc;
            if (!cc || !cc.find) {
                return { success: false, message: 'Cocos Creator not found' };
            }
            // Find node by path or name
            let targetNode = null;
            if (nodeNameOrPath.includes('/')) {
                // Try full path first
                targetNode = cc.find(nodeNameOrPath);
                
                // If not found and path starts with '/', try partial path matching
                if (!targetNode && nodeNameOrPath.startsWith('/')) {
                    const canvas = cc.find('Canvas');
                    if (!canvas) {
                        return { success: false, message: 'Canvas not found' };
                    }
                    
                    // Normalize partial path (remove leading slash if present)
                    const partialPath = nodeNameOrPath.startsWith('/') ? nodeNameOrPath.substring(1) : nodeNameOrPath;
                    
                    // Function to get full path of a node from Canvas
                    const getNodePath = (node) => {
                        const path: string[] = [];
                        let current = node;
                        while (current) {
                            const name = current.name || current._name || '';
                            if (name) {
                                path.unshift(name);
                            }
                            current = current.parent;
                            // Stop at Canvas
                            if (current && (current.name === 'Canvas' || current._name === 'Canvas')) {
                                break;
                            }
                        }
                        return path.join('/');
                    };
                    
                    // Function to find node by partial path (path ends with partialPath)
                    const findByPartialPath = (parent) => {
                        if (!parent) return null;
                        
                        try {
                            const currentPath = getNodePath(parent);
                            // Check if current path ends with the partial path
                            if (currentPath.endsWith(partialPath)) {
                                return parent;
                            }
                        } catch (e) {
                            // Ignore errors in path calculation
                        }
                        
                        // Check children
                        const children = parent.children || parent._children || [];
                        for (const child of children) {
                            const found = findByPartialPath(child);
                            if (found) return found;
                        }
                        return null;
                    };
                    
                    targetNode = findByPartialPath(canvas);
                }
            }
            else {
                const canvas = cc.find('Canvas');
                if (!canvas) {
                    return { success: false, message: 'Canvas not found' };
                }
                const findByName = (parent, targetName) => {
                    if (!parent)
                        return null;
                    const nodeName = parent.name || parent._name;
                    if (nodeName === targetName) {
                        return parent;
                    }
                    const children = parent.children || parent._children || [];
                    for (const child of children) {
                        const found = findByName(child, targetName);
                        if (found)
                            return found;
                    }
                    return null;
                };
                targetNode = findByName(canvas, nodeNameOrPath);
            }
            if (!targetNode) {
                return { success: false, message: `Node not found: ${nodeNameOrPath}` };
            }
            const node = targetNode as any;
            const button1 = node.getComponent && node.getComponent(cc.Button);
            
            // Method 1: Try Button component clickEvents (if button exists, has clickEvents, and not FixedShapeButton)
            // Skip if node name contains "even<FixedShapeButton>" or button is FixedShapeButton type
            let isFixedShapeButton = false;
            try {
                // Check node name
                const nodeName = node.name || node._name || '';
                if (nodeName.includes('FixedShapeButton') || nodeName.includes('even<FixedShapeButton>')) {
                    isFixedShapeButton = true;
                    console.log('[clickCocos] FixedShapeButton detected by node name:', nodeName);
                }
                // Check button component type/name
                if (!isFixedShapeButton && button1) {
                    const buttonType = button1.constructor ? button1.constructor.name : '';
                    const buttonName = button1.name || '';
                    if (buttonType === 'FixedShapeButton' || buttonName === 'FixedShapeButton' || 
                        buttonType.includes('FixedShapeButton') || buttonName.includes('FixedShapeButton')) {
                        isFixedShapeButton = true;
                        console.log('[clickCocos] FixedShapeButton detected by button type/name:', buttonType, buttonName);
                    }
                }
                // Check if has FixedShapeButton component
                if (!isFixedShapeButton && node.getComponent) {
                    if (cc.FixedShapeButton && node.getComponent(cc.FixedShapeButton)) {
                        isFixedShapeButton = true;
                        console.log('[clickCocos] FixedShapeButton detected by component check');
                    }
                    // Also check by component name
                    if (!isFixedShapeButton) {
                        const components = node.getComponents && node.getComponents(cc.Component);
                        if (components) {
                            for (let i = 0; i < components.length; i++) {
                                const comp = components[i];
                                if (comp && (comp.constructor.name === 'FixedShapeButton' || comp.name === 'FixedShapeButton')) {
                                    isFixedShapeButton = true;
                                    console.log('[clickCocos] FixedShapeButton detected by component name');
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                console.log('[clickCocos] Error checking FixedShapeButton:', e);
            }

            // Method 1: Button clickEvents (emit)
            const tryMethod1 = () => {
                if (button1 && button1.clickEvents && button1.clickEvents.length > 0 && !isFixedShapeButton) {
                    // Try emit method first
                    for (const eventHandler of button1.clickEvents) {
                        if (eventHandler && eventHandler.emit) {
                            try {
                                eventHandler.emit([eventHandler.customEventData]);
                                return { success: true, method: 'Button.clickEvents.emit' };
                            }
                            catch (e) {
                                // Emit failed, continue to next handler
                            }
                        }
                    }
                }
                // If button has no clickEvents, try simple emit
                if (button1 && (!button1.clickEvents || button1.clickEvents.length === 0)) {
                    if (node.emit) {
                        try {
                            node.emit('click');
                            node.emit('touchstart');
                            node.emit('touchend');
                            return { success: true, method: 'Node.emit(click/touchstart/touchend)' };
                        }
                        catch (e) {
                            // Emit failed
                        }
                    }
                }
                return null;
            };

            // Method 2: Touch events with dispatchEvent
            const tryMethod2 = () => {
                let touchX = 0;
                let touchY = 0;
                if (node.getBoundingBoxToWorld) {
                    const boundingBox = node.getBoundingBoxToWorld();
                    touchX = boundingBox.x + boundingBox.width / 2;
                    touchY = boundingBox.y + boundingBox.height / 2;
                }
                else if (node.getPosition) {
                    const pos = node.getPosition();
                    touchX = pos.x || 0;
                    touchY = pos.y || 0;
                }
                else if (node.getWorldPosition) {
                    const worldPos = node.getWorldPosition();
                    touchX = worldPos.x || 0;
                    touchY = worldPos.y || 0;
                }
                const createTouchEvent = (type) => {
                    const touch = new cc.Touch(touchX, touchY, 0);
                    if (touch.setTouchInfo)
                        touch.setTouchInfo(touchX, touchY, 0);
                    if (touch.setLocation)
                        touch.setLocation(touchX, touchY);
                    const event = new cc.Event.EventTouch([touch], true);
                    event.type = type;
                    event.touch = touch;
                    event.bubbles = true;
                    if (event.setLocation)
                        event.setLocation(touchX, touchY);
                    return event;
                };
                const touchStart = createTouchEvent('touchstart');
                const touchEnd = createTouchEvent('touchend');
                // Try dispatch on target node first
                if (node.dispatchEvent) {
                    node.dispatchEvent(touchStart);
                    node.dispatchEvent(touchEnd);
                    return { success: true, method: 'Touch events (node.dispatchEvent)' };
                }
                // If node.dispatchEvent didn't work, try systemEvent
                if (cc.systemEvent) {
                    cc.systemEvent.emit('touchstart', touchStart);
                    cc.systemEvent.emit('touchend', touchEnd);
                    return { success: true, method: 'Touch events (cc.systemEvent)' };
                }
                // If both above didn't work, try parent node
                if (node.parent && node.parent.dispatchEvent) {
                    node.parent.dispatchEvent(touchStart);
                    node.parent.dispatchEvent(touchEnd);
                    return { success: true, method: 'Touch events (parent.dispatchEvent)' };
                }
                return null;
            };

            // Method 3: Direct method call
            const tryMethod3 = () => {
                if (button1 && button1.clickEvents && button1.clickEvents.length > 0 && !isFixedShapeButton) {
                    // Try direct method call
                    for (const eventHandler of button1.clickEvents) {
                        if (eventHandler && eventHandler.target && typeof eventHandler.handler === 'string') {
                            const handlerName = eventHandler.handler;
                            const customEventData = eventHandler.customEventData;
                            const handlerTarget = eventHandler.target;
                            // Try on target node
                            if (typeof handlerTarget[handlerName] === 'function') {
                                try {
                                    const customEventDataNum = parseInt(customEventData, 10);
                                    if (!isNaN(customEventDataNum)) {
                                        handlerTarget[handlerName](customEventDataNum);
                                    }
                                    else {
                                        handlerTarget[handlerName](customEventData);
                                    }
                                    return { success: true, method: 'Button.clickEvents.direct-call-on-target' };
                                }
                                catch (e) {
                                    // Continue to components
                                }
                            }
                            // Try on components
                            const components = handlerTarget.getComponents && handlerTarget.getComponents(cc.Component);
                            if (components) {
                                for (let i = 0; i < components.length; i++) {
                                    const comp = components[i];
                                    if (comp && typeof comp[handlerName] === 'function') {
                                        try {
                                            const customEventDataNum = parseInt(customEventData, 10);
                                            if (!isNaN(customEventDataNum)) {
                                                comp[handlerName].call(comp, customEventDataNum);
                                            }
                                            else {
                                                comp[handlerName].call(comp, customEventData);
                                            }
                                            return { success: true, method: `Button.clickEvents.direct-call-on-component[${i}]` };
                                        }
                                        catch (e) {
                                            // Continue to next component
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return null;
            };

            // Execute based on selected method
            if (clickMethod === 'button') {
                // Method 1 only
                const result = tryMethod1();
                if (result) return result;
            }
            else if (clickMethod === 'touch') {
                // Method 2 only
                const result = tryMethod2();
                if (result) return result;
            }
            else if (clickMethod === 'direct') {
                // Method 3 only
                const result = tryMethod3();
                if (result) return result;
            }
            else {
                // auto: Try all methods in order (1 -> 2 -> 3)
                const result1 = tryMethod1();
                if (result1) return result1;
                
                const result2 = tryMethod2();
                if (result2) return result2;
                
                const result3 = tryMethod3();
                if (result3) return result3;
            }
            
            return { success: false, method: 'No method available' };
        }, { nodeNameOrPath, clickMethod });
        if (result && result.method) {
            console.log(`${result.method} Node: ${nodeNameOrPath}`);
        }
        else if (result && result.message) {
            console.log(`[clickCocos] Node: ${nodeNameOrPath}, Error: ${result.message}`);
        }
        await this.waitForTimeout(timeout);
    }

    
    // Helper function to find node and return label text
    async findLabelText(nodeNameOrPath: string): Promise<string> {
        try {
          const result = await this.page.evaluate((nameOrPath) => {
            const cc = window.cc;
            if (!cc || !cc.find) return '';
            
            let targetNode = null;
            
            if (nameOrPath.includes('/')) {
              // Try full path first
              targetNode = cc.find(nameOrPath);
              
              // If not found and path starts with '/', try partial path matching
              if (!targetNode && nameOrPath.startsWith('/')) {
                  const canvas = cc.find('Canvas');
                  if (!canvas) {
                      return '';
                  }
                  
                  // Normalize partial path (remove leading slash if present)
                  const partialPath = nameOrPath.startsWith('/') ? nameOrPath.substring(1) : nameOrPath;
                  
                  // Function to get full path of a node from Canvas
                  const getNodePath = (node) => {
                      const path: string[] = [];
                      let current = node;
                      while (current) {
                          const name = current.name || current._name || '';
                          if (name) {
                              path.unshift(name);
                          }
                          current = current.parent;
                          // Stop at Canvas
                          if (current && (current.name === 'Canvas' || current._name === 'Canvas')) {
                              break;
                          }
                      }
                      return path.join('/');
                  };
                  
                  // Function to find node by partial path (path ends with partialPath)
                  const findByPartialPath = (parent) => {
                      if (!parent) return null;
                      
                      try {
                          const currentPath = getNodePath(parent);
                          // Check if current path ends with the partial path
                          if (currentPath.endsWith(partialPath)) {
                              return parent;
                          }
                      } catch (e) {
                          // Ignore errors in path calculation
                      }
                      
                      // Check children
                      const children = parent.children || parent._children || [];
                      for (const child of children) {
                          const found = findByPartialPath(child);
                          if (found) return found;
                      }
                      return null;
                  };
                  
                  targetNode = findByPartialPath(canvas);
              }
            } else {
              const findNodeByName = (parent: any, targetName: string) => {
                if (parent.name === targetName) {
                  return parent;
                }
                for (let i = 0; i < parent.children.length; i++) {
                  const found = findNodeByName(parent.children[i], targetName);
                  if (found) return found;
                }
                return null;
              };
              
              const canvas = cc.find('Canvas');
              if (!canvas) return '';
              targetNode = findNodeByName(canvas, nameOrPath);
            }
            
            if (!targetNode || !(targetNode as any)._active) {
              return '';
            }
    
            const label = (targetNode as any).getComponent(cc.Label);
            if (label) {
              return label.string;
            } else {
              const childLabel = (targetNode as any).getComponentInChildren(cc.Label);
              if (childLabel) {
                return childLabel.string;
              } else {
                return '';
              }
            }
          }, nodeNameOrPath);
    
          return result || '';
        } catch (err) {
          console.error(`Error finding label text: ${(err as Error).message}`);
          return '';
        }
    }

    // Helper function to check if label is clickable (has overflow = CLAMP or color = #3a97ff)
    async isLabelClickable(nodeNameOrPath: string): Promise<boolean> {
        try {
          const result = await this.page.evaluate((nameOrPath) => {
            const cc = window.cc;
            if (!cc || !cc.find) return false;
            
            let targetNode = null;
            
            if (nameOrPath.includes('/')) {
              // Try full path first
              targetNode = cc.find(nameOrPath);
              
              // If not found and path starts with '/', try partial path matching
              if (!targetNode && nameOrPath.startsWith('/')) {
                  const canvas = cc.find('Canvas');
                  if (!canvas) {
                      return false;
                  }
                  
                  // Normalize partial path (remove leading slash if present)
                  const partialPath = nameOrPath.startsWith('/') ? nameOrPath.substring(1) : nameOrPath;
                  
                  // Function to get full path of a node from Canvas
                  const getNodePath = (node) => {
                      const path: string[] = [];
                      let current = node;
                      while (current) {
                          const name = current.name || current._name || '';
                          if (name) {
                              path.unshift(name);
                          }
                          current = current.parent;
                          // Stop at Canvas
                          if (current && (current.name === 'Canvas' || current._name === 'Canvas')) {
                              break;
                          }
                      }
                      return path.join('/');
                  };
                  
                  // Function to find node by partial path (path ends with partialPath)
                  const findByPartialPath = (parent) => {
                      if (!parent) return null;
                      
                      try {
                          const currentPath = getNodePath(parent);
                          // Check if current path ends with the partial path
                          if (currentPath.endsWith(partialPath)) {
                              return parent;
                          }
                      } catch (e) {
                          // Ignore errors in path calculation
                      }
                      
                      // Check children
                      const children = parent.children || parent._children || [];
                      for (const child of children) {
                          const found = findByPartialPath(child);
                          if (found) return found;
                      }
                      return null;
                  };
                  
                  targetNode = findByPartialPath(canvas);
              }
            } else {
              const findNodeByName = (parent: any, targetName: string) => {
                if (parent.name === targetName) {
                  return parent;
                }
                for (let i = 0; i < parent.children.length; i++) {
                  const found = findNodeByName(parent.children[i], targetName);
                  if (found) return found;
                }
                return null;
              };
              
              const canvas = cc.find('Canvas');
              if (!canvas) return false;
              targetNode = findNodeByName(canvas, nameOrPath);
            }
            
            if (!targetNode || !(targetNode as any)._active) {
              return false;
            }
    
            const label = (targetNode as any).getComponent(cc.Label);
            let labelComponent = label;
            if (!labelComponent) {
              labelComponent = (targetNode as any).getComponentInChildren(cc.Label);
            }
            
            if (!labelComponent) {
              return false;
            }
            
            // Check overflow = CLAMP (value is 1 in Cocos Creator)
            const overflow = labelComponent.overflow;
            const isClamp = overflow === 1 || (cc.Label && cc.Label.Overflow && overflow === cc.Label.Overflow.CLAMP);
            
            // Check color = #3a97ff (RGB: 58, 151, 255)
            // Check both label component color and node color
            const labelColor = labelComponent.color;
            const nodeColor = labelComponent.node ? labelComponent.node.color : null;
            const isBlueColor = (labelColor && labelColor.r === 58 && labelColor.g === 151 && labelColor.b === 255) ||
                               (nodeColor && nodeColor.r === 58 && nodeColor.g === 151 && nodeColor.b === 255);
            
            return isClamp || isBlueColor;
          }, nodeNameOrPath);
    
          return result || false;
        } catch (err) {
          console.error(`Error checking label clickable: ${(err as Error).message}`);
          return false;
        }
    }

    async navigateToMicrositeIframe(timeout: number = 5000): Promise<void> {
        try {
            const iframeLocator = this.page.locator('iframe[id="microsite"]');
            
            if (await iframeLocator.count() === 0) return;
            
            await iframeLocator.waitFor({ timeout });
            
            const iframeSrc = await iframeLocator.getAttribute('src');
            
            if (iframeSrc) {
                await this.page.goto(iframeSrc);
                await this.page.waitForLoadState("load", { timeout });
                await this.page.waitForTimeout(timeout);
            }
        } catch (err) {
            // Silent fail
        }
    }

    /**
     * Get bounding box (x, y, width, height) of a Cocos locator
     * @param nodeNameOrPath - The Cocos node name or path
     * @returns Promise<{success: boolean, bounds?: {x: number, y: number, width: number, height: number}, error?: string}>
     */
    async getCocosBounds(nodeNameOrPath: string) {
        try {
            const result = await this.page.evaluate((nameOrPath) => {
                const cc = window.cc;
                if (!cc) return { success: false, message: 'Cocos Creator not found' };
                
                let targetNode = null;
                
                if (nameOrPath.includes('/')) {
                    targetNode = cc.find(nameOrPath);
                } else {
                    const findNodeByName = (parent: any, targetName: string) => {
                        if (parent.name === targetName) {
                            return parent;
                        }
                        for (let i = 0; i < parent.children.length; i++) {
                            const found = findNodeByName(parent.children[i], targetName);
                            if (found) return found;
                        }
                        return null;
                    };
                    
                    const canvas = cc.find('Canvas');
                    if (!canvas) return { success: false, message: 'Canvas not found' };
                    targetNode = findNodeByName(canvas, nameOrPath);
                }
                
                if (!targetNode || !(targetNode as any)._active) {
                    return { success: false, message: 'Node not found or not active' };
                }
                
                const canvas = cc.find('Canvas');
                const canvasElement = document.querySelector('canvas') || document.querySelector('#GameCanvas');
                
                if (!canvas || !canvasElement) {
                    return { success: false, message: 'Canvas not found' };
                }
                
                const canvasSize = canvas.getContentSize();
                const canvasRect = canvasElement.getBoundingClientRect();
                
                // Get node position and size
                const node = targetNode as any;
                const uiTransform = node.getComponent(cc.UITransform);
                
                if (!uiTransform) {
                    return { success: false, message: 'Node does not have UITransform component' };
                }
                
                const cocosX = node.position.x;
                const cocosY = node.position.y;
                const cocosWidth = uiTransform.width;
                const cocosHeight = uiTransform.height;
                
                // Convert Cocos coordinates to screen coordinates
                const screenX = canvasRect.left + (cocosX + canvasSize.width / 2) * (canvasRect.width / canvasSize.width);
                const screenY = canvasRect.top + (canvasSize.height / 2 - cocosY) * (canvasRect.height / canvasSize.height);
                const screenWidth = cocosWidth * (canvasRect.width / canvasSize.width);
                const screenHeight = cocosHeight * (canvasRect.height / canvasSize.height);
                
                return {
                    success: true,
                    bounds: {
                        x: screenX,
                        y: screenY,
                        width: screenWidth,
                        height: screenHeight
                    },
                    cocosBounds: {
                        x: cocosX,
                        y: cocosY,
                        width: cocosWidth,
                        height: cocosHeight
                    }
                };
            }, nodeNameOrPath);
            
            return result;
        } catch (err) {
            return { success: false, error: (err as Error).message };
        }
    }


    
    /**
     * Take screenshot of a Cocos locator
     * @param nodeNameOrPath - The Cocos node name or path
     * @param name - Name for the screenshot
     * @returns Promise<ImageSnapshot>
     */
    async screenshotCocosLocator(nodeNameOrPath: string, name: string): Promise<ImageSnapshot> {
        try {
            const boundsResult = await this.getCocosBounds(nodeNameOrPath);
            
            if (!boundsResult.success || !('bounds' in boundsResult) || !boundsResult.bounds) {
                const errorMsg = 'message' in boundsResult ? boundsResult.message : ('error' in boundsResult ? boundsResult.error : 'Unknown error');
                throw new Error(`Failed to get bounds: ${errorMsg}`);
            }
            
            const { x, y, width, height } = boundsResult.bounds;
            
            // Take screenshot of the specific area and save to current directory
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${name}_${timestamp}.png`;
            const filepath = `./${filename}`;
            
            const screenshot = await this.page.screenshot({
                clip: { x, y, width, height },
                path: filepath
            });
            
            console.log(`Screenshot saved to: ${filepath}`);
            
            return {
                name: name,
                image: screenshot,
                filepath: filepath
            } as ImageSnapshot & { filepath: string };
        } catch (err) {
            console.error(`Error taking screenshot of Cocos locator: ${(err as Error).message}`);
            return { name: name, image: Buffer.from("") };
        }
    }

    /**
     * Wait until a Cocos locator becomes active
     * @param nodeNameOrPath - The Cocos node name or path
     * @param maxAttempts - Maximum number of attempts (default: 300, which is 30 seconds with 100ms intervals)
     * @returns Promise<boolean> - Returns true if successful, false if timeout
     */
    async waitUntilCocosLocatorActive(
        nodeNameOrPath: string, 
        maxAttempts: number = 300
    ): Promise<boolean> {
        console.log(`Waiting for Cocos locator "${nodeNameOrPath}" to become active...`);
        
        for (let i = 0; i < maxAttempts; i++) {
            const isActive = await this.isCocosLocatorExists(nodeNameOrPath);
            
            if (isActive) {
                console.log(`Cocos locator "${nodeNameOrPath}" is now active`);
                return true;
            }
            
            await this.page.waitForTimeout(100);
        }
        
        console.log(`Timeout: Cocos locator "${nodeNameOrPath}" did not become active after ${maxAttempts} attempts`);
        return false;
    }

    /**
     * Wait until a Cocos locator becomes inactive
     * @param nodeNameOrPath - The Cocos node name or path
     * @param maxAttempts - Maximum number of attempts (default: 300, which is 30 seconds with 100ms intervals)
     * @returns Promise<boolean> - Returns true if successful, false if timeout
     */
    async waitUntilCocosLocatorInactive(
        nodeNameOrPath: string, 
        maxAttempts: number = 300
    ): Promise<boolean> {
        console.log(`Waiting for Cocos locator "${nodeNameOrPath}" to become inactive...`);
        
        for (let i = 0; i < maxAttempts; i++) {
            const isActive = await this.isCocosLocatorExists(nodeNameOrPath);
            
            if (!isActive) {
                console.log(`Cocos locator "${nodeNameOrPath}" is now inactive`);
                return true;
            }
            
            await this.page.waitForTimeout(100);
        }
        
        console.log(`Timeout: Cocos locator "${nodeNameOrPath}" did not become inactive after ${maxAttempts} attempts`);
        return false;
    }

}

function loadImage(path: string) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path)
            .pipe(new PNG())
            .on("error", reject)
            .on("parsed", function (this: any) {
                resolve(this); // Pass the PNG instance to resolve
            });
    });
}

function comparePixels(pixel1: number[], pixel2: number[], threshold: number): boolean {
    const [r1, g1, b1, a1] = pixel1;
    const [r2, g2, b2, a2] = pixel2;

    // Calculate the difference between RGBA values
    const diffR = Math.abs(r1 - r2);
    const diffG = Math.abs(g1 - g2);
    const diffB = Math.abs(b1 - b2);
    const diffA = Math.abs(a1 - a2);

    // Compare the differences with the threshold
    return diffR <= threshold && diffG <= threshold && diffB <= threshold && diffA <= threshold;
}

export interface Pos {
    x: number;
    y: number;
}

export function isDateTimeFormat(dateString: string) {
    // Regular expression for "hh:mm:ss dd/mm/yyyy" format
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\s(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;

    // Test the date string against the regex
    return regex.test(dateString);
}
