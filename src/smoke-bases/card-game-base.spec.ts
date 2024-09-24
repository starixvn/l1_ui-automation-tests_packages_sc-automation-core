import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { performanceTest } from "../game-components/performance/performance";
import { GameGuides } from "../game-components/guides/guides.spec";
const projectName = process.env.npm_config_project?.includes("l1")? "SG" : process.env.npm_config_project?.includes("l2")? "VG" : process.env.npm_config_project;

export interface CardGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class CardGameBase {
    game: BaseGame;
    player: BasePlayer;
    performanceTest: performanceTest = new performanceTest();
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: CardGameOptions) {}

    protected inGameBetChoiceTests() {
        test("AND bet choices should be displayed on table", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(this.options.waitBetTimeout);

            for (const placeBetChoice of this.options.placeBetChoices) {
                // Act
                const betChoice = await this.game.captureChoice(placeBetChoice);

                // Assert
                expect(betChoice.image).toMatchSnapshot(betChoice.name);
            }
        });
    }

    protected inGameOddsTests() {
        test("AND odds should be correct", async () => {
            // Assert

            expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);

            // Act
            const placebetdeal = await this.player.placeBet(bet.choice, bet.amount);
            let endDeal = await this.game.latestCaptureEvent(GameEvent.Deal).deal;
            const isdealerPontoon = endDeal.dealer.length == 0 ? false : true;
            const playertotal = Math.max(endDeal.hands[0].total[0], endDeal.hands[0].total[1] ?? 0);

            // Assert
            expect(placebetdeal.deal.hands[0].bet).toBe(bet.amount);
            expect(placebetdeal.deal.hands[0].pos).toBe(parseInt(bet.choice));
            if (isdealerPontoon == false && playertotal < 21){
                const settledResults = await this.player.standCard();
                expect(settledResults.stand.pos).toBe(parseInt(bet.choice));
                expect(settledResults.stand.bet).toBe(bet.amount);
            }
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            const historyPayload = await this.player.openHistory();

            // Act
            const historySnapshot = await this.game.captureHistory();

            // Assert
            expect(historyPayload.history.betLogs.length).toBeGreaterThan(0);
            expect(historySnapshot.image).toMatchSnapshot(historySnapshot.name);

            //Post-act
            await this.game.clickOutSide();
        });
    }

    protected gameGuideTests() {
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
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
            locators: this.options.locators,
        });

        test.describe.serial(`${projectName} - ${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.performanceTest.init(this.game);
                this.gameGuides.init(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        if (process.env.npm_config_trackdownload) {
            this.performanceTest.tests(this.options.gameConfiguration.ssoTime??35000);
        }
        this.inGameBetChoiceTests();
        this.inGameOddsTests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.gameGuideTests()
    }
}
