import React, { createContext, useReducer, ReactNode, useMemo } from 'react';
import { ICurrency, IState } from './types';
import reducers from './reducers';

// ====================================================================================
// CONSTANTS
// ====================================================================================

const DEFAULT_PAIR = "POPEYE_USDT";

// ====================================================================================
// INITIAL STATE
// ====================================================================================

const createInitialState = (): IState => ({
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
  
  currencies: (() => {
    try {
      const stored = localStorage.getItem('currencies');
      return stored ? JSON.parse(stored) as Array<ICurrency> : [];
    } catch {
      return [];
    }
  })(),
  
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
  
  globalPairName: localStorage.getItem('globalPairName') || DEFAULT_PAIR
});

// ====================================================================================
// TYPES
// ====================================================================================

interface GlobalContext {
  state: IState;
  dispatch: React.Dispatch<any>;
}

interface StoreProviderProps {
  children: ReactNode;
}

// ====================================================================================
// CONTEXT
// ====================================================================================

export const Store = createContext<GlobalContext>({
  state: createInitialState(),
  dispatch: () => {}
});

// ====================================================================================
// PROVIDER COMPONENT
// ====================================================================================

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducers, null, createInitialState);

  const contextValue = useMemo(() => ({
    state,
    dispatch
  }), [state, dispatch]);

  return (
    <Store.Provider value={contextValue}>
      {children}
    </Store.Provider>
  );
};

// ====================================================================================
// HOOKS
// ====================================================================================

export const useStore = () => {
  const context = React.useContext(Store);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreProvider;