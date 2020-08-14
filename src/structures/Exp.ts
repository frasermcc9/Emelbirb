export abstract class ExpUtility {
    public static level(exp: number): number {
        return this.inverseExpFunction(exp);
    }

    public static ExpToNextLevel(exp: number): number {
        return Math.ceil(this.expFunction(this.level(exp) + 1) - exp);
    }

    /**
     * Returns cumulative xp required to reach a level
     * @param x the level
     * @returns the cumulative xp to reach this level
     */
    private static expFunction(x: number) {
        return (5 / 9) * (x + 1) * (x ** 2 - 4 * x + 400);
    }
    /**
     * Returns the level that a player with experience `x` would be
     * @param x the cumulative xp of the player
     * @returns the level that the player would be
     */
    private static inverseExpFunction(x: number) {
        for (let i = 0; ; i++) {
            if (this.expFunction(i) > x) {
                return Math.max(i - 1, 0);
            }
        }
    }
}
