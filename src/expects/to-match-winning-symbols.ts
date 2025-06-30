const toMatchWinningSymbols = (bet: any, settledResult: any) => {
    let expectedAmount = 0;

    if (settledResult.winAmount > 0) {
        for (const iterator of settledResult.settlementResult.winningLines) {
            expectedAmount = bet.amount * settledResult.odds[iterator.symbol][iterator.count] + expectedAmount;
        }
        expectedAmount = Math.round(expectedAmount * 10000)/10000;
    }

    if (expectedAmount === settledResult.winAmount) {
        return {
            message: () => "passed",
            pass: true,
        };
    }

    return {
        message: () => `failed. Expected ${expectedAmount} but received ${settledResult.winAmount}`,
        pass: false,
    };
};

export default toMatchWinningSymbols;
