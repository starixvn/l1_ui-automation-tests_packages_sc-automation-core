import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { expect } from "../expects";

import { IBaseOptions } from "./base-options";

export class RERGameBase {
    game: BaseGame;
    player: BasePlayer;
    admin: BaseAdmin;


    constructor(protected options: IBaseOptions) {}

    protected verifyRetrieveEndRound() {
        test("Verify case Player has ticket on roundId is running", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.admin.getWsToken("a","a")
            await this.game.clickOutSide()

        });

        test("Verify case roundId is archived", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        test("Verify case Player has ticket on roundId is running", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        test("Verify case Player placebet 1 choice and win", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        test("Verify case Player placebet multiples choices and win", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        test("Verify case Player placebet 1 choice and lose", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        test("Verify case Player placebet multiples choices and lose", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
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

        test.describe.serial(`${this.options.gameConfiguration.name} Admin Tests`, () => {
            test.beforeAll(async ({ baseGame},{baseAdmin}) => {
                this.game = baseGame;
                this.admin = baseAdmin;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.verifyRetrieveEndRound();
    
    }
}
