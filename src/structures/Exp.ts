export abstract class ExpUtility {
    public static level(exp: number): number {
        return this.inverseExpFunction(exp);
    }

    public static ExpToNextLevel(exp: number): number {
        return Math.ceil(this.expFunction(this.level(exp) + 1) - exp);
    }

    public static ExpThroughLevel(exp: number): number {
        const level = this.inverseExpFunction(exp);
        const baseXp = this.expFunction(level);
        return exp - baseXp;
    }

    public static currentLevelData(exp: number): { percent: number; current: number; req: number } {
        const current = this.ExpThroughLevel(exp);
        const toNext = this.ExpToNextLevel(exp);
        return { current: current, req: toNext, percent: current / (current + toNext) };
    }

    /**
     * Returns cumulative xp required to reach a level
     * @param x the level
     * @returns the cumulative xp to reach this level
     */
    private static expFunction(x: number) {
        return 8000 * (1 + 0.045) ** x - 8000;
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
