import type {
  CellProps,
  IVProps,
  QuoteProps,
  DeltaProps,
  PositionProps,
  ExposureProps,
  StrikeProps,
} from "./types";

import { getColorClasses } from "../../utils/getColorClasses";
import { RyskCountUp } from "src/components/shared/RyskCountUp";

export const Cell = ({
  children,
  ethPrice,
  option,
  side,
  selectedOption,
  cellClasses,
}: CellProps) => {
  const tdColorClasses = getColorClasses(
    option,
    side,
    selectedOption,
    ethPrice
  );

  return (
    <td
      className={`py-4 xl:py-3 px-1 xl:px-2 ${cellClasses} ${tdColorClasses}`}
    >
      {children}
    </td>
  );
};

export const IV = ({ value }: IVProps) => {
  return (
    <span className={value ? "after:content-['%'] after:ml-1" : ""}>
      <RyskCountUp value={value} />
    </span>
  );
};

export const Quote = ({ clickFn, disabled, value }: QuoteProps) => {
  return (
    <button
      className={`${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } py-4 xl:py-3 px-1 xl:px-2 w-full text-right before:content-['$'] before:mr-1`}
      onClick={clickFn}
      disabled={disabled}
    >
      <RyskCountUp value={value} />
    </button>
  );
};

export const Delta = ({ value }: DeltaProps) => {
  return (
    <span>
      <RyskCountUp value={value} />
    </span>
  );
};

export const Position = ({ value }: PositionProps) => {
  return (
    <span>
      <RyskCountUp value={value} />
    </span>
  );
};

export const Exposure = ({ value }: ExposureProps) => {
  return (
    <span>
      <RyskCountUp value={value} />
    </span>
  );
};

export const Strike = ({ value }: StrikeProps) => {
  return (
    <td className="text-center bg-bone-dark !border-0 font-medium py-4 xl:py-3 px-1 xl:px-2">
      <span>
        <RyskCountUp value={value} format="Integer" />
      </span>
    </td>
  );
};
