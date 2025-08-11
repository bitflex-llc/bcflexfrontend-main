import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { Responsive, WidthProvider } from "react-grid-layout";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HubConnectionState } from '@microsoft/signalr';
import { isMobile } from "react-device-detect";

// API and Types
import { 
  ApiGetOrders, ApiMarket, ApiTickers, GetBalanceRequestModel, 
  GetTradeHistoryResponse, PriceAlert, StatusCodeEnum, 
  GetApiMarketsCurrenciesResponse, OrderViewModel, TradeType 
} from '../../api-wrapper';
import { BitflexOpenApi } from "../../_helpers/BitflexOpenApi";

// Components
import { CreateOrder } from "./CreateOrder";
import { History } from './History';
import { MarketTabs } from './MarketTabs';
import { NavMenu } from '../NavMenu';
import { OrderBook } from './OrderBook';
import { Orders } from './Orders';
import { PriceAlertPortlet } from './PriceAlertPortlet';
import { TVChartContainer } from './TradingViewChart';

// Store and Hooks
import { Store } from '../../store';
import { ActionType } from '../../store/actionTypes';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useSignalR } from '../../hooks/useSignalR';
import useUserState from '../../hooks/useUserState';
import useWindowDimensions from '../../hooks/useWindowDimensions';

// Assets
import flex_tech from '../../images/flex_technologies_logo.svg';

// ====================================================================================
// CONSTANTS
// ====================================================================================

const DEFAULT_PAIR = "POPEYE_INR";
const MAX_ORDERBOOK_ITEMS = 25;

