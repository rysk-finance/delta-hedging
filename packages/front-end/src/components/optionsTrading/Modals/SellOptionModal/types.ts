import type { BigNumber } from "ethers";

import type { CallOrPut, CollateralType } from "src/state/types";

export interface PositionDataState {
  acceptablePremium: BigNumber;
  breakEven: number;
  callOrPut?: CallOrPut;
  collateral: number;
  expiry: string;
  fee: number;
  hasRequiredCapital: boolean;
  liquidationPrice: number;
  now: string;
  premium: number;
  quote: number;
  remainingBalanceUSDC: number;
  remainingBalanceWETH: number;
  requiredApproval: string;
  slippage: number;
  strike?: number;
}

export interface PricingProps {
  loading: boolean;
  positionData: PositionDataState;
}

export interface SymbolProps {
  positionData: PositionDataState;
}
