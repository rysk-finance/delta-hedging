import { DHV_NAME } from "src/config/constants";

export const Disclaimer = () => (
  <small className="block mt-auto pl-8 pb-16 text-justify text-2xs xl:text-sm">
    {`This chart shows the ${DHV_NAME} share price change since the fourth epoch (public launch). Data before this is the result of testing and is excluded.`}
  </small>
);