// Layout configurations for different screen sizes
const LAYOUTS = {
  extraLarge: '{"lg":[{"w":7,"h":78,"x":0,"y":0,"i":"1"},{"w":36,"h":45,"x":7,"y":0,"i":"2"},{"w":9,"h":37,"x":43,"y":0,"i":"3"},{"w":36,"h":33,"x":7,"y":45,"i":"5"},{"w":8,"h":78,"x":52,"y":0,"i":"7"},{"w":9,"h":18,"x":43,"y":60,"i":"8"},{"w":9,"h":23,"x":43,"y":37,"i":"9"}]}',
  large: '{"lg":[{"w":12,"h":38,"x":0,"y":0,"i":"1"},{"w":35,"h":38,"x":12,"y":0,"i":"2"},{"w":13,"h":38,"x":47,"y":0,"i":"3"},{"w":34,"h":41,"x":26,"y":38,"i":"5"},{"w":14,"h":41,"x":12,"y":38,"i":"7"},{"w":12,"h":17,"x":0,"y":38,"i":"8"},{"w":12,"h":24,"x":0,"y":55,"i":"9"}]}',
  medium: '{"lg":[{"w":12,"h":38,"x":0,"y":0,"i":"1"},{"w":31,"h":38,"x":12,"y":0,"i":"2"},{"w":17,"h":38,"x":43,"y":0,"i":"3"},{"w":43,"h":36,"x":0,"y":38,"i":"5"},{"w":17,"h":36,"x":43,"y":38,"i":"7"},{"w":43,"h":26,"x":0,"y":74,"i":"8"},{"w":17,"h":26,"x":43,"y":74,"i":"9"}],"sm":[{"w":26,"h":47,"x":0,"y":0,"i":"1"},{"w":34,"h":34,"x":26,"y":0,"i":"2"},{"w":26,"h":30,"x":0,"y":66,"i":"3"},{"w":34,"h":30,"x":26,"y":66,"i":"4"},{"w":34,"h":27,"x":0,"y":96,"i":"5"},{"w":26,"h":19,"x":0,"y":47,"i":"6"},{"w":34,"h":32,"x":26,"y":34,"i":"7"},{"w":26,"h":27,"x":34,"y":96,"i":"8"}],"xs":[{"w":23,"h":34,"x":0,"y":0,"i":"1"},{"w":37,"h":34,"x":23,"y":0,"i":"2"},{"w":27,"h":40,"x":0,"y":34,"i":"3"},{"w":60,"h":26,"x":0,"y":74,"i":"5"},{"w":33,"h":40,"x":27,"y":34,"i":"7"},{"w":60,"h":19,"x":0,"y":100,"i":"8"}],"md":[{"w":13,"h":37,"x":0,"y":0,"i":"1"},{"w":28,"h":37,"x":13,"y":0,"i":"2"},{"w":19,"h":37,"x":41,"y":0,"i":"3"},{"w":44,"h":28,"x":0,"y":37,"i":"5"},{"w":16,"h":50,"x":44,"y":37,"i":"7"},{"w":26,"h":22,"x":0,"y":65,"i":"8"},{"w":18,"h":22,"x":26,"y":65,"i":"9"}]}',
  small: '{"lg":[{"w":18,"h":63,"x":0,"y":0,"i":"1"},{"w":42,"h":35,"x":18,"y":0,"i":"2"},{"w":24,"h":28,"x":18,"y":35,"i":"3"},{"w":30,"h":31,"x":30,"y":63,"i":"4"},{"w":30,"h":31,"x":0,"y":63,"i":"5"},{"w":30,"h":29,"x":0,"y":94,"i":"6"},{"w":18,"h":28,"x":42,"y":35,"i":"7"},{"w":30,"h":29,"x":30,"y":94,"i":"8"}],"sm":[{"w":15,"h":30,"x":0,"y":0,"i":"1"},{"w":45,"h":30,"x":15,"y":0,"i":"2"},{"w":26,"h":36,"x":0,"y":30,"i":"3"},{"w":34,"h":41,"x":0,"y":66,"i":"5"},{"w":34,"h":36,"x":26,"y":30,"i":"7"},{"w":26,"h":18,"x":34,"y":66,"i":"8"},{"w":26,"h":23,"x":34,"y":84,"i":"9"}],"xs":[{"w":23,"h":34,"x":0,"y":0,"i":"1"},{"w":37,"h":34,"x":23,"y":0,"i":"2"},{"w":27,"h":40,"x":0,"y":34,"i":"3"},{"w":60,"h":26,"x":0,"y":74,"i":"5"},{"w":33,"h":40,"x":27,"y":34,"i":"7"},{"w":31,"h":24,"x":0,"y":100,"i":"8"},{"w":29,"h":24,"x":31,"y":100,"i":"9"}],"md":[{"w":18,"h":63,"x":0,"y":0,"i":"1"},{"w":42,"h":35,"x":18,"y":0,"i":"2"},{"w":21,"h":40,"x":18,"y":35,"i":"3"},{"w":42,"h":31,"x":18,"y":75,"i":"5"},{"w":21,"h":40,"x":39,"y":35,"i":"7"},{"w":18,"h":43,"x":0,"y":63,"i":"8"}]}',
  mobile: '{"lg":[{"w":18,"h":63,"x":0,"y":0,"i":"1"},{"w":42,"h":39,"x":18,"y":0,"i":"2"},{"w":24,"h":32,"x":18,"y":35,"i":"3"},{"w":30,"h":31,"x":30,"y":63,"i":"4"},{"w":30,"h":31,"x":0,"y":63,"i":"5"},{"w":30,"h":29,"x":0,"y":94,"i":"6"},{"w":18,"h":28,"x":42,"y":35,"i":"7"},{"w":30,"h":29,"x":30,"y":94,"i":"8"}],"xxs":[{"w":60,"h":26,"x":0,"y":0,"i":"1"},{"w":60,"h":35,"x":0,"y":26,"i":"2"},{"w":60,"h":45,"x":0,"y":100,"i":"3"},{"w":60,"h":31,"x":0,"y":145,"i":"5"},{"w":60,"h":39,"x":0,"y":61,"i":"7"},{"w":60,"h":21,"x":0,"y":176,"i":"8"},{"w":60,"h":23,"x":0,"y":197,"i":"9"}],"xs":[{"w":18,"h":39,"x":0,"y":0,"i":"1"},{"w":42,"h":39,"x":18,"y":0,"i":"2"},{"w":30,"h":35,"x":0,"y":39,"i":"3"},{"w":30,"h":36,"x":0,"y":74,"i":"5"},{"w":30,"h":35,"x":30,"y":39,"i":"7"},{"w":30,"h":13,"x":30,"y":74,"i":"8"},{"w":30,"h":23,"x":30,"y":87,"i":"9"}]}'
};

