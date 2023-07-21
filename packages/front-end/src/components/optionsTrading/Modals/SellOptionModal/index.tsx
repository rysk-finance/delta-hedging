import type { ChangeEvent } from "react";

import { BigNumber } from "ethers";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";

import { approveAllowance } from "src/components/shared/utils/transactions/approveAllowance";
import { sell } from "src/components/shared/utils/transactions/sell";
import { useGlobalContext } from "src/state/GlobalContext";
import { ActionType } from "src/state/types";
import { toRysk, toUSDC, toWei } from "src/utils/conversion-helper";
import { getContractAddress } from "src/utils/helpers";
import { useNotifications } from "../../hooks/useNotifications";
import { Disclaimer } from "../Shared/components/Disclaimer";
import { Button, Input, Label, Wrapper } from "../Shared/components/Form";
import { Header } from "../Shared/components/Header";
import { Modal } from "../Shared/components/Modal";
import { getButtonProps } from "../Shared/utils/getButtonProps";
import { Filters } from "./components/Filters";
import { Pricing } from "./components/Pricing";
import { Symbol } from "./components/Symbol";
import { useSellOption } from "./hooks/useSellOption";

export const SellOptionModal = () => {
  const {
    state: {
      collateralPreferences,
      geoData: { blocked },
      options: { activeExpiry, refresh, vaults },
      selectedOption,
    },
    dispatch,
  } = useGlobalContext();

  const [amountToSell, setAmountToSell] = useState("");
  const [debouncedAmountToSell] = useDebounce(amountToSell, 300);
  const [transactionPending, setTransactionPending] = useState(false);

  const [addresses, allowance, setAllowance, positionData, loading] =
    useSellOption(debouncedAmountToSell);

  const [notifyApprovalSuccess, handleTransactionSuccess, notifyFailure] =
    useNotifications();

  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
    const amount = event.currentTarget.value;
    const decimals = amount.split(".");
    const rounded =
      decimals.length > 1
        ? `${decimals[0]}.${decimals[1].slice(0, 2)}`
        : event.currentTarget.value;

    setAmountToSell(rounded);
  };

  const handleApprove = async () => {
    setTransactionPending(true);

    try {
      if (addresses.token && addresses.user) {
        const amount =
          collateralPreferences.type === "USDC"
            ? toUSDC(positionData.requiredApproval)
            : toRysk(positionData.requiredApproval);

        const hash = await approveAllowance(
          addresses.exchange,
          addresses.token,
          amount
        );

        if (hash) {
          setAllowance({ approved: true, amount });
          setTransactionPending(false);
          notifyApprovalSuccess(hash);
        }
      }
    } catch (error) {
      setTransactionPending(false);
      notifyFailure(error);
    }
  };

  const handleSell = async () => {
    setTransactionPending(true);

    try {
      if (addresses.token && addresses.user && selectedOption) {
        const optionSeries = {
          expiration: BigNumber.from(activeExpiry),
          strike: toWei(selectedOption.strikeOptions.strike.toString()),
          isPut: selectedOption.callOrPut === "put",
          strikeAsset: getContractAddress("USDC"),
          underlying: getContractAddress("WETH"),
          collateral: addresses.token,
        };

        const hash = await sell(
          positionData.acceptablePremium,
          toRysk(amountToSell),
          collateralPreferences.type === "USDC"
            ? toUSDC(positionData.collateral.toString())
            : toRysk(positionData.collateral.toString()),
          addresses.exchange,
          optionSeries,
          refresh,
          addresses.token,
          addresses.user,
          vaults
        );

        if (hash) {
          setTransactionPending(false);
          handleTransactionSuccess(hash, "Purchase");
        }
      }
    } catch (error) {
      setTransactionPending(false);
      notifyFailure(error);
    }
  };

  const disableChangeButton = useMemo(() => {
    const isPut = selectedOption?.callOrPut === "put";

    if (selectedOption && isPut && selectedOption.strikeOptions.put) {
      const buyData = selectedOption.strikeOptions.put.buy;

      return buyData.disabled || !buyData.quote.total;
    }

    if (selectedOption && !isPut && selectedOption.strikeOptions.call) {
      const buyData = selectedOption.strikeOptions.call.buy;

      return buyData.disabled || !buyData.quote.total;
    } else {
      return true;
    }
  }, [selectedOption]);




  return (
    <Modal>
      <Header
        changeVisible={!disableChangeButton}
      >
        {`Sell Position`}
      </Header>

      <div className="flex flex-col">
        <Symbol positionData={positionData} />

        <Filters />

        <Pricing loading={loading} positionData={positionData} />
      </div>

      <Wrapper>
        <Label
          title="Enter how many contracts you would like to sell."
        >
          <Input
            name="sell-amount"
            onChange={handleAmountChange}
            placeholder="How many would you like to sell?"
            value={amountToSell}
          />
        </Label>

        <Button
          disabled={
            !Number(debouncedAmountToSell) ||
            (collateralPreferences.type === "USDC" &&
              positionData.remainingBalanceUSDC <= 0) ||
            (collateralPreferences.type === "WETH" &&
              positionData.remainingBalanceWETH <= 0) ||
            !positionData.hasRequiredCapital ||
            transactionPending ||
            loading ||
            blocked
          }
          {...getButtonProps(
            "sell",
            transactionPending || loading,
            allowance.approved,
            handleApprove,
            handleSell
          )}
        />
      </Wrapper>

      <Disclaimer>
        {`You are about to make a trade using your balance to collateralize the options and receive a USDC premium for the trade. Please ensure this is what you want because the action is irreversible.`}
      </Disclaimer>
    </Modal>
  );
};
