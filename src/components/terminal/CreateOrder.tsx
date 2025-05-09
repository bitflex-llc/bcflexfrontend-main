/* eslint-disable react-hooks/exhaustive-deps */
import 'react-tabs/style/react-tabs.css';
import 'react-dropdown/style.css';

import { ApiTickers, GetBalanceRequestModel, OrderTypes, OrderViewModel, PostOrdersRequest, TradeType, Type } from '../../api-wrapper/api';
import { BFInput, BFInputType } from '../html/BFInput';
import { DispacherBaseTypes, ICurrentMarketState } from './index';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight, FaArrowCircleLeft, FaArrowLeft, FaCheck, FaQuestionCircle } from 'react-icons/fa';
/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react';
import { Tab, TabList, Tabs } from 'react-tabs';
import { Trans, useTranslation } from 'react-i18next';
import { toastError, toastSuccess } from '../toastwrapper'

import { ActionType } from '../../store/actionTypes';
import { BFPortlet } from '../html/BFPortlet';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import Colors from '../../Colors';
import Dropdown from 'react-dropdown';
import { FastAverageColor } from 'fast-average-color';
import { HubConnectionState } from '@microsoft/signalr';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { SetMarketType, } from '../../store/actions';
import { Store } from '../../store';
import loading_png from '../../images/loading.svg';
import { useCallback } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useSignalR } from '../../hooks/useSignalR';