// ====================================================================================
// TYPES
// ====================================================================================

export enum DispatcherActionTypes {
  INIT_LOAD,
  ADD_OR_UPDATE,
  DELETE
}

export interface ICurrentMarketState {
  pairId: number;
  pairName: string;
  quoteCurrencySymbol: string;
  baseCurrencySymbol: string;
  baseCurrency: GetApiMarketsCurrenciesResponse;
  quoteCurrency: GetApiMarketsCurrenciesResponse;
}

interface LoadingState {
  balances: boolean;
  currencies: boolean;
  userAlerts: boolean;
  history: boolean;
  orderBook: boolean;
  markets: boolean;
  myOrders: boolean;
  tickers: boolean;
}

interface ErrorState {
  orderbook: boolean;
}

// ====================================================================================
// REDUCER FACTORY
// ====================================================================================

const createReducer = <T extends { id?: string | number | null; price?: number; currency?: string | null; name?: string | null; symbol?: string | null; pair?: string | null }>(
  loadingSetter?: (loading: boolean) => void,
  keyField: keyof T = 'id' as keyof T,
  sortField?: keyof T,
  sortDesc = false,
  maxItems?: number
) => {
  return (state: T[], action: { type: DispatcherActionTypes; value: any }): T[] => {
    const findIndex = (item: T) => state.findIndex(s => s[keyField] === item[keyField]);
    
    switch (action.type) {
      case DispatcherActionTypes.INIT_LOAD:
        loadingSetter?.(false);
        return action.value || [];
        
      case DispatcherActionTypes.ADD_OR_UPDATE:
        const index = findIndex(action.value);
        let newState: T[];
        
        if (index === -1) {
          newState = [...state, action.value];
        } else {
          newState = [...state];
          newState[index] = action.value;
        }
        
        if (sortField) {
          newState.sort((a, b) => {
            const aVal = a[sortField] as number;
            const bVal = b[sortField] as number;
            return sortDesc ? bVal - aVal : aVal - bVal;
          });
        }
        
        return maxItems ? newState.slice(0, maxItems) : newState;
        
      case DispatcherActionTypes.DELETE:
        return state.filter(item => item[keyField] !== action.value[keyField]);
        
      default:
        return state;
    }
  };
};

