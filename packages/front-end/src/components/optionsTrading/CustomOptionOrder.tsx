import React from "react";
import { useOptionsTradingContext } from "../../state/OptionsTradingContext";
import { OptionsTradingActionType, OptionType } from "../../state/types";
import { RadioButtonList } from "../shared/RadioButtonList";
import { Option } from "../../types";
import { ExpiryDatePicker } from "./ExpiryDatePicker";
import { TextInput } from "../shared/TextInput";
import { Button } from "../shared/Button";

const optionTypeOptions: Option<OptionType>[] = [
  { label: "Calls", value: OptionType.CALL },
  { label: "Puts", value: OptionType.PUT },
];

export const CustomOptionOrder: React.FC = () => {
  const {
    state: { optionType },
    dispatch,
  } = useOptionsTradingContext();

  const setOptionType = (optionType: OptionType) => {
    dispatch({ type: OptionsTradingActionType.SET_OPTION_TYPE, optionType });
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <RadioButtonList
          options={optionTypeOptions}
          selected={optionType}
          setSelected={setOptionType}
        />
      </div>
      <div className="mb-4">
        <ExpiryDatePicker />
      </div>
      <div>
        <h5 className="mb-2">Custom Strike</h5>
        <div className="flex">
          <TextInput
            className="text-right"
            iconLeft={
              <div className="px-2 flex items-center h-full">
                <p className="text-gray-600">$</p>
              </div>
            }
          />
          <Button className="ml-8 px-8">Add</Button>
        </div>
      </div>
    </div>
  );
};
