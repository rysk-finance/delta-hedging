import React from "react";
import { gql, useQuery } from "@apollo/client";
import { BigNumber } from "ethers/lib/ethers";
import { useEffect, useState } from "react";
import NumberFormat from "react-number-format";
import { Link } from "react-router-dom";
import LPABI from "../../abis/LiquidityPool.json";
import { useWalletContext } from "../../App";
import { AppPaths } from "../../config/appPaths";
import { BIG_NUMBER_DECIMALS, SUBGRAPH_URL } from "../../config/constants";
import { useContract } from "../../hooks/useContract";
import { DepositReceipt } from "../../types";
import { Button } from "../shared/Button";
import { Card } from "../shared/Card";

export const UserVault = () => {
  const { account, network } = useWalletContext();
  const SUBGRAPH_URI =
    network?.id !== undefined ? SUBGRAPH_URL[network?.id] : "";
  const [currentPosition, setCurrentPosition] = useState<BigNumber>(
    BigNumber.from(0)
  );
  const [pricePerShare, setPricePerShare] = useState<BigNumber | null>(null);
  const [depositBalance, setDepositBalance] = useState<BigNumber>(
    BigNumber.from(0)
  );

  const [unredeemableCollateral, setUnredeemableCollateral] =
    useState<BigNumber>(BigNumber.from(0));
  const [unredeemedSharesValue, setUnredeemedSharesValue] = useState<BigNumber>(
    BigNumber.from(0)
  );

  const [lpContract] = useContract({
    contract: "liquidityPool",
    ABI: LPABI,
    readOnly: true,
  });

  useQuery(
    gql`
      query($account: String) {
        lpbalances(first: 1000, where: { id: "${account}" }) {
          id
          balance
        }
      }
    `,
    {
      onCompleted: (data) => {
        const balance = data.data.lpbalances[0]
          ? data.data.lpbalances[0].balance
          : 0;

        setDepositBalance(balance);
      },
    }
  );

  useEffect(() => {
    const getCurrentPosition = async (address: string) => {
      const balance = await lpContract?.balanceOf(address);
      const epoch = await lpContract?.epoch();
      // TODO if makes sense to have the latest available epoch as -1
      const pricePerShareAtEpoch = await lpContract?.epochPricePerShare(
        epoch - 1
      );
      setPricePerShare(pricePerShareAtEpoch);

      // converting to 1e6 - usdc for easy comparison
      const positionValue =
        balance.gt(0) && pricePerShareAtEpoch?.gt(0)
          ? balance.mul(pricePerShareAtEpoch).div(BigNumber.from(10).pow(30))
          : BigNumber.from(0);

      setCurrentPosition(positionValue);

      const depositReceipt: DepositReceipt = await lpContract?.depositReceipts(
        account
      );
      const currentEpoch: BigNumber = await lpContract?.epoch();
      const previousUnredeemedShares = depositReceipt.unredeemedShares;
      const unredeemedShares = BigNumber.from(0);
      // If true, the share price for the most recent deposit hasn't been calculated
      // so we can only show the collateral balance, not the equivalent number of shares.
      if (currentEpoch._hex === depositReceipt.epoch._hex) {
        unredeemedShares.add(previousUnredeemedShares);
        if (depositReceipt.amount.toNumber() !== 0) {
          setUnredeemableCollateral(depositReceipt.amount);
        }
      } else {
        const pricePerShareAtEpoch: BigNumber =
          await lpContract?.epochPricePerShare(depositReceipt.epoch);
        // TODO(HC): Price oracle is returning 1*10^18 for price so having to adjust price
        // whilst building out to avoid share numbers being too small. Once price oracle is returning
        // more accurate
        const newUnredeemedShares = depositReceipt.amount
          .div(BIG_NUMBER_DECIMALS.USDC)
          .mul(BIG_NUMBER_DECIMALS.RYSK)
          .div(pricePerShareAtEpoch)
          .mul(BIG_NUMBER_DECIMALS.RYSK);
        const sharesToRedeem =
          previousUnredeemedShares.add(newUnredeemedShares);
        unredeemedShares.add(sharesToRedeem);

        const unredeemedSharesValue = sharesToRedeem
          .mul(pricePerShareAtEpoch)
          .div(BigNumber.from(10).pow(30));

        setUnredeemedSharesValue(unredeemedSharesValue);
      }
    };

    (async () => {
      if (account && lpContract) {
        await getCurrentPosition(account);
      }
    })();
  }, [account, lpContract, SUBGRAPH_URI]);

  return (
    <div>
      <div className="mb-24">
        <Card tabPunchColor="black" headerContent="RYSK.dynamicHedgingVault">
          <div className="pb-8 py-12 px-8 flex flex-col lg:flex-row h-full">
            <div className="flex h-full w-full lg:w-[70%] justify-around">
              <div className="flex flex-col items-center justify-center h-full mb-8 lg:mb-0">
                <h3 className="mb-2">
                  <NumberFormat
                    value={Number(
                      currentPosition
                        ?.add(unredeemableCollateral)
                        .add(unredeemedSharesValue)
                        .toNumber() / 1e6
                    )}
                    displayType={"text"}
                    decimalScale={2}
                    prefix="$"
                  />
                </h3>
                <h4 className="mb-2">Position</h4>
                <a href="#" className="underline">
                  Learn more
                </a>
              </div>
              <div className="flex flex-col items-center justify-center h-full">
                <h3 className="mb-2">
                  {/* TODO make sure if there is an error with subgraph this will not load */}
                  <NumberFormat
                    value={Number(
                      currentPosition
                        ?.add(unredeemableCollateral)
                        .sub(depositBalance)
                        .toNumber() / 1e6
                    )}
                    displayType={"text"}
                    decimalScale={2}
                    prefix="$"
                  />
                </h3>
                <h4 className="mb-2">PNL</h4>
                <a href="#" className="underline">
                  Learn more
                </a>
              </div>
              {unredeemableCollateral.gt(0) && (
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="mb-2">
                    <NumberFormat
                      value={Number(unredeemableCollateral.toNumber() / 1e6)}
                      displayType={"text"}
                      decimalScale={2}
                      prefix="$"
                    />
                  </h3>
                  <h4 className="mb-2">Queed Collateral</h4>
                  <a href="#" className="underline">
                    Learn more
                  </a>
                </div>
              )}
              {unredeemedSharesValue.gt(0) && (
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="mb-2">
                    <NumberFormat
                      value={Number(unredeemedSharesValue.toNumber() / 1e6)}
                      displayType={"text"}
                      decimalScale={2}
                      prefix="$"
                    />
                  </h3>
                  <h4 className="mb-2">Shares to be reedemed</h4>
                  <a href="#" className="underline">
                    Learn more
                  </a>
                </div>
              )}
            </div>
            <div className="flex flex-col w-full lg:w-[30%] h-full justify-around items-center">
              <Link
                className="w-full"
                to={{ pathname: AppPaths.VAULT, search: "?type=deposit" }}
              >
                <Button className="w-full mb-8">Deposit</Button>
              </Link>
              <Link
                className="w-full"
                to={{ pathname: AppPaths.VAULT, search: "?type=withdraw" }}
              >
                <Button className="w-full">Withdraw</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
