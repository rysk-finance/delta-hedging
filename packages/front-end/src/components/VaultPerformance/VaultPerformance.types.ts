import type { BigNumberish } from "ethers";

interface PricePerShareEpoch {
  epoch: string;
  ethPrice: BigNumberish;
  growthSinceFirstEpoch: string;
  predictedGrowthSinceFirstEpoch?: string;
  timestamp: string;
  value: BigNumberish;
  __typename: string;
}

export interface QueryData {
  pricePerShares: PricePerShareEpoch[];
}

export interface ChartData
  extends Omit<
    PricePerShareEpoch,
    | "growthSinceFirstEpoch"
    | "predictedGrowthSinceFirstEpoch"
    | "value"
    | "ethPrice"
  > {
  ethPrice: number;
  predictedEthPrice: number | null;
  growthSinceFirstEpoch: number;
  predictedGrowthSinceFirstEpoch: number | null;
  isPrediction: boolean;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    payload: {
      epoch: string;
      isPrediction: boolean;
    };
    value: number;
  }[];
  label?: string;
}

export interface CustomLegendProps {
  payload?: { color: string; value: string }[];
}

export interface ChartProps {
  chartData: ChartData[];
}
