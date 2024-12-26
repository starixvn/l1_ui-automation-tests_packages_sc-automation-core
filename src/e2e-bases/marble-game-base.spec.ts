import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";

const timeout = 4000;

export class MarbleGameBase {
    game: BaseGame;
    player: BasePlayer;
    constructor(protected options: IBaseOptions) {}

    protected maxBetTests() {
        test("Verify that player should get error when they reach max bet @MaxBet", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            let betChoices: any = this.options.multiPlaceBetChoices;
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(timeout / 4);
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
            }
            let i: number = 0,
                j: number = 0;
            while (i < 10) {
                await this.game.clickLocator("btnRightArrow");
                i++;
            }

            for (const iterator of betChoices) {
                this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(1000);
                const endBetMsg = await this.game.latestCaptureEvent(GameEvent.EndBet);
                // Assert
                expect(endBetMsg).toMatchObject({ endBet: -1, betChoice: iterator });
            }
            // post Act
            while (j < 10) {
                await this.game.clickLocator("btnLeftArrow");
                j++;
            }
        });
    }

    protected placebetSingleChoice() {
        test("Verify placebet and settlement flow on single choice @Settlement01", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.StartPlaceBet);
            await this.game.waitUntilPlaceBet();
            const { placeBetResponse, settledResults, roundId } =
                await test.step("Verify that the bet is successfully placed.", async () => {
                    // Act
                    const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
                    await this.game.waitForTimeout(this.options.waitBetTimeout);
                    const roundId = await this.game.getTextLocator("lblRoundId", "#0123456789");
                    const settledResults = await this.game.waitForSettlement();
                    return { placeBetResponse, settledResults, roundId };
                });
            // Assert
            await test.step("Confirm that the bet is settled correctly.", async () => {
                expect(placeBetResponse.endBet).toBe(bet.amount);
                expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
                expect(bet).toMatchWinning(settledResults);
                expect(roundId.includes(settledResults.roundId)).toBe(true);
            });

            await test.step("Verify ticket data.", async () => {
                await this.game.clickHistory(timeout);
                const roundId = await this.game.getTextLocator("historyRoundId", "#0123456789");
                // Assert
                expect(parseInt(roundId)).toBeCloseTo(parseInt(settledResults.roundId), -1);
            });

            await test.step("Verify ticket detail data.", async () => {
                await this.game.clickLocator("historyRoundId", 1500);
                const betdetaildata = [settledResults.roundId, settledResults.odds[bet.choice], bet.amount, settledResults.winAmount];
                const detailHistoryDefault = this.options.locators.find((item) => item.hasOwnProperty("detailhistory"));
                // Assert 2
                await verifyBetDetailtHeader(this.game, detailHistoryDefault.detailhistory);
                await verifyBetDetailtData(this.game, betdetaildata);

                //Post-Act
                await this.game.clickOutSide();
                await this.game.clickOutSide();
            });
        });
    }

    protected multipleBetChoices() {
        test("Verify player able to placebet multiple choices in 1 round @Settlement02", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.OwnBets);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            let betChoices: any = this.options.multiPlaceBetChoices;
            const amount = this.options.placeBetAmount ?? 1;
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(timeout / 4);
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
            }

            // Act
            let ownBets = await this.game.latestCaptureEvent(GameEvent.OwnBets);
            await this.game.waitForTimeout(this.options.waitBetTimeout);

            const settledResults = await this.game.waitForSettlement();
            let calWinAmount = 0;
            // Assert
            for (const iterator of betChoices) {
                const bet = { choice: iterator, amount: this.options.placeBetAmount ?? 1 };
                expect(ownBets.ownBets[iterator]).toBe(amount);
                let odds = settledResults.settlementResult[iterator] ? settledResults.odds[iterator] : 0;
                calWinAmount += bet.amount * odds;
            }
            expect(calWinAmount).toBe(settledResults.winAmount);
        });
    }

    protected returnGameLobby(): void {
        test("Verify player redirect to gamelooby after clicking home icon @Lobby01", async () => {
            // Act 1
            await this.game.waitForTimeout(2000);
            await this.game.clickHome(timeout / 2, "btnHome");
            await this.game.clickOutSide();
            await this.game.waitUntilGameLobbyUiLoad();
            const gamelobby = await this.game.capture("imgGameLobby");
            expect(gamelobby.image).toMatchSnapshot(gamelobby.name);
        });
    }

    protected turnbackGame(): void {
        test("Verify player able to go back game by clicking on game icon @Lobby02", async () => {
            // Act 1.
            await this.game.waitForTimeout(timeout / 2);

            const gameNavigate: any = this.options.gameLobbyNavigation;

            await this.game.clickLocator(gameNavigate[0], timeout);
            await this.game.clickLocator(gameNavigate[1]);
            await this.game.page.reload();
            await this.game.waitUntilGameUiLoad();
        });
    }

    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.options.snapshotFolderPath + "-snapshots/" + name;

                return snapshotPath;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: [this.options.locators],
        });

        test.describe.serial(`${this.options.gameConfiguration.name} E2E Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario(): void {
        this.maxBetTests();
        this.placebetSingleChoice();
        this.multipleBetChoices();
        this.returnGameLobby();
        this.turnbackGame();
    }
}

const verifyBetDetailtHeader = async (game: BaseGame, data: any) => {
    const pagecontent = await game.page.frameLocator("#microsite").frameLocator("#webview").locator("#game-ticket").innerHTML();
    for (const element of data) {
        expect(pagecontent.includes(element)).toBeTruthy();
    }
};

const verifyBetDetailtData = async (game: BaseGame, data: any) => {
    expect(
        await game.page
            .frameLocator("#microsite")
            .frameLocator("#webview")
            .locator('//*[@id="game-ticket"]/table[1]/tbody/tr/td[1]')
            .innerText(),
    ).toBe(data[0].toString());
    expect(
        await game.page
            .frameLocator("#microsite")
            .frameLocator("#webview")
            .locator('//*[@id="game-ticket"]/table[2]/tbody/tr[1]/td[3]')
            .innerText(),
    ).toBe(data[1].toString());
    expect(
        await game.page
            .frameLocator("#microsite")
            .frameLocator("#webview")
            .locator('//*[@id="game-ticket"]/table[2]/tbody/tr[1]/td[4]')
            .innerText(),
    ).toBe(data[2].toString());
    expect(
        await game.page
            .frameLocator("#microsite")
            .frameLocator("#webview")
            .locator('//*[@id="game-ticket"]/table[2]/tbody/tr[1]/td[5]')
            .innerText(),
    ).toBe(data[3].toString());
};
