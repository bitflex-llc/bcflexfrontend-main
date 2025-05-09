/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable array-callback-return */

import { ApiGetOrders, ApiMarket, GetBalanceRequestModel, GetTradeHistoryResponse, PriceAlert, StatusCodeEnum } from '../../api-wrapper';
import { ApiTickers, GetApiMarketsCurrenciesResponse, OrderViewModel, TradeType } from '../../api-wrapper/api';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useReducer, useState } from 'react';
import { Responsive, WidthProvider } from "react-grid-layout";
import { useCallback, useContext } from 'react';

import { ActionType } from '../../store/actionTypes';
import { BitflexOpenApi } from "../../_helpers/BitflexOpenApi";
import { CreateOrder } from "./CreateOrder"
import { History } from './History'
import { HubConnectionState } from '@microsoft/signalr';
import { MarketTabs } from './MarketTabs'
import { NavMenu } from '../NavMenu';
import { OrderBook } from './OrderBook';
import { Orders } from './Orders';
import { PriceAlertPortlet } from './PriceAlertPortlet';
import { Store } from '../../store';
import { TVChartContainer } from './TradingViewChart';
// import { TradingViewSecond } from './TradingViewChart';
import flex_tech from '../../images/flex_technologies_logo.svg'
import { isMobile } from "react-device-detect";
import { useForceUpdate } from '../../hooks/useForceUpdate';
// import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useParams } from "react-router";
import { useSignalR } from '../../hooks/useSignalR';
import useUserState from '../../hooks/useUserState';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export enum DispacherBaseTypes {
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

export default function Terminal() {
    const {
        state: { isBlur, terminalHubConnection, lastPrice },
        dispatch
    } = React.useContext(Store);

    const { isSignedIn } = useUserState();

    let { base_quote_pair = "PLUTO_INR" } = useParams<{ base_quote_pair: string }>();

    const { width } = useWindowDimensions();

    const forceUpdate = useForceUpdate();

    const [marketsFingerprint] = useState<string>(() => localStorage.getItem('marketsFingerprint')!);

    const historyRoute = useNavigate();

    const [currentMarket, setcurrentMarket] = useState<ICurrentMarketState>();

    var splitted = base_quote_pair.split('_');

    var baseCurrency = splitted[0]
    var quoteCurrency = splitted[1]

    var bigScreen = '{"lg":[{"w":12,"h":38,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":35,"h":38,"x":12,"y":0,"i":"2","moved":false,"static":false},{"w":13,"h":38,"x":47,"y":0,"i":"3","moved":false,"static":false},{"w":34,"h":41,"x":26,"y":38,"i":"5","moved":false,"static":false},{"w":14,"h":41,"x":12,"y":38,"i":"7","moved":false,"static":false},{"w":12,"h":17,"x":0,"y":38,"i":"8","moved":false,"static":false},{"w":12,"h":24,"x":0,"y":55,"i":"9","moved":false,"static":false}]}'
    var extraLargeScren = '{"lg":[{"w":7,"h":78,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":36,"h":45,"x":7,"y":0,"i":"2","moved":false,"static":false},{"w":9,"h":37,"x":43,"y":0,"i":"3","moved":false,"static":false},{"w":36,"h":33,"x":7,"y":45,"i":"5","moved":false,"static":false},{"w":8,"h":78,"x":52,"y":0,"i":"7","moved":false,"static":false},{"w":9,"h":18,"x":43,"y":60,"i":"8","moved":false,"static":false},{"w":9,"h":23,"x":43,"y":37,"i":"9","moved":false,"static":false}]}'

    var mediumScreen = '{"lg":[{"w":12,"h":38,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":31,"h":38,"x":12,"y":0,"i":"2","moved":false,"static":false},{"w":17,"h":38,"x":43,"y":0,"i":"3","moved":false,"static":false},{"w":43,"h":36,"x":0,"y":38,"i":"5","moved":false,"static":false},{"w":17,"h":36,"x":43,"y":38,"i":"7","moved":false,"static":false},{"w":43,"h":26,"x":0,"y":74,"i":"8","moved":false,"static":false},{"w":17,"h":26,"x":43,"y":74,"i":"9","moved":false,"static":false}],"sm":[{"w":26,"h":47,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":34,"h":34,"x":26,"y":0,"i":"2","moved":false,"static":false},{"w":26,"h":30,"x":0,"y":66,"i":"3","moved":false,"static":false},{"w":34,"h":30,"x":26,"y":66,"i":"4","moved":false,"static":false},{"w":34,"h":27,"x":0,"y":96,"i":"5","moved":false,"static":false},{"w":26,"h":19,"x":0,"y":47,"i":"6","moved":false,"static":false},{"w":34,"h":32,"x":26,"y":34,"i":"7","moved":false,"static":false},{"w":26,"h":27,"x":34,"y":96,"i":"8","moved":false,"static":false}],"xs":[{"w":23,"h":34,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":37,"h":34,"x":23,"y":0,"i":"2","moved":false,"static":false},{"w":27,"h":40,"x":0,"y":34,"i":"3","moved":false,"static":false},{"w":60,"h":26,"x":0,"y":74,"i":"5","moved":false,"static":false},{"w":33,"h":40,"x":27,"y":34,"i":"7","moved":false,"static":false},{"w":60,"h":19,"x":0,"y":100,"i":"8","moved":false,"static":false}],"md":[{"w":13,"h":37,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":28,"h":37,"x":13,"y":0,"i":"2","moved":false,"static":false},{"w":19,"h":37,"x":41,"y":0,"i":"3","moved":false,"static":false},{"w":44,"h":28,"x":0,"y":37,"i":"5","moved":false,"static":false},{"w":16,"h":50,"x":44,"y":37,"i":"7","moved":false,"static":false},{"w":26,"h":22,"x":0,"y":65,"i":"8","moved":false,"static":false},{"w":18,"h":22,"x":26,"y":65,"i":"9","moved":false,"static":false}]}'
    // var extraSmall = '{"lg":[{"w":18,"h":63,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":42,"h":35,"x":18,"y":0,"i":"2","moved":false,"static":false},{"w":24,"h":28,"x":18,"y":35,"i":"3","moved":false,"static":false},{"w":30,"h":31,"x":30,"y":63,"i":"4","moved":false,"static":false},{"w":30,"h":31,"x":0,"y":63,"i":"5","moved":false,"static":false},{"w":30,"h":29,"x":0,"y":94,"i":"6","moved":false,"static":false},{"w":18,"h":28,"x":42,"y":35,"i":"7","moved":false,"static":false},{"w":30,"h":29,"x":30,"y":94,"i":"8","moved":false,"static":false}],"sm":[{"w":26,"h":47,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":34,"h":34,"x":26,"y":0,"i":"2","moved":false,"static":false},{"w":26,"h":30,"x":0,"y":66,"i":"3","moved":false,"static":false},{"w":34,"h":30,"x":26,"y":66,"i":"4","moved":false,"static":false},{"w":34,"h":27,"x":0,"y":96,"i":"5","moved":false,"static":false},{"w":26,"h":19,"x":0,"y":47,"i":"6","moved":false,"static":false},{"w":34,"h":32,"x":26,"y":34,"i":"7","moved":false,"static":false},{"w":26,"h":27,"x":34,"y":96,"i":"8","moved":false,"static":false}],"xs":[{"w":23,"h":34,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":37,"h":34,"x":23,"y":0,"i":"2","moved":false,"static":false},{"w":27,"h":40,"x":0,"y":34,"i":"3","moved":false,"static":false},{"w":60,"h":26,"x":0,"y":74,"i":"5","moved":false,"static":false},{"w":33,"h":40,"x":27,"y":34,"i":"7","moved":false,"static":false},{"w":31,"h":24,"x":0,"y":100,"i":"8","moved":false,"static":false},{"w":29,"h":24,"x":31,"y":100,"i":"9","moved":false,"static":false}],"md":[{"w":18,"h":63,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":42,"h":35,"x":18,"y":0,"i":"2","moved":false,"static":false},{"w":21,"h":40,"x":18,"y":35,"i":"3","moved":false,"static":false},{"w":42,"h":31,"x":18,"y":75,"i":"5","moved":false,"static":false},{"w":21,"h":40,"x":39,"y":35,"i":"7","moved":false,"static":false},{"w":18,"h":43,"x":0,"y":63,"i":"8","moved":false,"static":false}]}'
    var extraSmall = '{"lg":[{"w":18,"h":63,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":42,"h":35,"x":18,"y":0,"i":"2","moved":false,"static":false},{"w":24,"h":28,"x":18,"y":35,"i":"3","moved":false,"static":false},{"w":30,"h":31,"x":30,"y":63,"i":"4","moved":false,"static":false},{"w":30,"h":31,"x":0,"y":63,"i":"5","moved":false,"static":false},{"w":30,"h":29,"x":0,"y":94,"i":"6","moved":false,"static":false},{"w":18,"h":28,"x":42,"y":35,"i":"7","moved":false,"static":false},{"w":30,"h":29,"x":30,"y":94,"i":"8","moved":false,"static":false}],"sm":[{"w":15,"h":30,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":45,"h":30,"x":15,"y":0,"i":"2","moved":false,"static":false},{"w":26,"h":36,"x":0,"y":30,"i":"3","moved":false,"static":false},{"w":34,"h":41,"x":0,"y":66,"i":"5","moved":false,"static":false},{"w":34,"h":36,"x":26,"y":30,"i":"7","moved":false,"static":false},{"w":26,"h":18,"x":34,"y":66,"i":"8","moved":false,"static":false},{"w":26,"h":23,"x":34,"y":84,"i":"9","moved":false,"static":false}],"xs":[{"w":23,"h":34,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":37,"h":34,"x":23,"y":0,"i":"2","moved":false,"static":false},{"w":27,"h":40,"x":0,"y":34,"i":"3","moved":false,"static":false},{"w":60,"h":26,"x":0,"y":74,"i":"5","moved":false,"static":false},{"w":33,"h":40,"x":27,"y":34,"i":"7","moved":false,"static":false},{"w":31,"h":24,"x":0,"y":100,"i":"8","moved":false,"static":false},{"w":29,"h":24,"x":31,"y":100,"i":"9","moved":false,"static":false}],"md":[{"w":18,"h":63,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":42,"h":35,"x":18,"y":0,"i":"2","moved":false,"static":false},{"w":21,"h":40,"x":18,"y":35,"i":"3","moved":false,"static":false},{"w":42,"h":31,"x":18,"y":75,"i":"5","moved":false,"static":false},{"w":21,"h":40,"x":39,"y":35,"i":"7","moved":false,"static":false},{"w":18,"h":43,"x":0,"y":63,"i":"8","moved":false,"static":false}]}'
    // var mobile = '{"lg":[{"w":18,"h":63,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":42,"h":39,"x":18,"y":0,"i":"2","moved":false,"static":false},{"w":24,"h":32,"x":18,"y":35,"i":"3","moved":false,"static":false},{"w":30,"h":31,"x":30,"y":63,"i":"4","moved":false,"static":false},{"w":30,"h":31,"x":0,"y":63,"i":"5","moved":false,"static":false},{"w":30,"h":29,"x":0,"y":94,"i":"6","moved":false,"static":false},{"w":18,"h":28,"x":42,"y":35,"i":"7","moved":false,"static":false},{"w":30,"h":29,"x":30,"y":94,"i":"8","moved":false,"static":false}],"xxs":[{"w":60,"h":26,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":60,"h":35,"x":0,"y":26,"i":"2","moved":false,"static":false},{"w":60,"h":45,"x":0,"y":100,"i":"3","moved":false,"static":false},{"w":60,"h":31,"x":0,"y":145,"i":"5","moved":false,"static":false},{"w":60,"h":39,"x":0,"y":61,"i":"7","moved":false,"static":false},{"w":60,"h":21,"x":0,"y":176,"i":"8","moved":false,"static":false},{"w":60,"h":23,"x":0,"y":197,"i":"9","moved":false,"static":false}]}'
    var mobile = '{"lg":[{"w":18,"h":63,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":42,"h":39,"x":18,"y":0,"i":"2","moved":false,"static":false},{"w":24,"h":32,"x":18,"y":35,"i":"3","moved":false,"static":false},{"w":30,"h":31,"x":30,"y":63,"i":"4","moved":false,"static":false},{"w":30,"h":31,"x":0,"y":63,"i":"5","moved":false,"static":false},{"w":30,"h":29,"x":0,"y":94,"i":"6","moved":false,"static":false},{"w":18,"h":28,"x":42,"y":35,"i":"7","moved":false,"static":false},{"w":30,"h":29,"x":30,"y":94,"i":"8","moved":false,"static":false}],"xxs":[{"w":60,"h":26,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":60,"h":35,"x":0,"y":26,"i":"2","moved":false,"static":false},{"w":60,"h":45,"x":0,"y":100,"i":"3","moved":false,"static":false},{"w":60,"h":31,"x":0,"y":145,"i":"5","moved":false,"static":false},{"w":60,"h":39,"x":0,"y":61,"i":"7","moved":false,"static":false},{"w":60,"h":21,"x":0,"y":176,"i":"8","moved":false,"static":false},{"w":60,"h":23,"x":0,"y":197,"i":"9","moved":false,"static":false}],"xs":[{"w":18,"h":39,"x":0,"y":0,"i":"1","moved":false,"static":false},{"w":42,"h":39,"x":18,"y":0,"i":"2","moved":false,"static":false},{"w":30,"h":35,"x":0,"y":39,"i":"3","moved":false,"static":false},{"w":30,"h":36,"x":0,"y":74,"i":"5","moved":false,"static":false},{"w":30,"h":35,"x":30,"y":39,"i":"7","moved":false,"static":false},{"w":30,"h":13,"x":30,"y":74,"i":"8","moved":false,"static":false},{"w":30,"h":23,"x":30,"y":87,"i":"9","moved":false,"static":false}]}'
    var layout;

    if (width > 1920) {
        layout = JSON.parse(extraLargeScren)
    } else if (width > 1366 && width <= 1920) {
        layout = JSON.parse(bigScreen)

    } else if (width >= 1024 && width <= 1366) {
        layout = JSON.parse(mediumScreen)
    } else if (width >= 768 && width < 1024) {
        layout = JSON.parse(extraSmall)
    } else {
        layout = JSON.parse(mobile)
    }



    const [balancesLoading, setbalancesLoading] = useState(isSignedIn);
    const [currenciesLoading, setcurrenciesLoading] = useState(true);
    const [userAlertsLoading, setuserAlertsLoading] = useState(isSignedIn);
    const [isHistoryLoading, setisHistoryLoading] = useState(true);
    const [isOrderBookLoading, setisOrderBookLoading] = useState(isSignedIn);
    const [isOrderbookError, setisOrderbookError] = useState(false);

    const [isMarketsLoading, setisMarketsLoading] = useState(true);
    const [myOrdersLoading, setmyOrdersLoading] = useState(isSignedIn);

    const [tickersLoading, settickersLoading] = useState(true);

    const [settedPrice, setsettedPrice] = useState<number>();
    const [settedAmount, setsettedAmount] = useState<number>();

    const [settedOrderSide, setSettedOrderSide] = useState<TradeType>();

    const { JoinPair, LeavePair } = useSignalR();

    useEffect(() => {
        if (terminalHubConnection && terminalHubConnection.state === HubConnectionState.Connected && currentMarket) {
            JoinPair(currentMarket.pairId)
        }

        return () => currentMarket && LeavePair(currentMarket.pairId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMarket, terminalHubConnection]);

    useEffect(() => {

        BitflexOpenApi.MarketsApi.apiVversionMarketsCurrenciesGet("1.0",).then(response => {
            localStorage.setItem('currencies', JSON.stringify(response.data));
            dispatch_currencies({ type: DispacherBaseTypes.INIT_LOAD, value: response.data });
        })
            .catch(() => setisOrderbookError(true))

        BitflexOpenApi.MarketsApi.apiVversionMarketsGet("1.0", marketsFingerprint).then(response => {
            if (response.data.result)
                switch (response.data.code) {
                    case StatusCodeEnum.Success:
                        dispatch_markets({ type: DispacherBaseTypes.INIT_LOAD, value: response.data.markets });
                        localStorage.setItem('marketsFingerprint', response.data.fingerprint!)
                        localStorage.setItem('markets', JSON.stringify(response.data.markets!))

                        break;
                    case StatusCodeEnum.UpToDate:
                        dispatch_markets({ type: DispacherBaseTypes.INIT_LOAD, value: JSON.parse(localStorage.getItem('markets')!) });
                        break;

                    case StatusCodeEnum.Error:
                    default:
                }
        })

        BitflexOpenApi.MarketsApi.apiVversionMarketsTickersGet("1.0",).then(response => {
            if (response.data.result)
                dispatch_tickers({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: response.data.tickers
                });
        });
    }, [marketsFingerprint]);

    useEffect(() => console.log("currentMarket CALLED HOOK", currentMarket), [currentMarket])

    useEffect(() => {

        setisOrderBookLoading(true)
        setisHistoryLoading(true)


        if (!currentMarket || currenciesLoading || tickersLoading || isMarketsLoading) return;

        BitflexOpenApi.MarketsApi.apiVversionMarketsOrderbookGet("1.0", currentMarket?.pairName)
            .then(orders => {

                var orderBook = orders.data;
                var buysSorted = orderBook.buy!.sort((a, b) => (a.price! > b.price! ? -1 : 1)).slice(0, 25);
                var sellsSorted = orderBook.sell!.sort((a, b) => (b.price! > a.price! ? -1 : 1)).slice(0, 25);

                dispatch_bidOrders({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: buysSorted
                });

                dispatch_askOrders({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: sellsSorted
                });
            })
            .catch(() => setisOrderbookError(true))

        BitflexOpenApi.MarketsApi.apiVversionMarketsHistoryGet("1.0", currentMarket?.pairName)
            .then(response =>
                dispatch_history({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: response.data
                }));
    }, [currenciesLoading, currentMarket, isMarketsLoading, tickersLoading]);

    useEffect(() => {
        if (isSignedIn)
            BitflexOpenApi.UserApi.apiVversionUserBalanceslistGet("1.0",)
                .then(response =>
                    dispatch_balances({
                        type: DispacherBaseTypes.INIT_LOAD,
                        value: response.data.balances
                    }));
        else {
            setbalancesLoading(false)
            setmyOrdersLoading(false)
        }
    }, [isSignedIn]);

    const LoadUserOrders = () => {
        BitflexOpenApi.UserApi.apiVversionUserOrdersGet("1.0", currentMarket?.pairName)
            .then(response => {
                dispatch_myOrders({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: response.data.openOrders
                })

                dispatch_myOrdersClosed({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: response.data.closedOrders
                })
            });
    }

    useEffect(() => {

        if (!currentMarket || !isSignedIn) return;
        setmyOrdersLoading(true)

        LoadUserOrders();

        BitflexOpenApi.NotificationsApi.apiVversionNotificationsPricealertGet("1.0", currentMarket?.pairName)
            .then(response =>
                dispatch_userAlerts({ type: DispacherBaseTypes.INIT_LOAD, value: response.data }));

    }, [isSignedIn, currentMarket]);

    const [balances, dispatch_balances] = useReducer((balances: Array<GetBalanceRequestModel>, { type, value }): Array<GetBalanceRequestModel> => {
        const index = balances.findIndex((item) => item.currency === value.currency);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setbalancesLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...balances, value];
                else {
                    const newBalances = [...balances];
                    newBalances[index] = value;
                    return newBalances;
                }
            default: return balances;
        }
    }, []);
    const [currencies, dispatch_currencies] = useReducer((currencies: Array<GetApiMarketsCurrenciesResponse>, { type, value }): Array<GetApiMarketsCurrenciesResponse> => {
        const index = currencies.findIndex((item) => item.name === value.name);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setcurrenciesLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...currencies, value];
                else {
                    const newValue = [...currencies];
                    newValue[index] = value;
                    return newValue;
                }
            default: return currencies;
        }
    }, []);
    const [tickers, dispatch_tickers] = useReducer((tickers: Array<ApiTickers>, { type, value }): Array<ApiTickers> => {
        const index = tickers.findIndex((item) => item.pair === value.pair);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                settickersLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...tickers, value];
                else {
                    const newtickers = [...tickers];
                    newtickers[index] = value;
                    return newtickers;
                }
            default: return tickers;
        }
    }, []);
    const [userAlerts, dispatch_userAlerts] = useReducer((alerts: Array<PriceAlert>, { type, value }): Array<PriceAlert> => {
        const index = alerts.findIndex((item) => item.id === value);

        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setuserAlertsLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1)
                    return [...alerts, value];
                else {
                    const newAlerts = [...alerts];
                    newAlerts[index] = value;
                    return newAlerts;
                }

            case DispacherBaseTypes.DELETE:
                return alerts.filter((_, index) => index !== alerts.findIndex((x) => x.id === value));
            default:
                return alerts;
        }
    }, []);
    const [history, dispatch_history] = useReducer((orders: Array<GetTradeHistoryResponse>, { type, value }): Array<GetTradeHistoryResponse> => {
        const index = orders.findIndex((item) => item.price === value.price);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setisHistoryLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...orders, value];
                else {
                    const newHistory = [...orders];
                    newHistory[index] = value;
                    return newHistory;
                }
            default: return orders;
        }
    }, []);
    const [myOrders, dispatch_myOrders] = useReducer((orders: Array<ApiGetOrders>, { type, value }): Array<ApiGetOrders> => {
        const index = orders.findIndex((item) => item.id === value.id);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setmyOrdersLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...orders, value];
                else {
                    const newOrders = [...orders];
                    newOrders[index] = value;
                    return newOrders;
                }

            case DispacherBaseTypes.DELETE:
                return orders.filter((_, index) => index !== orders.findIndex((x) => x.id === value.id),);
            default: return orders;
        }
    }, []);
    const [myOrdersClosed, dispatch_myOrdersClosed] = useReducer((orders: Array<ApiGetOrders>, { type, value }): Array<ApiGetOrders> => {
        const index = orders.findIndex((item) => item.id === value.id);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setmyOrdersLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...orders, value];
                else {
                    const newOrders = [...orders];
                    newOrders[index] = value;
                    return newOrders;
                }

            case DispacherBaseTypes.DELETE:
                return orders.filter((_, index) => index !== orders.findIndex((x) => x.id === value.id),);
            default: return orders;
        }
    }, []);
    const [markets, dispatch_markets] = useReducer((markets: Array<ApiMarket>, { type, value }): Array<ApiMarket> => {
        const index = markets.findIndex((item) => item.symbol === value.symbol);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setisMarketsLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...markets, value];
                else {
                    let newOrders = [...markets];
                    newOrders[index] = value;
                    return newOrders;
                }
            default: return markets;
        }
    }, []);
    const [bidOrders, dispatch_bidOrders] = useReducer((orders: Array<OrderViewModel>, { type, value }): Array<OrderViewModel> => {
        const index = orders.findIndex((item) => item.price === value.price);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setisOrderBookLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) {
                    return [...orders.sort((a, b) => (a.price! > b.price! ? -1 : 1)).slice(0, 25), value];
                }
                else {
                    const newOrders = [...orders];
                    newOrders[index] = value;
                    return newOrders.sort((a, b) => (a.price! > b.price! ? -1 : 1)).slice(0, 25);
                }
            case DispacherBaseTypes.DELETE:
                return orders.filter((_, index) => index !== orders.findIndex((x) => x.price === value.price),);
            default:
                return orders;
        }
    }, []);
    const [askOrders, dispatch_askOrders] = useReducer((orders: Array<OrderViewModel>, { type, value }): Array<OrderViewModel> => {
        const index = orders.findIndex((item) => item.price === value.price);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setisOrderBookLoading(false)
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) {
                    return [...orders.sort((a, b) => (b.price! > a.price! ? -1 : 1)).slice(0, 25), value];
                } else {
                    const newOrders = [...orders];
                    newOrders[index] = value;
                    return newOrders.sort((a, b) => (b.price! > a.price! ? -1 : 1)).slice(0, 25);
                }
            case DispacherBaseTypes.DELETE:
                return orders.filter((_, index) => index !== orders.findIndex((x) => x.price === value.price),);
            default:
                return orders;
        }
    }, []);

    useEffect(() => {

        if (markets.length === 0 || currencies.length === 0 || currentMarket) return;

        var pair = markets.find(_ => _.symbol === quoteCurrency)?.pairs?.find(_ => _.symbol === baseCurrency);

        if (pair) {
            setcurrentMarket({
                pairId: pair.id!,
                pairName: baseCurrency + '_' + quoteCurrency,

                baseCurrencySymbol: baseCurrency,
                quoteCurrencySymbol: quoteCurrency,

                baseCurrency: currencies.find(_ => _.symbol === baseCurrency)!,
                quoteCurrency: currencies.find(_ => _.symbol === quoteCurrency)!,
            })
        }

    }, [baseCurrency, currencies, currentMarket, markets, quoteCurrency]);

    useEffect(() => {
        if (markets.length === 0 || currencies.length === 0) return;
        markets.map((marketIn) => {
            if (!marketIn.pairs) return;
            marketIn.pairs.map(pairIn => {

                var completePairName = baseCurrency + '_' + quoteCurrency;

                if (pairIn.pair === completePairName) {

                    dispatch({
                        type: ActionType.SET_globalPairName,
                        payload: completePairName
                    });

                    var titleMask = " | BCFLEX | Cryptocurrency & Asset Exchange | Bitcoin | Blockchain"

                    var title = lastPrice > 0
                        ? lastPrice.toFixed(8) + " | " + completePairName + titleMask
                        : completePairName + titleMask;



                    document.title = title

                    historyRoute('/terminal/' + completePairName)
                }
            });
        });
    }, [baseCurrency, currencies, dispatch, historyRoute, lastPrice, markets, quoteCurrency]);

    const RenderMarketTabs = useCallback(() => {

        var isLoadingInside = isMarketsLoading;
        if (currencies.length === 0 || markets.length === 0 || tickers.length === 0 || !historyRoute)
            isLoadingInside = true;

        return <MarketTabs
            markets={markets}
            // dispatch_markets={dispatch_markets}
            isLoading={(isLoadingInside || tickersLoading || currenciesLoading)}
            isError={isOrderbookError}
            tickers={tickers}
            currentMarket={currentMarket}
            currencies={currencies}
            setCurrentMarket={(id, pairName, baseCurrencySymbol, quoteCurrencySymbol) => {

                dispatch({
                    type: ActionType.SET_globalPairName,
                    payload: pairName
                });

                console.log("setcurrentMarket", "CALL 2")

                setcurrentMarket({
                    pairId: id,
                    pairName: pairName,

                    baseCurrencySymbol: baseCurrencySymbol,
                    quoteCurrencySymbol: quoteCurrencySymbol,

                    baseCurrency: currencies.find(_ => _.symbol === baseCurrencySymbol)!,
                    quoteCurrency: currencies.find(_ => _.symbol === quoteCurrencySymbol)!,
                })

                document.title = lastPrice?.toFixed(8) + " | " + pairName + " | BCFLEX | Cryptocurrency & Asset Exchange | Bitcoin | Blockchain"
                historyRoute('/terminal/' + pairName)
            }}
        />
    }, [currencies, currenciesLoading, currentMarket, dispatch, historyRoute, isMarketsLoading, isOrderbookError, lastPrice, markets, tickers, tickersLoading]);

    const RenderUserAlerts = useCallback(() => {
        return <PriceAlertPortlet
            currency={quoteCurrency}
            baseCurrency={baseCurrency}
            userAlerts={userAlerts}
            dispatch_userAlerts={dispatch_userAlerts}
            isLoading={userAlertsLoading}
            tickers={tickers}

        />
    }, [baseCurrency, quoteCurrency, userAlerts, userAlertsLoading]);

    const RenderCreateOrder = useCallback(() => {
        return <CreateOrder
            balances={balances} dispatch_balances={dispatch_balances}
            isBalancesLoading={(isMarketsLoading || tickersLoading || isOrderBookLoading || userAlertsLoading || myOrdersLoading)}
            dispatch_myOrders={dispatch_myOrders}
            isLoading={currenciesLoading}
            bidOrders={bidOrders}
            askOrders={askOrders}
            currentMarket={currentMarket!}

            price={settedPrice}
            amount={settedAmount}
            orderSide={settedOrderSide}

            tickers={tickers}
        />
    }, [balances, isMarketsLoading, tickersLoading, isOrderBookLoading, userAlertsLoading, myOrdersLoading, currenciesLoading, bidOrders, askOrders, currentMarket, settedPrice, settedAmount, settedOrderSide, tickers]);

    const RenderOrderbook = useCallback(() => {
        return <OrderBook
            bidOrders={bidOrders} //dispatch_bidOrders={dispatch_bidOrders}
            askOrders={askOrders} //dispatch_askOrders={dispatch_askOrders}
            isLoading={isOrderBookLoading}
            isError={isOrderbookError}

            currentMarket={currentMarket!}
            setPriceAmount={(price, amount, orderSide) => {
                setsettedPrice(price)
                setSettedOrderSide(orderSide)
                if (amount)
                    setsettedAmount(amount)
            }}
        />
    }, [askOrders, bidOrders, currentMarket, isOrderBookLoading, isOrderbookError]);

    return (
        <div style={{ filter: isBlur ? 'blur(2px)' : '' }}>
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
                onLayoutChange={(layout, layouts) => {
                    console.log(JSON.stringify(layout))
                    console.log(JSON.stringify(layouts))
                    // setReactGridLayout(layouts)
                }}>
                <div key="1">
                    {RenderMarketTabs()}
                </div>
                <div key="2">
                    <TVChartContainer
                        symbol={base_quote_pair}
                        orders={myOrders}
                        dispatch_myOrders={dispatch_myOrders}
                        myOrdersClosed={myOrdersClosed}
                        dispatch_myOrdersClosed={dispatch_myOrdersClosed}
                    />
                </div>
                <div key="3">
                    {RenderCreateOrder()}
                </div>
                <div key="5">
                    <Orders onForceUpdate={() => { forceUpdate() }}
                        onForceUserOrdersReload={() => LoadUserOrders()}
                        orders={myOrders} dispatch_myOrders={dispatch_myOrders}
                        myOrdersClosed={myOrdersClosed} dispatch_myOrdersClosed={dispatch_myOrdersClosed}
                        isLoading={myOrdersLoading}
                    />
                </div>
                <div key="7">
                    {RenderOrderbook()}
                </div>
                <div key="8">
                    <History tradeHistory={history} isLoading={isHistoryLoading} isError={isOrderbookError} />
                </div>
                <div key="9">
                    {RenderUserAlerts()}
                </div>
            </ResponsiveReactGridLayout>
            {/* <div className="position-relative marquee-container d-none d-sm-block">
                <div className="marquee d-flex justify-content-around">
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                </div>
                <div className="marquee marquee2 d-flex justify-content-around">
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                    <span>BTC<b>3,588.39</b></span>
                    <span>XRP<b>0.32</b></span>
                    <span>ETH<b>116.36</b></span>
                    <span>EOS<b>2.44</b></span>
                    <span>USDT<b>1.01</b></span>
                    <span>LTC<b>32.61</b></span>
                    <span>XLM<b>0.10</b></span>
                    <span>TRX<b>0.03</b></span>
                    <span>BSV<b>74.29</b></span>
                    <span>ADA<b>0.04</b></span>
                </div>
            </div> */}
            <div className={'bf-footer'} >
                <Link to={'/legal'} className={'footerelem'}>Legal</Link>
                <Link to={'/privacy'} className={'footerelem'}>Privacy Policy</Link>
                <Link to={'/affiliate'} className={'footerelem'}>Affiliate</Link>
                <Link to={'/fees'} className={'footerelem'}>Fees</Link>
                <Link to={'/api'} className={'footerelem'}>API</Link>

                <span style={{ fontSize: 13, paddingTop: 0, marginRight: 10 }}>Server Time: UTC</span>
                <span style={{ fontSize: 13, paddingTop: 0 }}>© 2021-{new Date().getFullYear()} <span style={{ color: 'rgba(255,255,255,0.87)' }}>Flex Technologies Limited</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <div style={{ fontSize: 13, paddingTop: 0, marginBottom: 2 }}><img src={flex_tech} style={{ height: 20, paddingTop: 4 }} /></div>
            </div>
        </div>
    );
}