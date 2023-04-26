import type { PricingProps } from "../types";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import FadeInOutQuick from "src/animation/FadeInOutQuick";
import { RyskCountUp } from "src/components/shared/RyskCountUp";

export const Pricing = ({ loading, positionData, type }: PricingProps) => {
  const [collateralType, setCollateralType] = useState(type);

  useEffect(() => {
    if (!loading) {
      setCollateralType(type);
    }
  }, [loading]);

  const {
    collateral,
    fee,
    liquidationPrice,
    now,
    premium,
    quote,
    remainingBalanceUSDC,
    remainingBalanceWETH,
    slippage,
  } = positionData;

  return (
    <div className="w-3/5 mx-auto py-4">
      <div id="sell-price-per-option">
        <span className="flex">
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

      <span className="flex pt-2" id="sell-collateral-required">
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

      <span className="flex" id="sell-total-price">
        <p className="mr-auto">{`Liquidation Price:`}</p>
        <p className="font-medium">
          <RyskCountUp value={liquidationPrice} />
          {` USDC`}
        </p>
      </span>

      <span
        className="flex pb-2 border-gray-600 border-b"
        id="sell-total-price"
      >
        <p className="mr-auto">{`Premium received:`}</p>
        <p className="font-medium">
          <RyskCountUp value={quote} />
          {` USDC`}
        </p>
      </span>

      <div id="sell-balances">
        <span className="flex pt-2">
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

      <small className="flex flex-col pt-2 text-center leading-6 text-gray-600">
        {`Last updated: ${now}`}
      </small>
    </div>
  );
};
