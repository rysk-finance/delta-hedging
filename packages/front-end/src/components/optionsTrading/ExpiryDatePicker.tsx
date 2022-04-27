import React, { useCallback, useMemo } from "react";
import { useOptionsTradingContext } from "../../state/OptionsTradingContext";
import { OptionsTradingActionType } from "../../state/types";
import { Option } from "../../types";
import { formatShortDate } from "../../utils/formatShortDate";
import { getSuggestedExpiryDates } from "../../utils/getSuggestedExpiryDates";
import { getTimeDifferenceString } from "../../utils/getTimeDifferenceString";
import { RadioButtonList } from "../shared/RadioButtonList";

export const ExpiryDatePicker: React.FC = () => {
  const {
    state: { expiryDate },
    dispatch,
  } = useOptionsTradingContext();

  const setExpiryDate = useCallback(
    (date: Date) => {
      dispatch({ type: OptionsTradingActionType.SET_EXPIRY_DATE, date });
    },
    [dispatch]
  );

  const expiryDateOptions = useMemo(() => {
    const dates = getSuggestedExpiryDates();
    setExpiryDate(dates[0]);
    return dates.map<Option<Date>>((date) => ({
      value: date,
      label: formatShortDate(date),
      key: date.toISOString(),
    }));
  }, [setExpiryDate]);

  const expiryTime = expiryDate && expiryDate.getTime() - new Date().getTime();

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h5>Expiration date</h5>
        {expiryTime && (
          <p>
            expiry in: <b>{getTimeDifferenceString(expiryTime)}</b>
          </p>
        )}
      </div>
      <div className="w-[70%]">
        <RadioButtonList
          options={expiryDateOptions}
          selected={expiryDate}
          setSelected={setExpiryDate}
        />
      </div>
    </div>
  );
};
