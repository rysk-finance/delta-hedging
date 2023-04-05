import type { PricingProps } from "../types";

import { AnimatePresence, motion } from "framer-motion";

import FadeInOut from "src/animation/FadeInOut";
import { RyskCountUp } from "src/components/shared/RyskCountUp";

export const Pricing = ({ positionData }: PricingProps) => {
  const { created, inProfit, now, title, totalPaid, totalValue } = positionData;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        className="flex flex-col"
        key="price-data"
        {...FadeInOut(0.1)}
      >
        <p className="text-center py-4 bg-white border-b-2 border-black font-dm-mono">
          {title}
        </p>

        <span className="flex mx-auto py-4">
          <p className="mr-2">
            {`Price paid: $ `}
            <RyskCountUp value={totalPaid} />
          </p>
          <small className="leading-6 text-gray-600">{`Last updated: ${created}`}</small>
        </span>

        <span
          className={`flex mx-auto pb-4 ${
            inProfit ? "text-green-700" : "text-red-700"
          }`}
        >
          <p className="mr-2">
            {`Current value: $ `}
            <RyskCountUp value={totalValue} />
          </p>
          <small className="leading-6 text-gray-600">{`Last updated: ${now}`}</small>
        </span>
      </motion.span>
    </AnimatePresence>
  );
};
