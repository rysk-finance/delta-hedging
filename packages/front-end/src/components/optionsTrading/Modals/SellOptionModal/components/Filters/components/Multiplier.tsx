import type { ChangeEvent } from "react";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { Close, Minus, Plus } from "src/Icons";
import { useGlobalContext } from "src/state/GlobalContext";
import { ActionType } from "src/state/types";

export const Multiplier = () => {
  const {
    dispatch,
    state: { collateralPreferences },
  } = useGlobalContext();

  const [multiplier, setMultiplier] = useState(collateralPreferences.amount);
  const [debouncedMultiplier] = useDebounce(multiplier, 300);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const amount = event.currentTarget.value;
    const decimals = amount.split(".");
    const rounded =
      decimals.length > 1
        ? `${decimals[0]}.${decimals[1].slice(0, 2)}`
        : event.currentTarget.value;

    setMultiplier(parseFloat(rounded));
  };

  const handleInputBlur = () => {
    if (multiplier < 1.1) setMultiplier(1.1);
  };

  useEffect(() => {
    dispatch({
      type: ActionType.SET_COLLATERAL_PREFERENCES,
      collateralPreferences: {
        ...collateralPreferences,
        amount: debouncedMultiplier,
      },
    });
  }, [debouncedMultiplier]);

  const handleMultiplierChange = (operation: "add" | "sub") => () => {
    if (operation === "add") {
      const amount = Math.floor(multiplier * 10 * 1.1) / 10;
      setMultiplier(amount);
    }

    if (operation === "sub") {
      const amount = Math.ceil((multiplier * 10) / 1.1) / 10;
      setMultiplier(amount);
    }
  };

  return (
    <div className="flex h-11 bg-white border border-gray-600 w-fit rounded-full">
      <button
        className="w-11 border-r border-gray-600/40 rounded-l-full disabled:cursor-not-allowed disabled:bg-gray-600/10"
        disabled={multiplier <= 1.1 || collateralPreferences.full}
        onClick={handleMultiplierChange("sub")}
      >
        <Minus className="w-4 h-4 mx-auto" />
      </button>
      <span className="relative flex h-full">
        <input
          className="w-16 h-full px-2 number-input-hide-arrows disabled:cursor-not-allowed font-dm-mono"
          disabled={collateralPreferences.full}
          inputMode="numeric"
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          step={0.1}
          type="number"
          value={multiplier}
        />
        <Close
          className={`absolute ${
            multiplier % 1 ? "right-1" : "right-6"
          } top-[0.9rem] h-4 w-4 pointer-events-none`}
        />
      </span>
      <button
        className="w-11 border-l border-gray-600/40 rounded-r-full disabled:cursor-not-allowed disabled:bg-gray-600/10 "
        disabled={collateralPreferences.full}
        onClick={handleMultiplierChange("add")}
      >
        <Plus className="w-4 h-4 mx-auto" />
      </button>
    </div>
  );
};
