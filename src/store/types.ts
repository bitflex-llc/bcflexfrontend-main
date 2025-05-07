import * as React from 'react';

import { ApiTickers, GetBalanceRequestModel, Order, RequestSettingsTokenResponseModel, Type } from '../api-wrapper/api';

import { HubConnection } from '@microsoft/signalr';

export type Dispatch = React.Dispatch<any>;

export interface IAction {
  type: number;
  payload: any;
}

export interface IState {
  isLoading: boolean;
  isBlur: boolean;

  settings?: RequestSettingsTokenResponseModel;

  marketType: "Spot" | "Margin"; //| undefined;

  markets: Array<IMarket>;
  marketsLoaded: boolean;

  currentPairId: string;

  currentMarket: string;
  currentPair: string;
  userOrders: Array<Order>;

  balances: Array<GetBalanceRequestModel>;
  balanceStats: Array<IBalanceStats>;

  bidOrders: Array<IOrderbookOrder>;
  askOrders: Array<IOrderbookOrder>;

  lastPrice: number;
  tradingHistory: Array<IMarketHistory>;
  currentMarketImage: string;
  currencies: Array<ICurrency>;

  takerFee: number;
  makerFee: number;
  fingerprintMarket: string;
  tickers: Array<ApiTickers>;
  averageColor: string;
  nonce: string;
  privateHubConnection: HubConnection | undefined;
  terminalHubConnection: HubConnection | undefined;

  tvChart: any | undefined;


  globalPairName: string;
}

export interface ICurrency {
  id: number;
  name: string;
  symbol: string;
  imageBase64: string;
  type: Type;
}

export interface IBalance {
  currency: string;
  total: number;
  onOrders: number;
  available: number;
}

export interface IBalanceStats {
  usdHoldings: number;
  btcHoldings: number;
  limit: number;
  usedLimit: number;
}

export interface IPair {
  pair: string;
  symbol: string;
  imgBase64: string;
  id: string;
}

export interface IMarket {
  symbol: string;
  pairs: IPair[];
}

export interface IMarketHistory {
  dateTime: number;
  price: number;
  amount: number;
  type: number;
}

export enum OrderTypes {
  Market,
  Limit,
  StopLossLimit,
  TakeProfitLimit,
  StopLossMarket
}

export interface IOrderbookOrder {
  price: number;
  quantity: number;

  isNew: boolean;
}

export interface Comparsion {
  added?: IOrderbookOrder[];
  updated?: IOrderbookOrder[];
  removed?: IOrderbookOrder[];
}

export class IOrderBookUpdate {
  sell?: Comparsion;
  buy?: Comparsion;
}

export interface OrderBook {
  bidOrders: Array<IOrderbookOrder>;
  askOrders: Array<IOrderbookOrder>;
}