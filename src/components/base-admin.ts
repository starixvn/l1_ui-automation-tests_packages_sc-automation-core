import type { Page } from "@playwright/test";
import type { WebSocket as PlaywrightWs } from "playwright-core";
import { GameEvent, waitForMessage, parseSocketPayload } from "../_shared";
import { loginAdmin } from "../auth/auth";
import { GameConfiguration } from "./game-configuration";
import * as adminLocator from "./base-admin-locator";

export class BaseAdmin {
    readonly page: Page;
    readonly gameConfiguration: GameConfiguration;

    msgpack: boolean;
    gameSocket: PlaywrightWs;
    capturedEvents: any;
    odds: any = null;

    constructor(page: Page, gameConfiguration: GameConfiguration) {
        this.page = page;
        this.gameConfiguration = gameConfiguration;
        this.capturedEvents = {};
    }

    async login() {
        const projectCode = process.env.npm_config_project ?? "l1";

        await loginAdmin(this.page, projectCode);
        this.msgpack = false;
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

    async waitForTimeout(time = 1000): Promise<void> {
        await this.page.waitForTimeout(time);
    }

    async clickLocator(element: string, wait = 500): Promise<void> {
        await this.page.click(element);
        await this.waitForTimeout(wait);
    }

    async selectOption(element: string, value: string): Promise<void> {
        await this.page.selectOption(element, { value: value });
    }

    async getCountFrameLocator(locator: string) {
        const countframecocos2 = await this.page.frameLocator("iframe").locator(locator).count();
        const returnvalue =
            countframecocos2 == 0
                ? await this.page.frameLocator("iframe").frameLocator("#webview").locator(locator).count()
                : countframecocos2;
        return returnvalue;
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

    async openGameMonitor(gameName: string) {
        await this.page.click(`//*[@data-game-name="${gameName}"]`);
    }

    async getWsToken(gameName: any) {
        const requestHeader = {
            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.48 Safari/537.36",
            game: gameName.toLowerCase(),
        };
        const currentPageUrl = this.page.url();
        const admindomain = new URL(currentPageUrl);
        const responseData =
            (await this.makeJsonRequest("POST", admindomain.protocol + "//" + admindomain.hostname + "/jwt", requestHeader)) || "";
        return JSON.parse(responseData as string).token || "";
    }

    async makeJsonRequest(requestType: string, url: string, jsonData: any): Promise<any> {
        let response;
        // POST request
        if (requestType === "POST") {
            response = await this.page.evaluate(
                async ({ url, jsonData }) => {
                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(jsonData),
                    });

                    const responseData = await response.text();
                    return responseData;
                },
                { url, jsonData },
            );
        }
        // GET request
        else if (requestType === "GET") {
            response = await this.page.evaluate(async (url) => {
                const response = await fetch(url);
                const responseData = await response.text();
                return responseData;
            }, url);
        }
        // Invalid request type
        else {
            console.log("Invalid request type.");
        }
        return response;
    }