// ====================================================================================
// MAIN COMPONENT
// ====================================================================================

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default function Terminal() {
  // ====================================================================================
  // HOOKS AND STATE
  // ====================================================================================
  
  const { state: { isBlur, terminalHubConnection, lastPrice }, dispatch } = useContext(Store);
  const { isSignedIn } = useUserState();
  const { base_quote_pair = DEFAULT_PAIR } = useParams<{ base_quote_pair: string }>();
  const { width } = useWindowDimensions();
  const forceUpdate = useForceUpdate();
  const navigate = useNavigate();
  const { JoinPair, LeavePair } = useSignalR();

  // Parse currency pair
  const [baseCurrency, quoteCurrency] = useMemo(() => {
    const [base, quote] = base_quote_pair.split('_');
    return [base, quote];
  }, [base_quote_pair]);

  // State
  const [currentMarket, setCurrentMarket] = useState<ICurrentMarketState>();
  const [settedPrice, setSettedPrice] = useState<number>();
  const [settedAmount, setSettedAmount] = useState<number>();
  const [settedOrderSide, setSettedOrderSide] = useState<TradeType>();
  
  const [loadingState, setLoadingState] = useState<LoadingState>({
    balances: isSignedIn,
    currencies: true,
    userAlerts: isSignedIn,
    history: true,
    orderBook: true,
    markets: true,
    myOrders: isSignedIn,
    tickers: true
  });

  const [errorState, setErrorState] = useState<ErrorState>({
    orderbook: false
  });

  // Get cached data
  const marketsFingerprint = useMemo(() => localStorage.getItem('marketsFingerprint') || '', []);

  // ====================================================================================
  // REDUCERS
  // ====================================================================================

  const [balances, dispatchBalances] = useReducer(
    createReducer<GetBalanceRequestModel>(
      (loading) => setLoadingState(prev => ({ ...prev, balances: loading })),
      'currency'
    ), []
  );

  const [currencies, dispatchCurrencies] = useReducer(
    createReducer<GetApiMarketsCurrenciesResponse>(
      (loading) => setLoadingState(prev => ({ ...prev, currencies: loading })),
      'name'
    ), []
  );

  const [tickers, dispatchTickers] = useReducer(
    createReducer<ApiTickers>(
      (loading) => setLoadingState(prev => ({ ...prev, tickers: loading })),
      'pair'
    ), []
  );

  const [userAlerts, dispatchUserAlerts] = useReducer(
    createReducer<PriceAlert>(
      (loading) => setLoadingState(prev => ({ ...prev, userAlerts: loading })),
      'id'
    ), []
  );

  const [history, dispatchHistory] = useReducer(
    createReducer<GetTradeHistoryResponse>(
      (loading) => setLoadingState(prev => ({ ...prev, history: loading })),
      'price'
    ), []
  );

  const [myOrders, dispatchMyOrders] = useReducer(
    createReducer<ApiGetOrders>(
      (loading) => setLoadingState(prev => ({ ...prev, myOrders: loading })),
      'id'
    ), []
  );

  const [myOrdersClosed, dispatchMyOrdersClosed] = useReducer(
    createReducer<ApiGetOrders>(undefined, 'id'), []
  );

  const [markets, dispatchMarkets] = useReducer(
    createReducer<ApiMarket>(
      (loading) => setLoadingState(prev => ({ ...prev, markets: loading })),
      'symbol'
    ), []
  );

  const [bidOrders, dispatchBidOrders] = useReducer(
    createReducer<OrderViewModel>(
      (loading) => setLoadingState(prev => ({ ...prev, orderBook: loading })),
      'price',
      'price',
      true,
      MAX_ORDERBOOK_ITEMS
    ), []
  );

  const [askOrders, dispatchAskOrders] = useReducer(
    createReducer<OrderViewModel>(
      undefined,
      'price',
      'price',
      false,
      MAX_ORDERBOOK_ITEMS
    ), []
  );

  // ====================================================================================
  // LAYOUT CALCULATION
  // ====================================================================================

  const layout = useMemo(() => {
    if (width > 1920) return JSON.parse(LAYOUTS.extraLarge);
    if (width > 1366) return JSON.parse(LAYOUTS.large);
    if (width >= 1024) return JSON.parse(LAYOUTS.medium);
    if (width >= 768) return JSON.parse(LAYOUTS.small);
    return JSON.parse(LAYOUTS.mobile);
  }, [width]);

  // ====================================================================================
  // API CALLS
  // ====================================================================================

  // Load user orders
  const loadUserOrders = useCallback(() => {
    if (!currentMarket || !isSignedIn) return;
    
    BitflexOpenApi.UserApi.apiVversionUserOrdersGet("1.0", currentMarket.pairName)
      .then(response => {
        dispatchMyOrders({ type: DispatcherActionTypes.INIT_LOAD, value: response.data.openOrders });
        dispatchMyOrdersClosed({ type: DispatcherActionTypes.INIT_LOAD, value: response.data.closedOrders });
      })
      .catch(console.error);
  }, [currentMarket, isSignedIn]);

  // ====================================================================================
  // EFFECTS
  // ====================================================================================

  // Initialize data on mount
  useEffect(() => {
    // Load currencies
    BitflexOpenApi.MarketsApi.apiVversionMarketsCurrenciesGet("1.0")
      .then(response => {
        localStorage.setItem('currencies', JSON.stringify(response.data));
        dispatchCurrencies({ type: DispatcherActionTypes.INIT_LOAD, value: response.data });
      })
      .catch(() => setErrorState(prev => ({ ...prev, orderbook: true })));

    // Load markets
    BitflexOpenApi.MarketsApi.apiVversionMarketsGet("1.0", marketsFingerprint)
      .then(response => {
        if (!response.data.result) return;
        
        switch (response.data.code) {
          case StatusCodeEnum.Success:
            dispatchMarkets({ type: DispatcherActionTypes.INIT_LOAD, value: response.data.markets });
            localStorage.setItem('marketsFingerprint', response.data.fingerprint!);
            localStorage.setItem('markets', JSON.stringify(response.data.markets!));
            break;
            
          case StatusCodeEnum.UpToDate:
            const cachedMarkets = localStorage.getItem('markets');
            if (cachedMarkets) {
              dispatchMarkets({ type: DispatcherActionTypes.INIT_LOAD, value: JSON.parse(cachedMarkets) });
            }
            break;
        }
      })
      .catch(console.error);

    // Load tickers
    BitflexOpenApi.MarketsApi.apiVversionMarketsTickersGet("1.0")
      .then(response => {
        if (response.data.result) {
          dispatchTickers({ type: DispatcherActionTypes.INIT_LOAD, value: response.data.tickers });
        }
      })
      .catch(console.error);
  }, [marketsFingerprint]);

  // Set current market when data is loaded
  useEffect(() => {
    if (markets.length === 0 || currencies.length === 0 || currentMarket) return;

    const quoteCurrencyMarket = markets.find(m => m.symbol === quoteCurrency);
    const pair = quoteCurrencyMarket?.pairs?.find(p => p.symbol === baseCurrency);

    if (pair) {
      const baseCurrencyData = currencies.find(c => c.symbol === baseCurrency);
      const quoteCurrencyData = currencies.find(c => c.symbol === quoteCurrency);

      if (baseCurrencyData && quoteCurrencyData) {
        setCurrentMarket({
          pairId: pair.id!,
          pairName: `${baseCurrency}_${quoteCurrency}`,
          baseCurrencySymbol: baseCurrency,
          quoteCurrencySymbol: quoteCurrency,
          baseCurrency: baseCurrencyData,
          quoteCurrency: quoteCurrencyData,
        });
      }
    }
  }, [baseCurrency, currencies, currentMarket, markets, quoteCurrency]);

  // Load market-specific data when current market changes
  useEffect(() => {
    if (!currentMarket || loadingState.currencies || loadingState.tickers || loadingState.markets) {
      return;
    }

    // Load orderbook
    BitflexOpenApi.MarketsApi.apiVversionMarketsOrderbookGet("1.0", currentMarket.pairName)
      .then(response => {
        const orderBook = response.data;
        const buysSorted = orderBook.buy!
          .sort((a, b) => b.price! - a.price!)
          .slice(0, MAX_ORDERBOOK_ITEMS);
        const sellsSorted = orderBook.sell!
          .sort((a, b) => a.price! - b.price!)
          .slice(0, MAX_ORDERBOOK_ITEMS);

        dispatchBidOrders({ type: DispatcherActionTypes.INIT_LOAD, value: buysSorted });
        dispatchAskOrders({ type: DispatcherActionTypes.INIT_LOAD, value: sellsSorted });
      })
      .catch(() => setErrorState(prev => ({ ...prev, orderbook: true })));

    // Load trade history
    BitflexOpenApi.MarketsApi.apiVversionMarketsHistoryGet("1.0", currentMarket.pairName)
      .then(response => {
        dispatchHistory({ type: DispatcherActionTypes.INIT_LOAD, value: response.data });
      })
      .catch(console.error);
  }, [currentMarket, loadingState.currencies, loadingState.markets, loadingState.tickers]);

  // Load user data when signed in
  useEffect(() => {
    if (!isSignedIn) {
      setLoadingState(prev => ({ ...prev, balances: false, myOrders: false, userAlerts: false }));
      return;
    }

    // Load balances
    BitflexOpenApi.UserApi.apiVversionUserBalanceslistGet("1.0")
      .then(response => {
        // Sanitize currency to ensure it's never null
        const sanitizedBalances = (response.data.balances || []).map((balance: GetBalanceRequestModel) => ({
          ...balance,
          currency: balance.currency === null ? undefined : balance.currency
        }));
        dispatchBalances({ type: DispatcherActionTypes.INIT_LOAD, value: sanitizedBalances });
      })
      .catch(console.error);
  }, [isSignedIn]);

  // Load user orders and alerts when market changes
  useEffect(() => {
    if (!currentMarket || !isSignedIn) return;

    loadUserOrders();

    BitflexOpenApi.NotificationsApi.apiVversionNotificationsPricealertGet("1.0", currentMarket.pairName)
      .then(response => {
        // Ensure id is never null
        const sanitizedAlerts = (response.data || []).map((alert: PriceAlert) => ({
          ...alert,
          id: alert.id === null ? undefined : alert.id
        }));
        dispatchUserAlerts({ type: DispatcherActionTypes.INIT_LOAD, value: sanitizedAlerts });
      })
      .catch(console.error);
  }, [currentMarket, isSignedIn, loadUserOrders]);

  // Handle SignalR connection for market data
  useEffect(() => {
    if (terminalHubConnection?.state === HubConnectionState.Connected && currentMarket) {
      JoinPair(currentMarket.pairId);
      return () => LeavePair(currentMarket.pairId);
    }
  }, [currentMarket, terminalHubConnection, JoinPair, LeavePair]);

  // Update document title and URL
  useEffect(() => {
    if (markets.length === 0 || currencies.length === 0) return;

    const completePairName = `${baseCurrency}_${quoteCurrency}`;
    const titleSuffix = " | BCFLEX | Cryptocurrency & Asset Exchange | Bitcoin | Blockchain";
    const title = lastPrice > 0 
      ? `${lastPrice.toFixed(8)} | ${completePairName}${titleSuffix}`
      : `${completePairName}${titleSuffix}`;

    document.title = title;
    dispatch({ type: ActionType.SET_globalPairName, payload: completePairName });
    navigate(`/terminal/${completePairName}`, { replace: true });
  }, [baseCurrency, currencies, dispatch, lastPrice, markets, navigate, quoteCurrency]);

  // ====================================================================================
  // RENDER HELPERS
  // ====================================================================================

  const handleMarketChange = useCallback((id: number, pairName: string, baseCurrencySymbol: string, quoteCurrencySymbol: string) => {
    const baseCurrencyData = currencies.find(c => c.symbol === baseCurrencySymbol);
    const quoteCurrencyData = currencies.find(c => c.symbol === quoteCurrencySymbol);

    if (baseCurrencyData && quoteCurrencyData) {
      setCurrentMarket({
        pairId: id,
        pairName,
        baseCurrencySymbol,
        quoteCurrencySymbol,
        baseCurrency: baseCurrencyData,
        quoteCurrency: quoteCurrencyData,
      });

      dispatch({ type: ActionType.SET_globalPairName, payload: pairName });
      
      const titleSuffix = " | BCFLEX | Cryptocurrency & Asset Exchange | Bitcoin | Blockchain";
      document.title = `${lastPrice?.toFixed(8) || ''} | ${pairName}${titleSuffix}`;
      navigate(`/terminal/${pairName}`);
    }
  }, [currencies, dispatch, lastPrice, navigate]);

  const handleOrderBookClick = useCallback((price: number, amount?: number, orderSide?: TradeType) => {
    setSettedPrice(price);
    setSettedOrderSide(orderSide);
    if (amount) setSettedAmount(amount);
  }, []);

  // Check if any critical data is still loading
  const isMainDataLoading = loadingState.markets || loadingState.currencies || loadingState.tickers;
  const isOrderDataLoading = loadingState.orderBook || loadingState.userAlerts || loadingState.myOrders;

  // ====================================================================================
  // RENDER
  // ====================================================================================

  return (
    <div style={{ filter: isBlur ? 'blur(2px)' : 'none' }}>
      <NavMenu activeIndexIn={0} tickers={tickers} />
      
      <ResponsiveReactGridLayout
        useCSSTransforms={false}
        draggableCancel=".dontDragMe"
        draggableHandle=".draggable"
        preventCollision={true}
        margin={[4, 4]}
        rowHeight={10}
        measureBeforeMount={false}
        isDraggable={false}
        isResizable={false}
        cols={{ lg: 60, md: 60, sm: 60, xs: 60, xxs: 60 }}
        layouts={layout}
      >
        {/* Market Tabs */}
        <div key="1">
          <MarketTabs
            markets={markets}
            isLoading={isMainDataLoading}
            isError={errorState.orderbook}
            tickers={tickers}
            currentMarket={currentMarket}
            currencies={currencies}
            setCurrentMarket={handleMarketChange}
          />
        </div>

        {/* Trading Chart */}
        <div key="2">
          <TVChartContainer
            symbol={base_quote_pair}
            orders={myOrders}
            dispatch_myOrders={dispatchMyOrders}
            myOrdersClosed={myOrdersClosed}
            dispatch_myOrdersClosed={dispatchMyOrdersClosed}
          />
        </div>

        {/* Create Order */}
        <div key="3">
          {currentMarket && (
            <CreateOrder
              balances={balances}
              dispatch_balances={dispatchBalances}
              isBalancesLoading={isOrderDataLoading}
              dispatch_myOrders={dispatchMyOrders}
              isLoading={loadingState.currencies}
              bidOrders={bidOrders}
              askOrders={askOrders}
              currentMarket={currentMarket}
              price={settedPrice}
              amount={settedAmount}
              orderSide={settedOrderSide}
              tickers={tickers}
            />
          )}
        </div>

        {/* Orders */}
        <div key="5">
          <Orders
            onForceUpdate={forceUpdate}
            onForceUserOrdersReload={loadUserOrders}
            orders={myOrders}
            dispatch_myOrders={dispatchMyOrders}
            myOrdersClosed={myOrdersClosed}
            dispatch_myOrdersClosed={dispatchMyOrdersClosed}
            isLoading={loadingState.myOrders}
          />
        </div>

        {/* Order Book */}
        <div key="7">
          {currentMarket && (
            <OrderBook
              bidOrders={bidOrders}
              askOrders={askOrders}
              isLoading={loadingState.orderBook}
              isError={errorState.orderbook}
              currentMarket={currentMarket}
              setPriceAmount={handleOrderBookClick}
            />
          )}
        </div>

        {/* Trade History */}
        <div key="8">
          <History
            tradeHistory={history}
            isLoading={loadingState.history}
            isError={errorState.orderbook}
          />
        </div>

        {/* Price Alerts */}
        <div key="9">
          <PriceAlertPortlet
            currency={quoteCurrency}
            baseCurrency={baseCurrency}
            userAlerts={userAlerts}
            dispatch_userAlerts={dispatchUserAlerts}
            isLoading={loadingState.userAlerts}
            tickers={tickers}
          />
        </div>
      </ResponsiveReactGridLayout>

      {/* Footer */}
      <div className="bf-footer">
        <Link to="/legal" className="footerelem">Legal</Link>
        <Link to="/privacy" className="footerelem">Privacy Policy</Link>
        <Link to="/affiliate" className="footerelem">Affiliate</Link>
        <Link to="/fees" className="footerelem">Fees</Link>
        <Link to="/api" className="footerelem">API</Link>
        
        <span style={{ fontSize: 13, paddingTop: 0, marginRight: 10 }}>
          Server Time: UTC
        </span>
        <span style={{ fontSize: 13, paddingTop: 0 }}>
          © 2021-{new Date().getFullYear()}{' '}
          <span style={{ color: 'rgba(255,255,255,0.87)' }}>
            Flex Technologies Limited
          </span>
        </span>
        <div style={{ fontSize: 13, paddingTop: 0, marginBottom: 2 }}>
          <img src={flex_tech} alt="Flex Technologies" style={{ height: 20, paddingTop: 4 }} />
        </div>
      </div>
    </div>
  );
}