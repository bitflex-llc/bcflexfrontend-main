import { DispacherBaseTypes, ICurrentMarketState } from '.';
/* eslint-disable react-hooks/exhaustive-deps */
import { IOrderBookUpdate, IOrderbookOrder } from '../../store/types';
import { OrderViewModel, TradeType } from '../../api-wrapper/api';
import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BFPortlet } from '../html/BFPortlet';
import Colors from '../../Colors';
import { FaSignal } from 'react-icons/fa';
import { HubConnectionState } from '@microsoft/signalr';
import { Store } from '../../store';
import graph_buy from '../../images/graph_buy.svg'
import graph_buy_sell from '../../images/graph_buy_sell.svg'
import graph_sell from '../../images/graph_sell.svg'
import { makeid } from '../html/BFInput';
import { useCallback } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useSignalR } from '../../hooks/useSignalR';

function countDecimals(value) {
    try {
        if (Math.floor(value) === value) return 0;
        return value.toString().split(".")[1].length || 0;
    }
    catch {
        return 0;
    }
}

function sumQuantities(orders) {
    return orders.reduce((total, order) => total + order.quantity, 0);
}

function getElementByAttribute(attr, value, root) {
    root = root || document.body;
    if (root.hasAttribute(attr) && root.getAttribute(attr) === value) {
        return root;
    }
    var children = root.children,
        element;
    for (var i = children.length; i--;) {
        element = getElementByAttribute(attr, value, children[i]);
        if (element) {
            return element;
        }
    }
    return null;
}

class OrderRenderModel implements OrderViewModel {
    price?: number;
    quantity?: number;
    isNew?: boolean;
}


