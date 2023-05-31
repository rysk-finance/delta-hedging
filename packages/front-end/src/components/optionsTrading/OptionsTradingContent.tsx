import { OptionsTable } from "./OptionsTable";
import { Purchase } from "./Purchase";
import { ExpiryDatePicker } from "./ExpiryDatePicker";
import { AssetPriceInfo } from "./AssetPriceInfo";

export const OptionsTradingContent = () => {
  return (
    <>
      <div className="col-start-1 col-end-17 -mt-16">
        <AssetPriceInfo />
        <div className="border-2 border-black">
          <div className="w-full">
            <div className="">
              <ExpiryDatePicker />
            </div>
          </div>
          <div className="flex grow items-stretch">
            <div className="grow flex-col rounded-br-lg">
              <div className="grow border-black rounded-br-lg">
                <OptionsTable />
              </div>
            </div>
          </div>
        </div>
        <div className="grow rounded-br-lg flex flex-col">
          <div>
            <Purchase />
          </div>
        </div>
      </div>
    </>
  );
};
