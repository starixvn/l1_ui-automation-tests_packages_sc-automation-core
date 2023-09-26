import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { baseLocatorNames } from "../components/base-game-locator";
import { GameGuides } from "../game-components/guides/guides.spec";

export class CardGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}

    protected inGameUiTests() {
        test("Verify the in-game UI should be displayed correctly on table: game name, buttons, hands, chips,Stake: 0 and no button display", async () => {
            // Act
            const gameUi = await this.game.capture(baseLocatorNames.imgGameName);
            // Assert
            expect(gameUi.image).toMatchSnapshot(gameUi.name);
        });

        test("Verify default state of chip bar", async () => {
            const chipbar = await this.game.capture(`defaultChipBar${process.env.npm_config_project}`);
            // Assert
            expect(chipbar.image).toMatchSnapshot(chipbar.name);
        });

        test("Verify list items after clicking on hambuger menu", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.clickLocator(baseLocatorNames.hamburgerMenu);

            // Act
            const lstMenuItems = await this.game.captureChoice(baseLocatorNames.lstMenuItems);

            // Assert
            expect(lstMenuItems.image).toMatchSnapshot(lstMenuItems.name);
            await this.game.clickOutSide();
        });
    }

    protected placebetandCancelBehavious() {
        test("Verify user can place bet and cancel bet on one hand", async () => {
            const betchoices = this.options.placeBetChoices[0];
            // Act
            await selectChoices(this.game, betchoices);

            // Act
            const btnCancel = await this.game.capture(baseLocatorNames.btnCancelChoice1);
            const lblTotalBet = await this.game.capture(baseLocatorNames.lblTotalBet);

            // Assert
            expect(btnCancel.image).toMatchSnapshot(btnCancel.name);
            expect(lblTotalBet.image).toMatchSnapshot(lblTotalBet.name);
            await cancelbet(this.game);
        });

        test("Verify user can place bet and cancel bet on multiple hands", async () => {
            // Act
            const lblDefaultTotalBet = await this.game.capture(baseLocatorNames.lblDefaultTotalBet);
            const betchoices = this.options.multiPlaceBetChoices;

            await selectChoices(this.game, betchoices);

            // Act
            const btnCancel1 = await this.game.capture(baseLocatorNames.btnCancelChoice1);
            const btnCancel2 = await this.game.capture(baseLocatorNames.btnCancelChoice2);
            const btnCancel3 = await this.game.capture(baseLocatorNames.btnCancelChoice3);

            const lblTotalBet = await this.game.capture(baseLocatorNames.lblTotalBet);

            // Assert
            expect(btnCancel1.image).toMatchSnapshot(btnCancel1.name);
            expect(btnCancel2.image).toMatchSnapshot(btnCancel2.name);
            expect(btnCancel3.image).toMatchSnapshot(btnCancel3.name);
            expect(lblTotalBet.image).toMatchSnapshot(lblTotalBet.name);
            await cancelbet(this.game);
            await this.game.clickLocator(baseLocatorNames.cancelbet, 1000);
            expect(lblDefaultTotalBet.image).toMatchSnapshot(lblDefaultTotalBet.name);
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

    protected runScenario() {
        this.inGameUiTests();
        this.placebetandCancelBehavious()
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }
}

const selectChoices = async (game: BaseGame, choices: any) => {
    for (let index = 0; index < choices.length; index++) {
        await game.clickLocator(choices[index]);
    }
};

const cancelbet = async (game: BaseGame) => {
    await game.clickLocator(baseLocatorNames.btnCancel, 1000);
};