    async postData(url: string, data: string) {
        let response;
        // POST request
        response = await this.page.evaluate(
            async ({ url, data }) => {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                    body: data,
                });
                const responseData = await response.text();
                return responseData;
            },
            { url, data },
        );
        return response;
    }

    async getRunningRoundId(context: any, gameId: number, mornitorlocator?: string) {
        const admindomain = new URL(this.page.url());
        const monitoring = admindomain.protocol + "//" + admindomain.hostname + "/GameSettings/GameMonitor";
        await this.page.goto(monitoring);
        const mornitorLocator = mornitorlocator ?? adminLocator.monitoring[gameId];
        await this.page.focus(mornitorLocator);
        const [newtab] = await Promise.all([context.waitForEvent("page"), await this.page.click(mornitorLocator)]);
        await newtab.waitForLoadState();
        await newtab.waitForSelector(adminLocator.commonUiResult.lblroundId, { state: "visible" });
        let roundId = await newtab.locator(adminLocator.commonUiResult.lblroundId).innerText();
        roundId = Number(roundId.replace("#", ""));
        await newtab.close();
        return Number(roundId);
    }

    async gnGetRunningRoundId(context: any, gameId: number, mornitorlocator?: string) {
        const admindomain = new URL(this.page.url());
        const monitoring = admindomain.protocol + "//" + admindomain.hostname + "/GameSettings/GameMonitor";
        await this.page.goto(monitoring);
        const mornitorLocator = mornitorlocator ?? adminLocator.monitoring[gameId];
        await this.page.focus(mornitorLocator);
        const [newtab] = await Promise.all([context.waitForEvent("page"), await this.page.click(mornitorLocator)]);
        await newtab.waitForLoadState();
        await newtab.waitForSelector(adminLocator.commonUiResult.gnlblroundId, { state: "visible" });
        let roundId = await newtab.locator(adminLocator.commonUiResult.lblroundId).innerText();
        roundId = Number(roundId.split("#")[1]);
        await newtab.close();
        return Number(roundId);
    }

    async postGameResult(settleDomain: any, settlePath: string, setledata: any) {
        const domain = `https://${settleDomain}.lumigame.com/monitoring/ResultMonitor/${settlePath}`;
        await this.postData(domain, setledata);
    }

    async OpenMonitoring(context: any, gameId: number, mornitorlocator?: string) {
        const admindomain = new URL(this.page.url());
        const monitoring = admindomain.protocol + "//" + admindomain.hostname + "/GameSettings/GameMonitor";
        await this.page.goto(monitoring);
        const mornitorLocator = mornitorlocator ?? adminLocator.monitoring[gameId];
        await this.page.focus(mornitorLocator);
        const [newtab] = await Promise.all([context.waitForEvent("page"), await this.page.click(mornitorLocator)]);
        await newtab.waitForLoadState();
        return newtab;
    }

    async gnSetUiGameResult(context: any, gameId: number, data: object, mornitorlocator?: string) {
        const admindomain = new URL(this.page.url());
        const monitoring = admindomain.protocol + "//" + admindomain.hostname + "/GameSettings/GameMonitor";
        await this.page.goto(monitoring);
        const mornitorLocator = mornitorlocator ?? adminLocator.monitoring[gameId];
        await this.page.focus(mornitorLocator);
        const [newtab] = await Promise.all([context.waitForEvent("page"), await this.page.click(mornitorLocator)]);
        await newtab.waitForLoadState();
        await newtab.waitForSelector(adminLocator.commonUiResult.gnlblroundId, { state: "visible" });
        for (const [key, value] of Object.entries(data)) {
            await newtab.fill(key, value);
            await newtab.waitForTimeout(200);
        }
        await newtab.click(adminLocator.commonUiResult.btnSubmit);
        await newtab.close();
    }

    async getRetrieveEndRound(gameType: any, roundId: any, playerId: any, operatorId: string = "ONEworks1") {
        const currentPageUrl = this.page.url();
        const admindomain = new URL(currentPageUrl);

        const inItRequest = {
            url: admindomain.protocol + "//" + admindomain.hostname + "/RetrieveEndRound/Index",
            body: `OperatorId=${operatorId}&GameType=${gameType}&RoundId=${roundId}&PlayerId=${playerId}&Language=en-US`,
        };
        let response = await this.page.evaluate(async (inItRequest) => {
            const requestOptions = {
                method: "POST",
                body: inItRequest.body,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                },
            };
            const response = await fetch(inItRequest.url, requestOptions);
            const responseData = await response.text();
            return responseData;
        }, inItRequest);
        return JSON.parse(response);
    }

    async filterBetDetails(context: any, gameType: any, roundId: any, playerId: any, operatorId: string = "ONEworks1") {
        const admindomain = new URL(this.page.url());
        const monitoring = admindomain.protocol + "//" + admindomain.hostname + "/BetDetails";
        await this.page.goto(monitoring);
        await this.page.waitForSelector(adminLocator.commonUiBetDetails.btnGetBetDetails, { state: "visible" });
        await this.page.locator(adminLocator.commonUiBetDetails.optOperatorId).selectOption({ value: operatorId });
        await this.page.locator(adminLocator.commonUiBetDetails.optGameType).selectOption({ value: gameType.toString() });
        await this.page.fill(adminLocator.commonUiBetDetails.inpRoundId, roundId.toString());
        await this.page.fill(adminLocator.commonUiBetDetails.inpPlayerId, playerId.toString());
        const [newtab] = await Promise.all([
            context.waitForEvent("page"),
            await this.page.click(adminLocator.commonUiBetDetails.btnGetBetDetails),
        ]);
        await newtab.waitForLoadState();
        await newtab.waitForTimeout(2000);
        return newtab;
    }
}

export function convertDateTimeToGMTMinus4(dateTime: string): string {
    const gmtPlus7Offset = 7 * 60 * 60 * 1000; // GMT+7 offset in milliseconds
    const gmtMinus4Offset = -4 * 60 * 60 * 1000; // GMT-4 offset in milliseconds

    const inputDateTime = new Date(dateTime);
    const gmtPlus7DateTime = new Date(inputDateTime.getTime() + gmtPlus7Offset);
    const gmtMinus4DateTime = new Date(gmtPlus7DateTime.getTime() + gmtMinus4Offset);

    const hours = gmtMinus4DateTime.getUTCHours().toString().padStart(2, "0");
    const minutes = gmtMinus4DateTime.getUTCMinutes().toString().padStart(2, "0");
    const seconds = gmtMinus4DateTime.getUTCSeconds().toString().padStart(2, "0");
    const day = gmtMinus4DateTime.getUTCDate().toString().padStart(2, "0");
    const month = (gmtMinus4DateTime.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = gmtMinus4DateTime.getUTCFullYear().toString();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}
