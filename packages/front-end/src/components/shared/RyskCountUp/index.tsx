import type { RyskCountUpProps } from "./types";

import { useEffect, useState } from "react";
import { CountUp } from "use-count-up";
import { v4 } from "uuid";

import { RyskCountUpDecimals } from "./constants";

export const RyskCountUp = ({
  value = 0,
  fallback = "-",
  format = "USD",
  prefix = "",
}: RyskCountUpProps) => {
  const [end, setEnd] = useState(0);
  const [key, setKey] = useState(v4());
  const [start, setStart] = useState(0);

  useEffect(() => {
    if (value) {
      setStart(end);
      setEnd(value);
      setKey(v4());
    } else {
      setStart(0);
      setEnd(0);
    }
  }, [value]);

  if (!value) {
    return <>{fallback}</>;
  }

  return (
    <>
      {`${prefix} `}
      <CountUp
      
        decimalPlaces={RyskCountUpDecimals[format]}
        decimalSeparator={"."}
        duration={0.3}
        easing="easeOutCubic"
        end={end}
        isCounting={Boolean(value)}
        key={key}
        start={start}
        thousandsSeparator={","}
      />
    </>
  );
};
