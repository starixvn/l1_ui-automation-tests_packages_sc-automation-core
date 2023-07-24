import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";

export class TableGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected inGameUiTests() {
        test("GIVEN player joined game and saw dealer", async () => {
            // Act
            const dealerSnapshot = await this.game.captureDealer();

            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });
    }

    protected placeBet() {
        test("GIVEN player joined game and saw dealer", async () => {
            // Act
            const dealerSnapshot = await this.game.captureDealer();

            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });
    }

    protected GameGuide() {
        test("GIVEN player joined game and saw dealer", async () => {
            // Act
            const dealerSnapshot = await this.game.captureDealer();

            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
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
            locators: this.options.locators,
        });

        test.describe.serial(`${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario(): void {
        this.inGameUiTests();
    }
}
