import { AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";

import { Card } from "src/components/shared/Card";
import LoadingOrError from "src/components/shared/LoadingOrError";
import Disconnected from "./components/Disconnected";
import NoneFound from "./components/NoneFound";
import Table from "./components/Table";
import { usePositions, useRedeem, useSettle } from "./hooks";
import { useSearchParams } from "react-router-dom";
import { ActionType, FullPosition } from "src/state/types";
import { useGlobalContext } from "src/state/GlobalContext";

export const UserOptions = () => {
  const {
    dispatch,
    state: {
      dashboard: { activePositions, inactivePositions },
    },
  } = useGlobalContext();

  const { isConnected, isDisconnected } = useAccount();

  const [, setSearchParams] = useSearchParams();

  const [status, error] = usePositions();
  const [completeRedeem] = useRedeem();
  const [completeSettle] = useSettle();

  const adjustCollateral = (position: FullPosition) => {
    dispatch({ type: ActionType.SET_DASHBOARD, modalPosition: position });

    setSearchParams({
      ref: "adjust-collateral",
    });
  };

  return (
    <Card
      wrapperClasses="mb-24"
      tabWidth={280}
      tabs={[
        {
          label:
            status == "loading"
              ? "Loading Open..."
              : status == "idle"
              ? "Booting..."
              : "RYSK.Open",
          content: (
            <>
              <AnimatePresence initial={false} mode="wait">
                {(status == "loading" || error) && (
                  <LoadingOrError
                    key="loading-or-error"
                    error={error}
                    extraStrings={[
                      "Fetching positions...",
                      "Calculating P/L...",
                      "Computing liquidation threshold...",
                      "Determining status...",
                    ]}
                    stringSpeed={1000}
                  />
                )}

                {isConnected && status == "success" && (
                  <>
                    {activePositions.length ? (
                      <Table
                        positions={activePositions}
                        completeRedeem={completeRedeem}
                        adjustCollateral={adjustCollateral}
                        completeSettle={completeSettle}
                        active={true}
                      />
                    ) : (
                      <NoneFound />
                    )}
                  </>
                )}

                {isDisconnected && <Disconnected />}
              </AnimatePresence>
            </>
          ),
        },
        {
          label:
            status == "loading"
              ? "Loading Closed..."
              : status == "idle"
              ? "Booting..."
              : "RYSK.Closed",
          content: (
            <>
              <AnimatePresence initial={false} mode="wait">
                {(status == "loading" || error) && (
                  <LoadingOrError
                    key="loading-or-error"
                    error={error}
                    extraStrings={[
                      "Fetching positions...",
                      "Calculating P/L...",
                      "Computing liquidation threshold...",
                      "Determining status...",
                    ]}
                    stringSpeed={1000}
                  />
                )}

                {isConnected && status == "success" && (
                  <>
                    {inactivePositions.length ? (
                      <Table
                        positions={inactivePositions}
                        completeRedeem={completeRedeem}
                        adjustCollateral={adjustCollateral}
                        completeSettle={completeSettle}
                        active={false}
                      />
                    ) : (
                      <NoneFound />
                    )}
                  </>
                )}

                {isDisconnected && <Disconnected />}
              </AnimatePresence>
            </>
          ),
        },
        {
          label: "RYSK.Help",
          content: (
            <div className="p-4">
              <h2 className="font-medium text-xl pb-4">
                {"Understanding your positions."}
              </h2>
              <p className="pb-2">
                {
                  "From inside this section, you can visualise the state of your positions and perform some simple management actions."
                }
              </p>
              <p className="pb-2">
                {
                  "If you wish to modify the health of your collateral for short positions, you can click the collateral value button, and an interface will appear. You can add or remove collateral from any position as you please."
                }
              </p>
              <p>
                {
                  "The status column shows additional information or actions about your positions. If your position has been closed, settled, redeemed or has  expired, you will be shown here. If you wish to close your position, a button will appear to provide you with the necessary interfaces needed. In some cases, you will see that a position is currently untradeable. This can occur when the option is outside of a delta range of 10-70 or within one day to expiration. All of these circumstances aim to protect overall risk to the DHV."
                }
              </p>
            </div>
          ),
        },
      ]}
    />
  );
};
