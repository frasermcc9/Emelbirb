export interface IActiveBadges {
    p1: string | null;
    p2: string | null;
    p3: string | null;
    p4: string | null;
    p5: string | null;
}

export interface IBadge {
    name: string;
    uri: string;
    tier: number;
    description: string;
}
