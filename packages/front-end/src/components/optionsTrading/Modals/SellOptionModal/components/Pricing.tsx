import type { PricingProps } from "../types";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import FadeInOutQuick from "src/animation/FadeInOutQuick";
import { RyskCountUp } from "src/components/shared/RyskCountUp";
import { useGlobalContext } from "src/state/GlobalContext";

export const Pricing = ({ loading, positionData }: PricingProps) => {
  const {
    state: {
      collateralPreferences: { full, type },
      options: {
        liquidityPool: { utilisationHigh },
      },
    },
  } = useGlobalContext();

  const [collateralType, setCollateralType] = useState(type);
  const [collateralFull, setCollateralFull] = useState(full);

  const {
    breakEven,
    collateral,
    fee,
    hasRequiredCapital,
    liquidationPrice,
    now,
    premium,
    quote,
    remainingBalanceUSDC,
    remainingBalanceWETH,
    slippage,
  } = positionData;

  useEffect(() => {
    if (!loading) {
      setCollateralType(type);
      setCollateralFull(full);
    }
  }, [loading]);

  const errorMessage = useMemo(() => {
    const negativeBalance =
      (collateralType === "USDC" && remainingBalanceUSDC <= 0) ||
      (collateralType === "WETH" && remainingBalanceWETH <= 0);

    switch (true) {
      case negativeBalance && Boolean(quote):
        return "Final balance cannot be negative.";

      case !hasRequiredCapital && Boolean(quote):
        return "Insufficient balance to cover collateral.";

      case utilisationHigh:
        return "DHV utilisation is high. Some TXs may fail.";

      default:
        return "";
    }
  }, [collateralType, positionData]);

  return (
    <div className="w-3/5 mx-auto pt-2 pb-4">
      <span className="flex">
        <p className="mr-auto">{`Collateral required:`}</p>
        <AnimatePresence mode="wait">
          <motion.p
            className="font-medium"
            key={collateralType}
            {...FadeInOutQuick}
          >
            <RyskCountUp
              value={collateral}
              format={collateralType === "USDC" ? "USD" : "ETH"}
            />
            {collateralType === "USDC" ? ` USDC` : ` WETH`}
          </motion.p>
        </AnimatePresence>
      </span>

      <span
        className="flex pb-2 border-gray-600 border-b"
      >
        <p className="mr-auto">{`Liquidation Price:`}</p>
        <AnimatePresence mode="wait">
          <motion.p
            className="font-medium"
            key={collateralFull ? "full-enabled" : "full-disabled"}
            {...FadeInOutQuick}
          >
            <RyskCountUp
              fallback={collateralFull && quote ? "" : "-"}
              value={collateralFull && quote ? 0 : liquidationPrice}
            />
            {collateralFull && quote ? `Unliquidatable` : ` USDC`}
          </motion.p>
        </AnimatePresence>
      </span>

      <div>
        <span className="flex pt-2">
          <p className="mr-auto">{`Premium:`}</p>
          <p className="font-medium">
            <RyskCountUp value={premium} />
            {` USDC`}
          </p>
        </span>

        <span className="flex">
          <p className="mr-auto">{`Fee:`}</p>
          <p className="font-medium">
            <RyskCountUp value={fee} />
            {` USDC`}
          </p>
        </span>

        <span className="flex">
          <p className="mr-auto">{`Price impact:`}</p>
          <p className="font-medium">
            <RyskCountUp value={slippage} />
            {` %`}
          </p>
        </span>

        <small className="block leading-6 text-gray-600 border-gray-600 border-b">
          {`Premium and fees are per option.`}
        </small>
      </div>

      <span className="flex pt-2">
        <p className="mr-auto">{`Premium received:`}</p>
        <p className="font-medium">
          <RyskCountUp value={quote} />
          {` USDC`}
        </p>
      </span>

      <span className="flex">
        <p className="mr-auto">{`Break even:`}</p>
        <p className="font-medium">
          <RyskCountUp value={breakEven} />
          {` USDC`}
        </p>
      </span>

      <div>
        <span className="flex">
          <p className="mr-auto">{`Balances after:`}</p>
          <p className="font-medium">
            <RyskCountUp value={remainingBalanceUSDC} />
            {` USDC`}
          </p>
        </span>

        <span className="flex">
          <span className="mr-auto" />
          <p className="font-medium">
            <RyskCountUp value={remainingBalanceWETH} format="ETH" />
            {` WETH`}
          </p>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.small
            className="block leading-6 text-red-500 text-right"
            {...FadeInOutQuick}
          >
            {errorMessage}
          </motion.small>
        )}
      </AnimatePresence>

      <small className="flex flex-col pt-2 text-center leading-6 text-gray-600">
        {`Last updated: ${now}`}
      </small>
    </div>
  );
};
