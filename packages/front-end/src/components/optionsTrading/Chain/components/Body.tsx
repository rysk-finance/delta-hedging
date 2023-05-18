import type { SelectedOption, StrikeOptions } from "src/state/types";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";

import { Loading } from "src/Icons";
import FadeInOut from "src/animation/FadeInOut";
import { useGlobalContext } from "src/state/GlobalContext";
import { ActionType } from "src/state/types";
import { useShowColumn } from "../hooks/useShowColumn";
import { Cell, Delta, Exposure, IV, Position, Quote, Strike } from "./Cells";

export const Body = ({ chainRows }: { chainRows: StrikeOptions[] }) => {
  const {
    state: {
      ethPrice,
      options: { loading },
      visibleStrikeRange,
    },
    dispatch,
  } = useGlobalContext();

  const [, setSearchParams] = useSearchParams();

  const [colSize, , showCol] = useShowColumn();

  const [strikeRange] = useDebounce(visibleStrikeRange, 300);

  const filteredChainRows = useMemo(
    () =>
      chainRows.filter(({ strike }) => {
        const min = Number(strikeRange[0]);
        const max = Number(strikeRange[1]);

        if (min && max) {
          return strike >= min && strike <= max;
        } else if (min) {
          return strike >= min;
        } else if (max) {
          return strike <= max;
        } else {
          return !(min && max);
        }
      }),
    [chainRows, strikeRange]
  );

  const [callAtmStrike, putAtmStrike] = useMemo(() => {
    if (chainRows.length) {
      const atmIndex = chainRows.findIndex(
        (row) => ethPrice && row.strike >= ethPrice
      );
      const maxIndex = chainRows.length - 1;

      if (atmIndex === -1) {
        return [
          chainRows[maxIndex].strike,
          chainRows[maxIndex].strike + 1,
        ] as const;
      }

      if (atmIndex === 0) {
        return [
          chainRows[atmIndex].strike - 1,
          chainRows[atmIndex].strike,
        ] as const;
      }

      return [
        chainRows[atmIndex - 1].strike,
        chainRows[atmIndex].strike,
      ] as const;
    } else {
      return [0, 0];
    }
  }, [ethPrice, chainRows]);

  const setSelectedOption = (option: SelectedOption) => () => {
    dispatch({ type: ActionType.SET_SELECTED_OPTION, option });
  };

  return (
    <tbody
      className="relative block w-[150%] lg:w-full font-dm-mono text-sm ease-in-out duration-100 hover:[&>tr]:!opacity-100 [&>tr]:hover:!opacity-40"
      id="chain-body"
    >
      <AnimatePresence initial={false}>
        {filteredChainRows.map((option) => {
          const callSellDisabled =
            option.call.sell.disabled || !option.call.sell.quote.quote;
          const callBuyDisabled =
            option.call.buy.disabled || !option.call.buy.quote.quote;
          const callPosDisabled =
            !option.call.pos ||
            (option.call.pos < 0 && callBuyDisabled) ||
            (option.call.pos > 0 && callSellDisabled);
          const putSellDisabled =
            option.put.sell.disabled || !option.put.sell.quote.quote;
          const putBuyDisabled =
            option.put.buy.disabled || !option.put.buy.quote.quote;
          const putPosDisabled =
            !option.put.pos ||
            (option.put.pos < 0 && putBuyDisabled) ||
            (option.put.pos > 0 && putSellDisabled);

          const callAtTheMoney = option.strike === callAtmStrike;
          const putAtTheMoney = option.strike === putAtmStrike;
          const rowClasses = callAtTheMoney
            ? "border-b"
            : putAtTheMoney
            ? "border-t"
            : "";

          return (
            <motion.tr
              className={`group/row grid even:bg-bone odd:bg-bone-light bg-[url('./assets/wave-lines.png')] even:bg-[top_right_-50%] even:lg:bg-[top_right_-15%] even:xl:bg-[top_right_0%] odd:bg-[top_left_-80%] odd:lg:bg-[top_left_-40%] odd:xl:bg-[top_left_-20%] bg-no-repeat bg-contain text-right [&_td]:col-span-1 [&_td]:border [&_td]:border-dashed [&_td]:border-gray-500 [&_td]:ease-in-out [&_td]:duration-100 [&_td]:cursor-default [&_td]:text-2xs [&_td]:xl:text-sm ease-in-out duration-100 ${rowClasses} border-black border-dashed`}
              key={option.strike}
              style={{
                gridTemplateColumns: `repeat(${colSize}, minmax(0, 1fr))`,
              }}
              {...FadeInOut()}
              layout="position"
            >
              {showCol("iv sell") && (
                <Cell cellClasses="!border-l-0">
                  <IV value={option.call.sell.IV} />
                </Cell>
              )}

              <Cell
                cellClasses={`${
                  callSellDisabled
                    ? "text-gray-600 !bg-red-100/40"
                    : "text-red-900 !bg-red-100/80"
                } !p-0`}
              >
                <Quote
                  clickFn={setSelectedOption({
                    callOrPut: "call",
                    buyOrSell: "sell",
                    strikeOptions: option,
                  })}
                  disabled={callSellDisabled}
                  value={option.call.sell.quote.quote}
                />
              </Cell>

              <Cell
                cellClasses={`${
                  callBuyDisabled
                    ? "text-gray-600 !bg-green-100/20"
                    : "text-green-1100 !bg-green-100/60"
                } !p-0`}
              >
                <Quote
                  clickFn={setSelectedOption({
                    callOrPut: "call",
                    buyOrSell: "buy",
                    strikeOptions: option,
                  })}
                  disabled={callBuyDisabled}
                  value={option.call.buy.quote.quote}
                />
              </Cell>

              {showCol("iv buy") && (
                <Cell cellClasses="">
                  <IV value={option.call.buy.IV} />
                </Cell>
              )}

              {showCol("delta") && (
                <Cell cellClasses="">
                  <Delta value={option.call.delta} />
                </Cell>
              )}

              {showCol("pos") && (
                <Cell
                  cellClasses={`${callPosDisabled ? "text-gray-600" : ""} !p-0`}
                >
                  <Position
                    clickFn={() => {
                      if (option.call.pos > 0) {
                        setSearchParams({
                          ref: "close",
                          token: option.call.tokenID || "",
                        });
                      }
                    }}
                    disabled={callPosDisabled}
                    value={option.call.pos}
                  />
                </Cell>
              )}

              {showCol("exposure") && (
                <Cell cellClasses="!border-r-0">
                  <Exposure value={option.call.exposure} />
                </Cell>
              )}

              <Strike
                value={option.strike}
                callAtTheMoney={callAtTheMoney}
                putAtTheMoney={putAtTheMoney}
              />

              {showCol("iv sell") && (
                <Cell cellClasses="!border-l-0 ">
                  <IV value={option.put.sell.IV} />
                </Cell>
              )}

              <Cell
                cellClasses={`${
                  putSellDisabled
                    ? "text-gray-600 !bg-red-100/40"
                    : "text-red-900 !bg-red-100/80"
                } !p-0`}
              >
                <Quote
                  clickFn={setSelectedOption({
                    callOrPut: "put",
                    buyOrSell: "sell",
                    strikeOptions: option,
                  })}
                  disabled={putSellDisabled}
                  value={option.put.sell.quote.quote}
                />
              </Cell>

              <Cell
                cellClasses={`${
                  putBuyDisabled
                    ? "text-gray-600 !bg-green-100/20"
                    : "text-green-1100 !bg-green-100/60"
                } !p-0`}
              >
                <Quote
                  clickFn={setSelectedOption({
                    callOrPut: "put",
                    buyOrSell: "buy",
                    strikeOptions: option,
                  })}
                  disabled={putBuyDisabled}
                  value={option.put.buy.quote.quote}
                />
              </Cell>

              {showCol("iv buy") && (
                <Cell cellClasses="">
                  <IV value={option.put.buy.IV} />
                </Cell>
              )}

              {showCol("delta") && (
                <Cell cellClasses="">
                  <Delta value={option.put.delta} />
                </Cell>
              )}

              {showCol("pos") && (
                <Cell
                  cellClasses={`${putPosDisabled ? "text-gray-600" : ""} !p-0`}
                >
                  <Position
                    clickFn={() => {
                      if (option.put.pos > 0) {
                        setSearchParams({
                          ref: "close",
                          token: option.put.tokenID || "",
                        });
                      }
                    }}
                    disabled={putPosDisabled}
                    value={option.put.pos}
                  />
                </Cell>
              )}

              {showCol("exposure") && (
                <Cell cellClasses="!border-r-0">
                  <Exposure value={option.put.exposure} />
                </Cell>
              )}
            </motion.tr>
          );
        })}

        {loading && (
          <motion.tr
            className="absolute inset-0 z-10 w-full h-full bg-black/10"
            key="data-loading"
            {...FadeInOut()}
          >
            <td className="h-full flex items-center">
              <Loading className="h-12 mx-auto animate-spin text-bone-light" />
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </tbody>
  );
};
