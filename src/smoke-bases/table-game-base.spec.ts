import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { MiniGameBase } from "./mini-game-base.spec";

export class TableGameBase extends MiniGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: IBaseOptions) {
        super(options);
    }

    protected inGameDealerTests() {
        test("Ensure player joined game and saw dealer", async () => {
            // Act
            const dealerSnapshot = await this.game.captureDealer();
            test.step("Verify dealer's image", async () => {
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });
    });
    }

    protected override runScenario(): void {
        this.inGameDealerTests();

        super.runScenario();
    }
}
