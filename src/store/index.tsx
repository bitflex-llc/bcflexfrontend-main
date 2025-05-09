import { ICurrency, IState } from './types';

import React, { } from 'react';
import reducers from './reducers';

const intialState: IState = {
  isLoading: false,
  markets: [],
  marketsLoaded: false,

  currentPairId: '',

  currentMarket: '',
  currentPair: '',

  userOrders: [],

  balances: [],

  askOrders: [],
  bidOrders: [],

  lastPrice: 0,

  tradingHistory: [],
  currentMarketImage: '',
  currencies: JSON.parse(localStorage.getItem('currencies')!) as Array<ICurrency> || [],

  balanceStats: [],

  takerFee: 0.0,
  makerFee: 0.0,

  fingerprintMarket: '',

  tickers: [],

  averageColor: "",

  nonce: '',

  privateHubConnection: undefined,
  terminalHubConnection: undefined,


  isBlur: false,
  tvChart: undefined,
  marketType: 'Spot',
  settings: undefined,


  globalPairName: localStorage.getItem('globalPairName') || "PLUTO_INR"

};

type GlobalContext = {
  state: IState;
  dispatch: any;
}

export const Store = React.createContext<GlobalContext>({ state: intialState, dispatch: undefined });

export function StoreProvider({ children }: JSX.ElementChildrenAttribute): React.ReactElement {
  const [state, dispatch] = React.useReducer(reducers, intialState);
  return <Store.Provider value={{ state: state, dispatch: dispatch }}>
    <>
      {children}
    </>
  </Store.Provider>

}
