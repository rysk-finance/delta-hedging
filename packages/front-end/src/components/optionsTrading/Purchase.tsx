import { BigNumber } from "@ethersproject/bignumber";
import { Serie } from "@nivo/line";
import { ethers } from "ethers";
import React, { useState } from "react";
import { toast } from "react-toastify";
import ERC20ABI from "../../abis/erc20.json";
import { useWalletContext } from "../../App";
import OptionHandlerABI from "../../abis/OptionHandler.json";
import OptionRegistryABI from "../../abis/OptionRegistry.json";
import {
  BIG_NUMBER_DECIMALS,
  CHAINID,
  MAX_UINT_256,
  ZERO_ADDRESS,
} from "../../config/constants";
import contracts from "../../contracts.json";
import { useContract } from "../../hooks/useContract";
import { useGlobalContext } from "../../state/GlobalContext";
import { useOptionsTradingContext } from "../../state/OptionsTradingContext";
import { OptionSeries } from "../../types";
import { Button } from "../shared/Button";
import { TextInput } from "../shared/TextInput";

const DUMMY_OPTION_SERIES: OptionSeries = {
  strike: BigNumber.from("2000").mul(BIG_NUMBER_DECIMALS.RYSK),
  strikeAsset: contracts.arbitrum.USDC,
  collateral: contracts.arbitrum.USDC,
  underlying: contracts.arbitrum.WETH,
  expiration: "1657267200",
  isPut: false,
};

export const Purchase: React.FC = () => {
  // Context state
  const {
    state: { settings },
  } = useGlobalContext();

  const {
    state: { selectedOption },
  } = useOptionsTradingContext();

  const { account } = useWalletContext();

  // Local state
  const [uiOrderSize, setUIOrderSize] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  // Contracts
  const [optionRegistryContract, optionRegistryContractCall] = useContract({
    contract: "OpynOptionRegistry",
    ABI: OptionRegistryABI,
    readOnly: false,
  });

  const [optionHandlerContract, optionHandlerContractCall] = useContract({
    contract: "optionHandler",
    ABI: OptionHandlerABI,
    readOnly: false,
  });

  const [usdcContract, usdcContractCall] = useContract({
    contract: "USDC",
    ABI: ERC20ABI,
    readOnly: false,
  });

  const handleInputChange = (value: string) => {
    setIsApproved(false);
    setUIOrderSize(value);
  };

  const handleApproveSpend = async () => {
    if (usdcContract) {
      const amount = BIG_NUMBER_DECIMALS.RYSK.mul(BigNumber.from(uiOrderSize));
      const approvedAmount = (await usdcContract.allowance(
        account,
        contracts.arbitrum.optionHandler
      )) as BigNumber;
      try {
        if (
          !settings.optionsTradingUnlimitedApproval ||
          approvedAmount.lt(amount)
        ) {
          await usdcContractCall({
            method: usdcContract.approve,
            args: [
              contracts.arbitrum.optionHandler,
              settings.optionsTradingUnlimitedApproval
                ? ethers.BigNumber.from(MAX_UINT_256)
                : amount,
            ],
            submitMessage: "✅ Approval successful",
          });
        } else {
          toast("✅ Your transaction is already approved");
        }
        setIsApproved(true);
      } catch {
        toast("❌ There was an error approving your transaction.");
      }
    }
  };

  const handleBuy = async () => {
    if (
      optionRegistryContract &&
      optionHandlerContract &&
      usdcContract &&
      account
    ) {
      try {
        const amount = BIG_NUMBER_DECIMALS.RYSK.mul(
          BigNumber.from(uiOrderSize)
        );
        const seriesAddress = await optionRegistryContract.getSeries({
          ...DUMMY_OPTION_SERIES,
          // We create option series using e18, but when our contracts interact with
          // Opyn, this gets converted to e8, so we need to use e8 when checking
          // otokens.
          strike: DUMMY_OPTION_SERIES.strike.div(
            BIG_NUMBER_DECIMALS.RYSK.div(BIG_NUMBER_DECIMALS.OPYN)
          ),
        });
        // Series hasn't been created yet
        if (seriesAddress === ZERO_ADDRESS) {
          await optionHandlerContractCall({
            method: optionHandlerContract.issueAndWriteOption,
            args: [DUMMY_OPTION_SERIES, amount],
            onSubmit: () => {
              setUIOrderSize("");
              setIsApproved(false);
            },
            onFail: () => {
              setIsApproved(false);
            },
          });
          // Series already exists.
        } else {
          await optionHandlerContractCall({
            method: optionHandlerContract.writeOption,
            args: [seriesAddress, amount],
            onSubmit: () => {
              setUIOrderSize("");
              setIsApproved(false);
            },
            onFail: () => {
              setIsApproved(false);
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const approveIsDisabled = !uiOrderSize || isApproved;
  const buyIsDisabled = !uiOrderSize || !isApproved;

  return (
    <div>
      {selectedOption ? (
        <>
          <div className="w-full flex justify-between relative">
            <div className="w-1/2 border-r-2 border-black">
              <div className="w-full p-4">
                <div className="flex items-center">
                  <h4 className="font-parabole mr-2 pb-2">Option:</h4>
                  {selectedOption && (
                    <p className="pb-1">{selectedOption.type}</p>
                  )}
                </div>
                <p>Strike: {selectedOption.strike}</p>
                <p>IV: {selectedOption.IV}</p>
                <p>Delta: {selectedOption.delta}</p>
                <p>Price: {selectedOption.price}</p>
              </div>
              <div className="w-full ">
                <TextInput
                  value={uiOrderSize}
                  setValue={handleInputChange}
                  className="text-right border-x-0 w-full"
                  iconLeft={
                    <div className="px-2 flex items-center h-full">
                      <p className="text-gray-600">Shares</p>
                    </div>
                  }
                  numericOnly
                  maxNumDecimals={2}
                />
              </div>
              <div className="w-full">
                <div className="w-full -mb-1">
                  <div className="w-full p-4 flex items-center">
                    <h4 className="font-parabole mr-2 pb-1">Total price:</h4>
                    {uiOrderSize && (
                      <p>{Number(uiOrderSize) * selectedOption.price} USDC</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex">
                <Button
                  className={`w-full border-b-0 border-x-0 !py-4 text-white ${
                    approveIsDisabled ? "!bg-gray-300 " : "!bg-black"
                  }`}
                  onClick={handleApproveSpend}
                >
                  {`${isApproved ? "Approved ✅" : "Approve"}`}
                </Button>
                <Button
                  disabled={buyIsDisabled}
                  className={`w-full border-b-0 border-x-0 !py-4 text-white ${
                    buyIsDisabled ? "!bg-gray-300" : "!bg-black"
                  }`}
                  onClick={handleBuy}
                >
                  Buy
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="p-4">Select an option first</p>
      )}
    </div>
  );
};
