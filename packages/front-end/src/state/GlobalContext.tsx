import { createContext, useContext, useReducer } from "react";
import { globalReducer } from "./reducer";
import { GlobalContext, GlobalState } from "./types";
import React from "react";

const defaultGlobalState: GlobalState = {
  ethPrice: null,
  eth24hChange: null,
  connectWalletIndicatorActive: false,
};

export const GlobalReactContext = createContext<GlobalContext>({
  state: defaultGlobalState,
  dispatch: () => {},
});

export const GlobalContextProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, defaultGlobalState);
  return (
    <GlobalReactContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalReactContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalReactContext);
