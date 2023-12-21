import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { expect } from "../expects";

import { IBaseOptions } from "./base-options";

export class RERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;


    constructor(protected options: IBaseOptions) {}

    protected verifyRetrieveEndRound() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);

        });

        admintest("Verify case roundId is archived", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        admintest("Verify case Player has ticket on roundId is running", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        admintest("Verify case Player placebet 1 choice and win", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        admintest("Verify case Player placebet multiples choices and win", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        admintest("Verify case Player placebet 1 choice and lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        });

        admintest("Verify case Player placebet multiples choices and lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
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
            locators: this.options.locators,
        });

        admintest.describe.serial(`${this.options.gameConfiguration.name} Admin Tests`, () => {
            admintest.beforeAll(async ({ baseGame,baseAdmin}) => {
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
