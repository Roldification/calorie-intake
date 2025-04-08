export type Column<RowType=unknown> = {
    name: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    field: string;
    style?: string | ((row: RowType) => string);
};

export type Intakes = {
    food: string;
    amount: number;
    uom: string;
    calories: number;
}

export type DailyIntake = {
    [key: string]: (Intakes & {timeTaken: Date})[];
}