export function OrderBook({
    bidOrders, //d//ispatch_bidOrdersInside,
    askOrders, //dispatch_askOrdersInside,
    isLoading,
    isError,
    setPriceAmount,
    // baseCurrency,
    // quoteCurrency,
    currentMarket
}: {
    bidOrders: Array<OrderViewModel>, //dispatch_bidOrdersInside: React.Dispatch<{ type: any; value: any }>,
    askOrders: Array<OrderViewModel>, //dispatch_askOrdersInside: React.Dispatch<{ type: any; value: any }>,
    isLoading?: Boolean,
    isError?: Boolean,
    setPriceAmount,
    // baseCurrency: string,
    // quoteCurrency: string,
    currentMarket: ICurrentMarketState,
}): JSX.Element {
    const {
        state: { lastPrice, globalPairName, terminalHubConnection },
        dispatch
    } = React.useContext(Store);

    const [maxCumulative, setMaxCumulative] = React.useState(0);
    const [spread, setSpread] = React.useState<string>();
    const [spreadPercent, setSpreadPercent] = React.useState<string>();

    const [orderbookSigma, setOrderbookSigma] = useLocalStorage('orderbook-sigma', false)



    const [orderBookView, setorderBookView] =  useLocalStorage('orderBookView', 'both')
    


    var setSellRefs = useRef<any>([]);
    var setBuyRefs = useRef<any>([]);
    var sigmaButton = useRef(null);

    const { t } = useTranslation();

    const { OnOrderbook, JoinPair, LeavePair } = useSignalR();

    const [bidOrdersInside, dispatch_bidOrdersInside] = useReducer((orders: Array<OrderRenderModel>, { type, value }): Array<OrderRenderModel> => {
        const index = orders.findIndex((item) => item.price === value.price);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                // setisOrderBookLoading(false)
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

    const [askOrdersInside, dispatch_askOrdersInside] = useReducer((orders: Array<OrderRenderModel>, { type, value }): Array<OrderRenderModel> => {
        const index = orders.findIndex((item) => item.price === value.price);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                // setisOrderBookLoading(false)
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
        bidOrders && dispatch_bidOrdersInside({
            type: DispacherBaseTypes.INIT_LOAD,
            value: bidOrders
        });
    }, [bidOrders])

    useEffect(() => {
        askOrders && dispatch_askOrdersInside({
            type: DispacherBaseTypes.INIT_LOAD,
            value: askOrders
        });
    }, [askOrders])

    const AnimateBuyRowCallback = useCallback((orderIn: IOrderbookOrder) => {
        setTimeout(() => {

            getElementByAttribute("bf-datarow", orderIn.price?.toFixed(8), document.body)?.classList.add("tr-highlight");
            setTimeout(() => {
                getElementByAttribute("bf-datarow", orderIn.price?.toFixed(8), document.body)?.classList.remove("tr-highlight");
            }, 300)
        }, 10)
    }, [])

    const AnimateSellRowCallback = useCallback((orderIn: IOrderbookOrder) => {

        setTimeout(() => {

            getElementByAttribute("bf-datarow", orderIn.price?.toFixed(8), document.body)?.classList.add("tr-highlight");
            setTimeout(() => {
                getElementByAttribute("bf-datarow", orderIn.price?.toFixed(8), document.body)?.classList.remove("tr-highlight");
            }, 300)
        }, 10)


    }, [])

    useEffect(() => {
        setMaxCumulative(Math.max(sumQuantities(askOrdersInside), sumQuantities(bidOrdersInside)))
        var buyOrder = Array.from(bidOrdersInside)[0] as IOrderbookOrder;
        var sellOrder = Array.from(askOrdersInside)[0] as IOrderbookOrder;
        setSpread(({ ...sellOrder }.price - { ...buyOrder }.price).toFixed(8))
        setSpreadPercent((100 - { ...buyOrder }.price / { ...sellOrder }.price * 100).toFixed(2));
    }, [bidOrdersInside, askOrdersInside]);


    useEffect(() => {
        if (terminalHubConnection && terminalHubConnection.state === HubConnectionState.Connected) {
            OnOrderbook((orderBook: any, nonce: string) => {
                const comparer = JSON.parse(orderBook) as IOrderBookUpdate;
                // console.log(comparer)
                try {
                    comparer.buy?.added?.forEach(async (value) => {
                        console.log("comparer.buy?.added?", value)
                        value.isNew = true;
                        dispatch_bidOrdersInside({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: value, });
                        // dispatch_bidOrdersInside({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: value, });
                        setTimeout(() => {
                            console.log(getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body))
                            getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body)?.classList.remove("removingOrder");
                        }, 250)
                    });
                    comparer.sell?.added?.forEach(async (value) => {
                        console.log("comparer.sell?.added?", value)
                        value.isNew = true;
                        dispatch_askOrdersInside({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: value, });
                        setTimeout(() => {
                            console.log(getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body))
                            getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body)?.classList.remove("removingOrder");
                        }, 250)
                    });

                    comparer.buy?.updated?.forEach(async (value) => {
                        dispatch_bidOrdersInside({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: value, });
                        AnimateBuyRowCallback(value)
                    });
                    comparer.sell?.updated?.forEach(async (value) => {
                        dispatch_askOrdersInside({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: value, });
                        AnimateSellRowCallback(value)
                    });

                    comparer.buy?.removed?.forEach(async (value) => {
                        // setTimeout(() => {
                        //     console.log(getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body))
                        //     getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body)?.classList.add("removingOrder");
                        // }, 20)
                        // setTimeout(() => { 
                        dispatch_bidOrdersInside({ type: DispacherBaseTypes.DELETE, value: value, });
                        // }, 320)
                    });
                    comparer.sell?.removed?.forEach(async (value) => {
                        // setTimeout(() => {
                        //     console.log(getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body))
                        //     getElementByAttribute("bf-datarow", value.price?.toFixed(8), document.body)?.classList.add("removingOrder");
                        // }, 20)
                        // setTimeout(() => { 
                        dispatch_askOrdersInside({ type: DispacherBaseTypes.DELETE, value: value, });
                        // }, 320)
                    });

                    // forceUpdate();

                    // SetNonce(nonceSignal, dispatch);
                } catch (ex) {
                    console.warn(ex);
                }
            });
        }
    }, [terminalHubConnection]);

    useEffect(() => {
        setMaxCumulative(Math.max(sumQuantities(askOrders), sumQuantities(bidOrders)))
        // setSpread(({ ...sellOrder }.price - { ...buyOrder }.price).toFixed(8))
        // setSpreadPercent((100 - { ...buyOrder }.price / { ...sellOrder }.price * 100).toFixed(2));
    }, [globalPairName, dispatch]);

    function getPercentage(cumulative) {
        let fillPercentage = (maxCumulative ? cumulative / maxCumulative : 0) * 100;
        fillPercentage = Math.min(fillPercentage, 100); // Percentage can't be greater than 100%
        fillPercentage = Math.max(fillPercentage, 0); // Percentage can't be smaller than 0%
        return fillPercentage;
    }

    function getPercentageE(value) {
        let fillPercentage = value / maxCumulative * 100;// (maxCumulative ? cumulative / maxCumulative : 0) * 100;
        fillPercentage = Math.min(fillPercentage, 100); // Percentage can't be greater than 100%
        fillPercentage = Math.max(fillPercentage, 0); // Percentage can't be smaller than 0%
        return fillPercentage;
    }



    const RenderBuyOrSellTable = (type: TradeType, orders: OrderRenderModel[]) => {

        if (!orders) return;

        let cumulativeBid = 0;

        var maxDecimalsPrice = 1;
        var maxDecimalsQuantity = 1;

        var cumulativeAveragePrice = 0;
        var cumulativeTotal = 0;

        orders.forEach(element => {
            var countDecPrice = countDecimals(element.price);
            if (countDecPrice > maxDecimalsPrice)
                maxDecimalsPrice = countDecPrice;

            var countDecQuantity = countDecimals(element.quantity);
            if (countDecQuantity > maxDecimalsQuantity)
                maxDecimalsQuantity = countDecQuantity;
        });

        var preReadyOrderList: OrderRenderModel[]
        if (type === TradeType.Sell)
            preReadyOrderList = orders.sort((a, b) => (a.price! < b.price! ? -1 : 1))
        else
            preReadyOrderList = orders.sort((a, b) => (b.price! > a.price! ? -1 : 1)).reverse();



        return preReadyOrderList.map((bidOrder, index) => {

            cumulativeBid += bidOrder.quantity!;
            var backgroundSizeValue = 0.00;

            cumulativeAveragePrice += bidOrder.price!;

            var decimalsofPrice = ''
            var coundDecimalsPrice = countDecimals(bidOrder.price);
            var needToAdd = maxDecimalsPrice - coundDecimalsPrice;
            for (var step = needToAdd; step > 0; step--) decimalsofPrice += '0'
            if (needToAdd === maxDecimalsPrice) decimalsofPrice = '.' + decimalsofPrice;

            var decimalsofQuantity = '';
            var needToAddq = maxDecimalsQuantity - countDecimals(bidOrder.quantity);
            for (var step2 = needToAddq; step2 > 0; step2--) decimalsofQuantity += '0'
            if (needToAddq === maxDecimalsQuantity) decimalsofQuantity = '.' + decimalsofQuantity;

            var decimalsofTotal = '';
            var total = parseFloat((bidOrder.price! * bidOrder.quantity!).toFixed(maxDecimalsPrice));

            var needToAddqq = maxDecimalsPrice - countDecimals(total);
            for (var step22 = needToAddqq; step22 > 0; step22--) decimalsofTotal += '0'
            if (needToAddqq === maxDecimalsPrice) decimalsofTotal = '.' + decimalsofTotal;

            if (orderbookSigma)
                backgroundSizeValue = getPercentage(cumulativeBid);
            else
                backgroundSizeValue = getPercentageE(bidOrder.quantity);

            const idelem = makeid(16)
            cumulativeTotal += total;

            return (
                <div
                    id={idelem + "mainrow"}
                    bf-datarow={bidOrder.price?.toFixed(8)}
                    bf-isnew={bidOrder.isNew?.valueOf()}

                    onClick={() => {

                    }}
                    className={(bidOrder.isNew?.valueOf() ? "removingOrder buy" : "")}

                    onMouseLeave={() => {
                        if (document.getElementById(idelem)) {
                            document.getElementById(idelem)!.style.display = "none";
                        }

                        if (document.getElementById(idelem + "mainrow")) {
                            document.getElementById(idelem + "mainrow")!.classList.remove("row-selected-bg-sell")
                        }

                        if (document.getElementById(idelem + "row"))
                            document.getElementById(idelem + "row")!.classList.remove("onmouseover");

                    }} style={{ position: 'relative', marginTop: -1, transition: 'all 0.5s ease' }}>

                    {/* <div id={idelem} className={'orderbook-table-noti'} style={{
                        position: 'absolute', background: 'rgba(67, 60, 60, 0.95)', borderRadius: 3,
                        borderColor: Colors.BITFLEXBorder, borderWidth: 1, top: 5,
                        padding: 17, paddingRight: 0, left: 90, zIndex: 10, width: 190, display: 'none',
                        flexDirection: 'column'
                    }}>
                        <div className={'font-roboto-condensed'} style={{ fontSize: 18, marginBottom: 20 }}>Below {bidOrder.price?.toFixed(coundDecimalsPrice + needToAdd)}:</div>

                        <div style={{ fontSize: 17 }}>Average</div>
                        <div className={'font-roboto-condensed'} style={{ marginBottom: 10, fontSize: 16 }}> {(cumulativeAveragePrice / (index + 1)).toFixed(coundDecimalsPrice + needToAdd)}

                        </div>

                        <div style={{ fontSize: 17 }}>Amount</div>
                        <div className={'font-roboto-condensed'} style={{ marginBottom: 10, fontSize: 16 }}>{cumulativeBid} {baseCurrency}</div>

                        <div style={{ fontSize: 17 }}>Total</div>
                        <div className={'font-roboto-condensed'} style={{ fontSize: 16 }}>{cumulativeTotal.toFixed(coundDecimalsPrice + needToAdd)}</div>

                    </div> */}

                    <div
                        id={idelem + "row"}
                        key={idelem}
                        ref={el => setSellRefs.current[index] = el}
                        // className={bidOrder.isNew! ? "fill-ask font-roboto-condensed removingOrder" : "fill-ask font-roboto-condensed"}
                        className={(type === TradeType.Sell ? "fill-ask" : "fill-bid") + " font-roboto-condensed row-selected-sell "}
                        style={{ backgroundSize: backgroundSizeValue.toFixed(2) + "% 100%" }}

                        onMouseOver={() => {
                            if (document.getElementById(idelem)) {
                                document.getElementById(idelem)!.style.display = "flex";
                            }

                            if (document.getElementById(idelem + "mainrow")) {
                                document.getElementById(idelem + "mainrow")!.classList.add("row-selected-bg-sell")
                            }


                            if (document.getElementById(idelem + "row"))
                                document.getElementById(idelem + "row")!.classList.add("onmouseover");
                        }}>

                        <div style={{ width: '33.33%', color: type === TradeType.Sell ? '#E03C2D' : '#35CB3Baa', cursor: 'pointer' }} onClick={() => setPriceAmount(bidOrder.price, undefined, type)}>
                            {/* {bidOrder.price!.toFixed(8 - needToAdd).toString()} */}
                            {bidOrder.price}
                            <span style={{ color: 'rgba(200, 203, 208, 0.25)' }}>{decimalsofPrice}</span>
                        </div>

                        <div style={{ width: '33.33%', color: '#FFFFFF', textAlign: 'center', cursor: 'pointer' }} onClick={() => setPriceAmount(bidOrder.price, bidOrder.quantity, type)}>
                            {bidOrder.quantity!.toString()}
                            <span style={{ color: 'rgba(200, 203, 208, 0.25)' }}>{decimalsofQuantity}</span>
                        </div>

                        <div style={{ width: '30%', color: '#FFFFFF', textAlign: 'right' }}>
                            {total.toString()}
                            <span style={{ color: 'rgba(200, 203, 208, 0.25)' }}>{decimalsofTotal}</span>
                        </div>
                    </div>
                </div>
            );
        })
    }


    return (
        <BFPortlet title={t('Orderbook')}
            isLoading={isLoading}
            isError={isError}
            noHeader={false}
            isScrollable={false}
            rightActionComponent={

                <div className="ob-status">


                    <div style={{ background: 'transparent', borderRadius: 3, padding: 4, paddingTop: 5, width: 22, paddingBottom: 3, textAlign: 'center', marginRight: 0, cursor: 'pointer' }}>
                        <FaSignal color={Colors.bitFlexGreenColor} size={16} />
                    </div>

                    <div style={{ borderRight: '1px solid #433c3c', marginRight: 0, marginLeft: 0 }}>&nbsp;</div>

                    <div style={{ background: orderbookSigma ? 'rgba(74, 89, 105, 0.75)' : 'transparent', borderRadius: 3, padding: 4, paddingTop: 5, width: 22, paddingBottom: 3, textAlign: 'center', marginRight: 0, cursor: 'pointer', transition: 'all 0.5s ease' }}>
                        <button ref={sigmaButton} onClick={(e) => {
                            setOrderbookSigma(!orderbookSigma);
                            orderbookSigma ? e.currentTarget.classList.remove('active') : e.currentTarget.classList.add('active')
                        }} className={orderbookSigma ? 'sigma-button active-sigma' : 'sigma-button'} style={{ fontSize: 16, cursor: 'pointer' }}>Σ</button>
                    </div>

                    <div style={{ borderRight: '1px solid #433c3c' }}>&nbsp;</div>



                    <div style={{ background: orderBookView === 'sell' ? 'rgba(74, 89, 105, 0.75)' : 'transparent', borderRadius: 3, padding: 4, paddingTop: 7, width: 22, textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => {
                            setorderBookView('sell')
                        }}
                    >
                        <img src={graph_sell} width={14} alt={'graph sell only'} />
                    </div>

                    <div style={{ background: orderBookView === 'buy' ? 'rgba(74, 89, 105, 0.75)' : 'transparent', borderRadius: 4, padding: 4, paddingTop: 7, width: 22, textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => {
                            setorderBookView('buy')
                        }}
                    >
                        <img src={graph_buy} width={14} alt={'graph buy only'} />
                    </div>

                    <div style={{ background: orderBookView === 'both' ? 'rgba(74, 89, 105, 0.75)' : 'transparent', borderRadius: 3, padding: 4, paddingTop: 7, width: 22, textAlign: 'center', cursor: 'pointer' }}
                        onClick={() => {
                            setorderBookView('both')
                        }}
                    >
                        <img src={graph_buy_sell} width={14} alt={'graph buy and sell'} />
                    </div>
                </div>

            }

        >

            <div className={'orderbook-container'} id='orderbook-container' style={{ position: 'relative' }}>
                <div className={'orderbook-container-header'}>
                    <table className="table" style={{ marginBottom: 0 }} >
                        <thead>
                            <tr>
                                <th style={{ float: 'left', textAlign: 'center', fontWeight: 400, borderBottom: 0 }}><Trans>Price</Trans>, {currentMarket?.quoteCurrencySymbol}</th>
                                <th style={{ textAlign: 'center', fontWeight: 400, borderBottom: 0, }}><Trans>Quantity</Trans></th>
                                <th style={{
                                    float: 'right', textAlign: 'center', fontWeight: 400, borderBottom: 0,
                                    // borderTop: '1px solid #101318'
                                }}><Trans>Total</Trans></th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <div className={'orderbook-container sell'} style={{ flex: orderBookView === 'sell' || orderBookView === 'both' ? 1 : 0 }}>
                    {RenderBuyOrSellTable(TradeType.Sell, askOrdersInside)}
                </div>

                <div className={'orderbook-container-spread'} id='orderbook-spread'>
                    <div style={{ fontSize: 20 }} className={'font-roboto-condensed'}>
                        {lastPrice?.toFixed(8)}
                    </div>
                    <div>
                        <span className={'font-roboto-condensed'} style={{ fontSize: 16, fontWeight: 500 }}>({isNaN(parseFloat(spread!)) ? 0 : spreadPercent}%)</span>
                    </div>
                </div>

                <div className={'orderbook-container buy'} style={{ flex: orderBookView === 'buy' || orderBookView === 'both' ? 1 : 0 }}>
                    {RenderBuyOrSellTable(TradeType.Buy, bidOrdersInside)}
                </div>

            </div>
        </BFPortlet >
    );
}