export type Column<RowType = unknown> = {
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
  protein?: number;
  carbs?: number;
  fat?: number;
};

export type DailyIntake = {
  [key: string]: (Intakes & { timeTaken: Date })[];
};

export type FoodItem = {
  id: number;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  per: number;
  uom: string;
};