export function CreateOrder({
    balances, dispatch_balances,
    dispatch_myOrders,
    isLoading,
    isBalancesLoading = false,
    bidOrders,
    askOrders,
    currentMarket,
    price,
    amount,
    orderSide,
    tickers
}: {
    balances: Array<GetBalanceRequestModel>, dispatch_balances: React.Dispatch<{ type: any; value: any }>,
    dispatch_myOrders: React.Dispatch<{ type: any; value: any }>,
    isLoading: Boolean,
    isBalancesLoading?: Boolean,
    bidOrders: Array<OrderViewModel>,
    askOrders: Array<OrderViewModel>,
    currentMarket: ICurrentMarketState,
    price?: number,
    amount?: number,
    orderSide?: TradeType,

    tickers?: Array<ApiTickers>,
}) {

    const { t } = useTranslation();
    const {
        state: { takerFee, tvChart, marketType, privateHubConnection, globalPairName },
        dispatch
    } = React.useContext(Store);

    const [orderAmount, setOrderAmount] = React.useState(0);
    const [orderPrice, setOrderPrice] = React.useState(0);
    const [orderTotal, setOrderTotal] = React.useState(0);
    const [orderFee, setOrderFee] = React.useState(0);
    const [orderIsLimit, setOrderIsLimit] = React.useState(true);

    const [baseCurrencyBalance, setbaseCurrencyBalance] = React.useState(0);
    const [quoteCurrencyBalance, setquoteCurrencyBalance] = React.useState(0);

    useEffect(() => {
        if (price)
            setOrderPrice(price)

        if (amount)
            setOrderAmount(amount)

    }, [price, amount]);

    useEffect(() => {
        if (orderSide) {
            document.getElementById(orderSide === TradeType.Sell ? "buydiv" : "selldiv")?.classList.add("signal")
            setTimeout(() => {
                document.getElementById(orderSide === TradeType.Sell ? "buydiv" : "selldiv")?.classList.remove("signal")
                setTimeout(() => {
                    document.getElementById(orderSide === TradeType.Sell ? "buydiv" : "selldiv")?.classList.add("signal")
                    setTimeout(() => {
                        document.getElementById(orderSide === TradeType.Sell ? "buydiv" : "selldiv")?.classList.remove("signal")
                    }, 300);
                }, 300);
            }, 300);
        }
    }, [orderSide, price, amount])

    const words = {
        Price: t('Price'),
        MarketPrice: t('Market Price'),
        LimitOrder: t('Limit Order'),
        MarketOrder: t('Market Order'),
        Amount: t('Amount'),
        Quantity: t('Quantity')
    };

    const options = [
        'Spot', 'Margin'
    ];

    const optionsLeverage = [
        'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9', 'x10'
    ];

    // const [marketType, setMarketType] = useLocalStorage('marketType', 'Spot')
    const [leverage, setleverage] = useState('x2');

    const [liqBuy, setliqBuy] = useState(0);
    const [liqSel, setliqSell] = useState(0);

    const [selectedMargin, setselectedMargin] = useState('0');

    const [marginOrderCost, setmarginOrderCost] = useState(0);
    const [marginOrderPrice, setmarginOrderPrice] = useState(0);

    const [isStopLoss, setisStopLoss] = useState(false);
    const [stopLossPrice, setstopLossPrice] = useState<number>(0);

    const [isTakeProfit, setisTakeProfit] = useState(false);
    const [takeProfitPrice, settakeProfitPrice] = useState<number>(0);

    const [hideMyValues, sethideMyValues] = useLocalStorage('hideMyValues', 'false');

    const [currentTicker, setcurrentTicker] = useState<ApiTickers>();

    const { OnBalanceUpdate } = useSignalR();

    const [isEnterPressed, setisEnterPressed] = useState(false);

    const GetCurrencyDescription = useCallback((currencyType: Type): string | undefined => {
        switch (currencyType) {
            case Type.BtcBased: return undefined;
            case Type.Eos: return undefined;
            case Type.Erc20: return "ERC20 Token";
            case Type.Fiat: return 'FIAT';
            case Type.Ripple: return undefined;
            default: return undefined;
        }
    }, [])

    const CalculateLiquidations = useCallback(() => {
        var orderBuyCount = 0, orderSellCount = 0, orderBuySumm = 0, orderSellSumm = 0;

        bidOrders.forEach(buyOrder => {
            orderBuyCount += buyOrder.quantity!;
            orderBuySumm += buyOrder.price! * buyOrder.quantity!;
        });

        askOrders.forEach(sellOrder => {
            orderSellCount += sellOrder.quantity!;
            orderSellSumm += sellOrder.price! * sellOrder.quantity!;
        });

        var buyAverage = Number((orderBuySumm / orderBuyCount).toFixed(2))
        var sellAverage = Number((orderSellSumm / orderSellCount).toFixed(2))

        var leverageNumber = Number(leverage.substr(1));

        var liquidationPriceBuy = Number(((buyAverage * leverageNumber) / (leverageNumber - 1 + ((1 / 100 * leverageNumber)))).toFixed(2))
        var liquidationPriceSell = Number(((sellAverage * leverageNumber) / (leverageNumber + 1 - ((1 / 100 * leverageNumber)))).toFixed(2))

        setliqBuy(isNaN(liquidationPriceBuy) ? 0 : liquidationPriceBuy)
        setliqSell(isNaN(liquidationPriceSell) ? 0 : liquidationPriceSell)
    }, [bidOrders, askOrders, leverage]);

    useEffect(() => {
        CalculateLiquidations();
    }, [currentMarket, leverage]);

    useEffect(() => {
        if (marketType === "Margin") CalculateLiquidations();
    }, [marketType]);

    React.useEffect(() => {
        if (marketType === "Spot") {

            console.log("AMOUNT takerFee", orderAmount, orderPrice, takerFee)
            var total = orderAmount * orderPrice;
            var fee = total * takerFee / 100;
            setOrderTotal(isNaN(total) ? 0 : total);
            setOrderFee(isNaN(fee) ? 0 : fee);
        } else {
            var leverageNumber = Number(leverage.substr(1));

            var orderPriceMargin = Number((orderAmount / orderPrice).toFixed(8));
            var orderCostMargin = Number((orderPriceMargin / leverageNumber).toFixed(8));

            setmarginOrderPrice(isNaN(orderPriceMargin) ? 0 : orderPriceMargin);
            setmarginOrderCost(isNaN(orderCostMargin) ? 0 : orderCostMargin);
        }
    }, [orderAmount, orderPrice, takerFee, leverage]);

    useEffect(() => {

        if (marketType === "Spot") return;

        var marginClickAmount = baseCurrencyBalance * Number(selectedMargin) / 100;
        var leverageNumber = Number(leverage.substr(1));

        var quantity = Number((marginClickAmount * leverageNumber * orderPrice).toFixed(8));
        setOrderAmount(isNaN(quantity) ? 0 : quantity);

        // setmarginOrderPrice(isNaN(orderPriceMargin) ? 0 : orderPriceMargin);

        // setmarginOrderCost(isNaN(orderCostMargin) ? 0 : orderCostMargin);

        // setorderAmountManual(isNaN(quantity) ? 0 : quantity)
    }, [selectedMargin, leverage, orderPrice]);

    useEffect(() => {
        if (!OnBalanceUpdate) return;
        if (privateHubConnection && privateHubConnection.state === HubConnectionState.Connected)
            OnBalanceUpdate(console.log)
    }, [OnBalanceUpdate, privateHubConnection]);

    useEffect(() => {
        if (!OnBalanceUpdate) return;

        OnBalanceUpdate((balance: GetBalanceRequestModel) => {
            dispatch_balances({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: balance });
        })
    }, [OnBalanceUpdate])




    useEffect(() => {
        setcurrentTicker(tickers?.find((x => x.pair === globalPairName)))
    }, [globalPairName, tickers]);


    const submitOrderCreation = (e, type) => {

        e.preventDefault();

        var requestData: PostOrdersRequest = {
            amount: orderAmount,
            price: orderPrice,
            tradeType: type,
            pairId: currentMarket?.pairId,
            orderType: orderIsLimit ? OrderTypes.Limit : OrderTypes.Market,
            isMargin: marketType === "Margin",
            leverage: parseInt(Number(leverage.substr(1)).toString()),
            stopLossPrice: stopLossPrice,
            takeProfitPrice: takeProfitPrice
        }

        BitflexOpenApi.OrdersApi.apiVversionOrdersPost("1.0", requestData).then(result => {
            if (!result.data.success) {
                toastError(result.data.errorMessage);

            } else {
                let orderTyped = result.data.order!;

                if (result.data.order?.closed)
                    toastSuccess(orderTyped.tradeType! + ' Order successfully executed with Reason: ' + result.data.order.orderState + ' at ' + result.data.order.price?.toFixed(8))
                else if (result.data.order?.amount !== result.data.order?.amountLeft) {
                    toastSuccess(orderTyped.tradeType! + ' Order updated with Reason: ' + result.data.order?.orderState + ' at ' + result.data.order?.price?.toFixed(8))
                }
                else {
                    dispatch_myOrders({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: result.data.order })
                    toastSuccess(orderTyped.tradeType! + ' Order successfully created!')
                }


                if (!tvChart || tvChart.chart() === null) return;
                if (!result.data.order?.isMargin) {
                    var order = tvChart.chart().createOrderLine({})
                        .onCancel(() => {
                            order.remove();
                            BitflexOpenApi.OrdersApi.apiVversionOrdersCancelPost("1.0", orderTyped!.id!);
                        })
                        .setPrice(orderTyped.price)
                        .setText(orderTyped?.tradeType + ' ' + orderTyped!.price!.toFixed(8))
                        .setLineLength(2)
                        .setBodyBackgroundColor(orderTyped.tradeType! === TradeType.Buy ? '#35CB3Baa' : '#E03C2D')
                        .setBodyBorderColor(orderTyped.tradeType! === TradeType.Buy ? '#28805c' : '#bc5450')
                        .setBodyTextColor("#FFF")
                        .setQuantity(orderTyped.amountLeft!.toFixed(8));
                } else {
                    var position = tvChart.chart().createPositionLine({})
                        // .onModify(function () {
                        //     alert("modify")
                        // })
                        // .onReverse("onReverse called", function (text) {
                        //     alert("onReverse")
                        // })
                        .onClose("onClose called", function (text) {
                            position.remove();
                            BitflexOpenApi.OrdersApi.apiVversionOrdersCancelPost("1.0", orderTyped!.id!);
                        })
                        .setText("PROFIT: 71.1 (3.31%)")
                        .setQuantity(orderTyped.amountLeft!.toFixed(8))
                        .setPrice(orderTyped.price)
                        .setExtendLeft(false)
                        .setLineStyle(0)
                        .setLineLength(25);
                }
            }
        }).catch(error => {
            console.log(error)
        })
    }

    React.useEffect(() => {

        if (!currentMarket?.quoteCurrency) return;

        var img = document.createElement('img');
        img.src = currentMarket?.quoteCurrency.imageBase64!

        dispatch({
            type: ActionType.SET_AVERAGE_COLOR,
            payload: new FastAverageColor().getColor(img).hex
        });

        var baseCurrencyBalance = balances.find(x => x.currency === currentMarket?.baseCurrency?.symbol);
        var quoteCurrencyBalance = balances.find(x => x.currency === currentMarket?.quoteCurrency?.symbol);

        if (!baseCurrencyBalance || !quoteCurrencyBalance) return;

        setbaseCurrencyBalance(baseCurrencyBalance.available!);
        setquoteCurrencyBalance(quoteCurrencyBalance.available!);

    }, [balances, currentMarket, dispatch]);


    const handleEnter = (e) => {
        switch (e.key) {
            case 'Enter':
                setisEnterPressed(true)
                break;
            case 'ArrowLeft':
                if (isEnterPressed) {
                    submitOrderCreation(e, 'buy')
                    setisEnterPressed(false)
                }
                break;
            case 'ArrowRight':
                if (isEnterPressed) {
                    submitOrderCreation(e, 'sell')
                    setisEnterPressed(false)
                }
                break;
            case 'Escape': setisEnterPressed(false); break;
        }
    }


    return (
        <BFPortlet title={t('Order')}
            isBlockUnauthorized={true}
            isLoading={isLoading}
            isScrollable={false}
            isWelcomeOverlay={true}
        // rightActionComponent={
        //     <div className='dontDragMe' style={{ float: 'right' }}>
        //         <Dropdown options={options} menuClassName='order-market-dropdown-menu' arrowClassName='order-market-dropdown-arrow' placeholderClassName='order-market-dropdown-placeholder' controlClassName='order-market-dropdown' onChange={(e) => { SetMarketType(e.value.toString(), dispatch) }} value={marketType} placeholder="Select an option" />
        //     </div>
        // }
        >
            <Tabs
                className='tabbable-custom dontDragMe'
                onSelect={(index) => {
                    switch (index) {
                        case 0: setOrderIsLimit(true); break;
                        case 1: setOrderIsLimit(false); break;
                    }
                }}>
                <TabList>
                    {/* <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab'>Limit</Tab> */}
                    {/* <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab'>Market</Tab> */}
                </TabList>
                <div className="portlet-body">
                    <div className='coininformation-div' style={{ height: marketType === "Spot" ? 50 : 0, marginTop: '2%' }}>
                        <div className='coininformation-image'>
                            <img id='baseCurrency-image' src={currentMarket?.baseCurrency ? currentMarket?.baseCurrency.imageBase64! : loading_png} className='image-createorder-form' />
                        </div>
                        <div className='coininformation-name'>
                            <div className='coininformation-title'>
                                {currentMarket?.baseCurrency ? currentMarket?.baseCurrency.name : "Loading..."} {(currentMarket?.baseCurrency && GetCurrencyDescription(currentMarket?.baseCurrency.type!)) && <span className="tab-margin-box" style={{ height: 18, lineHeight: '18px' }}>{GetCurrencyDescription(currentMarket?.baseCurrency.type!)}</span>}
                            </div>
                            <div className='coininformation-value'>
                                <Trans>Price</Trans> <span className={'font-roboto-condensed'}>{currentTicker?.price!.toFixed(8)}</span> {currentMarket?.quoteCurrencySymbol}
                            </div>
                        </div>
                    </div>

                    <div className={'transition'} style={{ padding: 10, paddingBottom: 0, paddingTop: 3, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: marketType === "Spot" ? '2%' : 0 }}>
                        <div style={{ width: '46%', textAlign: 'center', position: 'relative' }}>
                            <BFInput
                                type={BFInputType.Decimal}
                                width={"100%"}
                                placeholder={orderIsLimit ? words.Price : words.MarketPrice}
                                isDisabled={!orderIsLimit}
                                setValue={orderPrice}
                                onValue={setOrderPrice}
                                leftsideSymbol={currentMarket?.quoteCurrencySymbol}
                                onKeyDown={handleEnter}
                            />
                        </div>
                        <div style={{ width: '8%' }}>&nbsp;</div>
                        <div style={{ width: '46%', textAlign: 'center', position: 'relative' }}>
                            <BFInput
                                type={BFInputType.Decimal}
                                width={"100%"}
                                placeholder={words.Quantity}
                                onValue={setOrderAmount}
                                setValue={orderAmount}
                                leftsideSymbol={marketType === "Margin" ? currentMarket?.quoteCurrencySymbol : currentMarket?.baseCurrencySymbol}
                                onKeyDown={handleEnter}
                            />
                        </div>
                    </div>

                    <div className={'transition'} style={{ padding: marketType !== "Spot" ? 10 : 0, paddingBottom: marketType !== "Spot" ? 3 : 0, paddingTop: marketType !== "Spot" ? 3 : 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', height: marketType !== "Spot" ? 40 : 0, overflow: marketType !== "Spot" ? '' : 'hidden', marginTop: '2%' }}>
                        <div style={{ width: '46%', textAlign: 'center', position: 'relative', display: 'flex', flexDirection: 'row-reverse' }}>
                            <label className={'leverage-label'}>Leverage</label>
                        </div>
                        <div style={{ width: '8%' }}>&nbsp;</div>
                        <div style={{ width: '46%', textAlign: 'center', position: 'relative' }}>
                            <Dropdown options={optionsLeverage}
                                menuClassName='order-market-dropdown-menu'
                                arrowClassName='order-market-dropdown-arrow-2'
                                placeholderClassName='order-market-dropdown-placeholder-2'
                                controlClassName='order-market-dropdown-2'
                                onChange={(e) => { setleverage(e.value) }}
                                value={leverage} placeholder="Select an option"
                                className="dropdown-fix"
                            />
                        </div>
                    </div>

                    {marketType === "Margin" &&
                        <ReactTooltip id='global' aria-haspopup='true'>
                            <div>
                                <p>The estimate liquidation price is the estimated market price <br /> when the margin ratio is equal to or less than 1% (Maintenance Margin)</p>
                                <p>BUY | SELL</p>
                            </div>
                        </ReactTooltip>
                    }

                    <div className={'margin-percent-selector-container transition'} style={{ height: marketType !== "Spot" ? 35 : 0, overflow: marketType !== "Spot" ? '' : 'hidden', marginTop: '2%' }}>
                        <div className={'margin-percent-selector-box'}>
                            <div className={selectedMargin === '20' ? 'margin-div-selector first selected' : 'margin-div-selector first'} onClick={() => setselectedMargin('20')}>20%</div>
                            <div className={selectedMargin === '40' ? 'margin-div-selector selected' : 'margin-div-selector'} onClick={() => setselectedMargin('40')}>40%</div>
                            <div className={selectedMargin === '60' ? 'margin-div-selector selected' : 'margin-div-selector'} onClick={() => setselectedMargin('60')}>60%</div>
                            <div className={selectedMargin === '80' ? 'margin-div-selector selected' : 'margin-div-selector'} onClick={() => setselectedMargin('80')}>80%</div>
                            <div className={selectedMargin === '100' ? 'margin-div-selector last selected' : 'margin-div-selector last'} onClick={() => setselectedMargin('100')}>100%</div>
                        </div>
                    </div>

                    <div className={'transition'} style={{ padding: 10, paddingBottom: 5, paddingTop: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', }}>
                        <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }}>
                            <div style={{
                                margin: -4,
                                borderRadius: 5,
                                padding: 4, justifyContent: 'space-between', display: 'flex',
                                flexDirection: 'row', width: '100%', alignItems: 'center',
                                opacity: isStopLoss ? 1 : 0.25
                            }}>
                                <div style={{ width: '46%', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', alignItems: 'center', }} onClick={() => setisStopLoss(!isStopLoss)}>
                                    <div style={{ fontSize: 16, color: 'white', marginLeft: 15 }}>Set Stop-Loss</div>
                                    <div>
                                        <FaCheck style={{ fontSize: 18, color: Colors.bitFlexGoldenColor, marginLeft: 25 }} />
                                    </div>
                                </div>
                                <div style={{ width: '8%' }}>&nbsp;</div>
                                <div style={{ width: '46%', textAlign: 'center', position: 'relative' }}>
                                    <BFInput type={BFInputType.Decimal} width={"100%"} isDisabled={!isStopLoss} placeholder={'Price'} leftsideSymbol={currentMarket?.quoteCurrencySymbol} onValue={setstopLossPrice} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={'transition'} style={{ padding: 10, paddingBottom: 0, paddingTop: 0, display: 'flex', flexDirection: 'row', justifyContent: 'space-around', }}>
                        <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }}>
                            <div style={{
                                margin: -4,
                                borderRadius: 5,
                                padding: 4, justifyContent: 'space-between', display: 'flex',
                                flexDirection: 'row', width: '100%', alignItems: 'center',
                                opacity: isTakeProfit ? 1 : 0.25
                            }}>
                                <div style={{ width: '46%', textAlign: 'left', position: 'relative', display: 'flex', flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', alignItems: 'center', }} onClick={() => setisTakeProfit(!isTakeProfit)}>
                                    <div style={{ fontSize: 16, color: 'white', marginLeft: 15 }}>Set Take-Profit</div>
                                    <div>
                                        <FaCheck style={{ fontSize: 18, color: Colors.bitFlexGoldenColor, marginLeft: 25 }} />
                                    </div>
                                </div>
                                <div style={{ width: '8%' }}>&nbsp;</div>
                                <div style={{ width: '46%', textAlign: 'center', position: 'relative' }}>
                                    <BFInput type={BFInputType.Decimal} width={"100%"} isDisabled={!isTakeProfit} placeholder={'Price'} leftsideSymbol={currentMarket?.quoteCurrencySymbol} onValue={settakeProfitPrice} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={'info-well'} style={{ opacity: marketType === "Margin" ? 1 : 0, minHeight: 21, lineHeight: 0 }}>
                        <label data-tip data-for='global'><FaQuestionCircle style={{ paddingTop: 3 }} /> Est. Liquidation Price: <span style={{ color: '#FDA92A' }}>{liqBuy + " " + currentMarket?.quoteCurrencySymbol + " | " + liqSel + " " + currentMarket?.quoteCurrencySymbol}</span></label>
                    </div>

                    <div className="info-well" >
                        {marketType === "Spot" ? orderIsLimit ?
                            <>
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', whiteSpace: 'nowrap', alignItems: 'center', height: 38 }}>

                                    <div style={{fontSize: 18 }}>
                                        <span style={{ color: Colors.Graytext}}><Trans>Total</Trans>: </span>
                                        <span className='font-roboto-condensed'>{orderTotal.toFixed(4)}</span>&nbsp;{currentMarket?.quoteCurrencySymbol}
                                    </div>

                                    <div style={{fontSize: 12 }}>
                                        <span style={{ color: Colors.Graytext, fontSize: 14 }}><Trans>Fee</Trans>: </span>
                                        <span className='total-css-fee-span'><span className='font-roboto-condensed'>{orderFee.toFixed(4)}</span> {currentMarket?.quoteCurrencySymbol}</span>
                                    </div>
                                </div>
                            </>
                            :
                            <>
                                <div className="total-css-fee" style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 3, height: 35 }}>
                                    <Trans>Quantity and Fee will be calculated upon order execution</Trans>
                                </div>
                            </>
                            :
                            <div>
                                <div className="total-css-fee">
                                    Order Value: <span className='font-roboto-condensed'>{marginOrderPrice}</span> {currentMarket?.quoteCurrency?.symbol}
                                </div>
                                <div className="total-css-fee font-roboto-condensed">
                                    Cost: <span className='font-roboto-condensed'>{marginOrderCost}</span> {currentMarket?.quoteCurrency?.symbol}
                                </div>
                            </div>
                        }
                    </div>

                    <div className='createorder_container' style={{ position: 'relative', display: isEnterPressed ? 'none' : '' }}>
                        <div className="buydiv" id="buydiv">

                            <div style={{ padding: 4, whiteSpace:'nowrap' }}>
                                {/* <span style={{ color: Colors.Graytext }}>{currentMarket?.quoteCurrencySymbol} <Trans>Avail.</Trans>: </span> */}
                                {hideMyValues === 'false' ?
                                    <span className='font-roboto-condensed' onClick={() => sethideMyValues('true')}>{marketType !== 'Spot' ? baseCurrencyBalance.toFixed(4) : quoteCurrencyBalance.toFixed(4)} {marketType !== 'Spot' ? currentMarket?.quoteCurrency?.symbol : currentMarket?.quoteCurrencySymbol}</span>
                                    :
                                    <span onClick={() => sethideMyValues('false')}>*** {currentMarket?.quoteCurrencySymbol}</span>
                                }
                            </div>
                            <div style={{ paddingLeft: 8, paddingRight: 8 }}>
                                <button className="btn btn-md hoverbutton buybutton" type="button" style={{ height: 40, fontSize: 16 }} onClick={e => submitOrderCreation(e, 'buy')}>
                                    <Trans>BUY</Trans> {marketType === "Margin" && <>(Long)</>}
                                </button>
                            </div>

                            <div style={{ padding: 4, whiteSpace:'nowrap'  }}>
                                <span className='font-roboto-condensed'><Trans>Cost</Trans>:&nbsp;</span><span className='font-roboto-condensed'>
                                    {orderIsLimit
                                        ? (orderAmount > 0 && orderPrice > 0)
                                            ? ((orderAmount * orderPrice) + orderFee).toFixed(4) + " " + currentMarket?.quoteCurrencySymbol
                                            : 0.000000 + " " + currentMarket?.quoteCurrencySymbol
                                        : 'Market Price'
                                    }
                                </span>
                            </div>
                        </div>
                        <div className="selldiv" id="selldiv">
                            <div style={{ padding: 4, whiteSpace:'nowrap'  }}>

                                {hideMyValues === 'false' ?
                                    <span className='font-roboto-condensed' onClick={() => sethideMyValues('true')}>{baseCurrencyBalance.toFixed(4)} {currentMarket?.baseCurrencySymbol}</span>
                                    :
                                    <span onClick={() => sethideMyValues('false')}>*** {marketType !== 'Spot' ? currentMarket?.quoteCurrency?.symbol : currentMarket?.baseCurrencySymbol}</span>
                                }

                            </div>
                            <div style={{ paddingLeft: 8, paddingRight: 8 }}>
                                <button className="btn btn-md hoverbutton sellbutton" type="button" style={{ height: 40, fontSize: 16 }} onClick={e => submitOrderCreation(e, 'sell')}>
                                    <Trans>SELL</Trans> {marketType === "Margin" && <>(Short)</>}
                                </button>
                            </div>
                            <div style={{ padding: 4, whiteSpace:'nowrap'  }}>
                                <span className='font-roboto-condensed'><Trans>Cost</Trans>:&nbsp;</span><span className='font-roboto-condensed'>{orderAmount ? orderAmount.toFixed(4) : 0.000000} {currentMarket?.baseCurrency?.symbol}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-well" style={{ height: 56, transition: 'all 0.5s', opacity: isEnterPressed ? 1 : 0, display: isEnterPressed ? 'flex' : 'none', justifyContent: 'space-around', borderColor: Colors.bitflexGolderColor2, borderStyle: 'dashed', borderWidth: 1 }}>
                        <div>
                            <p style={{ marginBottom: 8, fontSize: 14 }}>Arrow Left to BUY</p>
                            <FaArrowAltCircleLeft size={25} color={'#35CB3Baa'} />
                        </div>
                        <div style={{ border: '1px dashed grey' }}>

                        </div>
                        <div>
                            <p style={{ marginBottom: 8, fontSize: 14 }}>Arrow Right to SELL</p>
                            <FaArrowAltCircleRight size={25} color={'#E03C2D'} />
                        </div>
                    </div>
                </div>
            </Tabs>
        </BFPortlet >
    );
}