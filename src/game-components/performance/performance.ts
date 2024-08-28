import { test, BaseGame } from "../../components";
// import { expect } from "../../expects";
// import { GameEvent } from "../../_shared";

export class performanceTest {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests() {
        test(`Verify the performance of loading game match requirements`, async () => {
            // Act 1
            await test.step("Expect first load time to be less than the configured time", async () => {
            });

            // Assert 1
            await test.step("Expect no duplicated files.", async () => {

            });
            //Post-Act
            await test.step("Warn about large image files", async () => {
     
            });
        });
    

}

}
