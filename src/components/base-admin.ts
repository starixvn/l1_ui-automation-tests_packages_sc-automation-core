import type { Page } from "@playwright/test";
import type { WebSocket as PlaywrightWs } from "playwright-core";
import { GameEvent, waitForMessage, parseSocketPayload } from "../_shared";
import { loginAdmin } from "../auth/auth";
import { GameConfiguration } from "./game-configuration";
const w3cwebsocket = require("websocket").w3cwebsocket;
// import { io, Socket } from "socket.io-client";
import { decode, encode } from "notepack.io";
import { decodeJson } from "../_shared/socket-parser";

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
        const responseData = (await this.makeRequest("POST", admindomain.protocol + "//" + admindomain.hostname + "/jwt", requestHeader)) || "";
        return JSON.parse(responseData as string).token || "";
    }

    async makeRequest(requestType: string, url: string, jsonData: any): Promise<any> {
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
                { url, jsonData }
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

    async postData( url: string, data: string) {
        let response;
        // POST request
            response = await this.page.evaluate(async ({ url, data }) => {
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    body: data,
                });
                const responseData = await response.text();
                return responseData;
            }, { url, data });
        return response;
    }

    async getRunningRoundId(projectCode: any, gameName: string, authToken: string) {
        const gameNamelower = gameName.toLocaleLowerCase();
        let roundId;
      
        for (let i = 0; i <= 5; i++) {
          roundId = await new Promise((resolve) => {
            const socket = new w3cwebsocket(`wss://${projectCode}.lumigame.com/${gameNamelower}/socket.io/?EIO=4&transport=websocket`);
      
            socket.onopen = function () {
              const inGame = [
                `40/admin/${gameNamelower}`,
                `42/admin/${gameNamelower},["message",{"authentication":{"jwt":"${authToken}"}}]`,
                `42/admin/${gameNamelower},["message",{"${gameName}":{"get_time":true,"view":true,"get_new":true,"sync":true}}]`,
              ];
      
              for (const iterator of inGame) {
                if (socket.readyState === socket.OPEN) {
                  setTimeout(function () {
                    socket.send(iterator.toString());
                  }, 200);
                }
              }
            };
      
            socket.onmessage = function (event) {
              for (let index = 0; index <= 10; index++) {
                setTimeout(function () {
                  if (event.data.includes("roundId")) {
                    const parsedData = JSON.parse(event.data.replace(`42/admin/${gameNamelower},`, ""));
                    const gameData = parsedData[1][gameName];
                    if (gameData && gameData.roundId) {
                      resolve(gameData.roundId);
                      index = 10;
                    }
                  }
                }, 200);
              }
            };
      
            socket.onclose = () => {
                console.log('socket close');
                resolve(undefined);
            };
      
            setTimeout(() => {
              socket.close();
            }, 2000);
          });
      
          if (roundId) {
            break;
          }
        }
      
        return roundId;
      }

    async setGameResult(
        projectCode: any,
        gameName: string,
        authToken: string,
        settleRoundId: number,
        setledata: any,
        settleType: string = "ws"
    ) {
        const gameNamelower = gameName.toLocaleLowerCase();
        if (settleType === "ws") {
            let i = 0;
            let roundId;
            while (i <= 5) {
                // Retry once
                roundId = await new Promise((resolve) => {
                    const socket = new w3cwebsocket(
                        `wss://${projectCode}.lumigame.com/${gameNamelower}/socket.io/?EIO=4&transport=websocket`
                    );
                    socket.onopen = function () {
                        const inGame = [
                            `40/admin/${gameNamelower}`,
                            `42/admin/${gameNamelower},["message",{"authentication":{"jwt":"${authToken}"}}]`,
                            `42/admin/${gameNamelower},["message",{"${gameName}":{"get_time":true,"view":true,"get_new":true,"sync":true}}]`,
                            `42/admin/${gameNamelower},["message",{"${gameName}":{"set_result":{"result":${setledata},"roundId":${settleRoundId}}}}]`,
                            `42/admin/${gameNamelower},["message",{"${gameName}":{"set_result":{"result":${setledata},"roundId":${settleRoundId}}}}]`,
                        ];
                        for (const iterator of inGame) {
                            if (socket.readyState === socket.OPEN) {
                                setTimeout(function () {
                                    socket.send(iterator.toString());
                                }, 200);
                            }
                        }
                    };
                    socket.onmessage = function (event) {
                        for (let index = 0; index <= 10; index++) {
                            setTimeout(function () {
                                if (event.data.includes("roundId")) {
                                    const parsedData = JSON.parse(event.data.replace(`42/admin/${gameNamelower},`, ""));
                                    const gameData = parsedData[1][gameName];
                                    if (gameData && gameData.roundId) {
                                      resolve(gameData.roundId+1);
                                      index = 10;
                                    }
                                }
                            }, 100);
                        }
                    };
                    socket.onclose = () => {
                        resolve(undefined);
                    };
                    setTimeout(() => {
                        socket.close();
                    }, 2000);
                });
                if (roundId !== "N/A" && typeof roundId !== "undefined") {
                    break;
                }
                i += 1;
            }
            return roundId;
        } else {
            const domain = `https://${projectCode}.lumigame.com/monitoring/ResultMonitor/${gameName}`;
            await this.postData(domain, setledata);
        }
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

    async  getRunningRoundId1(gameName: string, authToken: string,msgpack:boolean = true) {
        console.log(gameName);
        let roundId;       
        for (let i = 0; i <= 5; i++) {
            roundId = await new Promise((resolve) => {
                const socket = new w3cwebsocket(`wss://l1uatproxy.sgamesuat.com/sit/sedie/socket.io/?EIO=4&transport=websocket`);
                socket.onopen = function () {
                    const inGame = [
                      `40/admin/sedie`,
                      `42/admin/sedie,["message",{"authentication":{"jwt":"${authToken}"}}]`,
                      `42/admin/sedie,["message",{"SeDie":{"get_time":true,"view":true,"get_new":true,"sync":true}}]`,
                    ];
            
                    for (const iterator of inGame) {
                      if (socket.readyState === socket.OPEN) {
                        setTimeout(function () {
                          socket.send(encode(iterator.toString()));
                        }, 200);
                      }
                    }
                  };

                socket.onmessage = function (event) {
                    for (let index = 0; index <= 10; index++) {
                        setTimeout(() => {
                            console.log(decode(event.data));
                            let data = decode(event.data);
                            if (data.includes("roundId")) {
                                console.log("data", data);
                                // const parsedData = decode(event.replace(`42/admin/${gameNamelower},`, ""));
                                // const gameData = parsedData[1][gameName];
                                // if (gameData && gameData.roundId) {
                                //     resolve(gameData.roundId);
                                //     index = 10;
                                // }
                            }
                        }, 200);
                    }
                };
                socket.onclose = () => {
                    resolve(undefined);
                };
                setTimeout(() => {
                    socket.close();
                }, 2000);
            });
            if (roundId) {
                break;
            }
        }

        return roundId;
    }

}
