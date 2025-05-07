import * as React from 'react';

import { ApiGetOrders, OrderTypes, TradeType } from '../../api-wrapper/api';
// import { ChartingLibraryWidgetOptions, IChartingLibraryWidget, LanguageCode } from '../charting_library/charting_library';
import { useCallback, useEffect, useState } from 'react';

import { API_ENDPOINT } from '../../API';
import { BFPortlet } from '../html/BFPortlet';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { Store } from '../../store';
import { widget } from '../charting_library/charting_library.esm';

import { createChart, CandlestickSeries, CandlestickData, Time } from 'lightweight-charts'

export function TVChartContainer({
    symbol,
    orders, dispatch_myOrders,
    myOrdersClosed, dispatch_myOrdersClosed,
}: {
    symbol: string,
    orders: Array<ApiGetOrders>, dispatch_myOrders: React.Dispatch<{ type: any; value: any }>,
    myOrdersClosed: Array<ApiGetOrders>, dispatch_myOrdersClosed: React.Dispatch<{ type: any; value: any }>,
}) {
    const {
        state: {
            globalPairName,
            lastPrice
        } } = React.useContext(Store);

    // const [chartWidget2, setchartWidget] = useState<IChartingLibraryWidget>();

    const [isLoading, setisLoading] = useState(false);

    // const RenderChartPrimitives = useCallback((chartWidget: IChartingLibraryWidget) => {
    //     if (!orders) return;

    //     try {
    //         orders.forEach(order => {
    //             // if (order.orderType === OrderTypes.Market) return;

    //             if (!order.isMargin) {
    //                 var orderChart = chartWidget.chart();//.activeChart();

    //                 orderChart.createOrderLine({})
    //                     .onCancel(() => {
    //                         // orderChart.remove();
    //                         BitflexOpenApi.OrdersApi.apiVversionOrdersCancelPost("1.0", order!.id!);
    //                     })
    //                     .setPrice(order.price!)
    //                     .setText(order?.tradeType + ' ' + order!.price!.toFixed(8))
    //                     .setLineLength(2)
    //                     .setBodyBackgroundColor(order.tradeType! === TradeType.Buy ? 'rgb(30, 233, 149)' : '#E03C2D')
    //                     .setBodyBorderColor(order.tradeType! === TradeType.Buy ? '#28805c' : '#bc5450')
    //                     .setBodyTextColor("#FFF")
    //                     .setQuantity(order.amountLeft!.toFixed(8));
    //             } else {
    //                 var position = chartWidget.chart();

    //                 position.createPositionLine({})
    //                     .onModify(function () {
    //                         alert("modify")
    //                     })
    //                     .onReverse("onReverse called", function (text) {
    //                         alert("onReverse")
    //                     })
    //                     .onClose(order!.id!, function (id: number) {
    //                         // position.remove();
    //                         BitflexOpenApi.OrdersApi.apiVversionOrdersCancelPost("1.0", id);
    //                     })
    //                     .setText("P&L: 0.0%")
    //                     .setQuantity(order.amountLeft!.toFixed(8))
    //                     .setPrice(order.price!)
    //                     .setExtendLeft(false)
    //                     .setLineStyle(0)
    //                     .setLineLength(25);
    //             }
    //         });
    //     }
    //     catch {
    //         console.warn("RenderChartPrimitives, Seems Graph is null")
    //     }
    // }, [orders])


    useEffect(() => {

        const chartOptions = { layout: { textColor: 'black', background: { color: 'transparent' } } };
        const chart = createChart(document.getElementById('tv_chart_container')!, chartOptions);
        const candlestickSeries = chart.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });

        // const data = [{ open: 10, high: 10.63, low: 9.49, close: 9.55, time: '2019-04-12' }];

        BitflexOpenApi.TradingViewApi.apiTradingViewLightweightHistoryGet(symbol).then(quotes => {

            var arr: { open: number, high: number, low: number, close: number, time: string }[] = [];

            quotes.data.forEach(quote => {
                arr.push({
                    open: quote!.open!,
                    high: quote!.high!,
                    low: quote!.low!,
                    close: quote!.close!,
                    time: quote.time!
                })
            })

            candlestickSeries.setData(arr);

            chart.timeScale().fitContent();

        })

    }, [])



    return (
        <BFPortlet title={'Chart'} isLoading={isLoading} noHeader={true} isScrollable={false}>
            <div style={{ height: '100%', paddingLeft: 0, paddingRight: 0, position: 'relative' }} >
                {/* <div className={'chart-watermark'}>
                    <div>{globalPairName} | {lastPrice?.toFixed(6)}</div>
                    <div> BCFLEX Exchange </div>
                </div> */}
                <div className={'chart-watermark'}>
                    <div>{globalPairName} | {lastPrice?.toFixed(6)}</div>
                    <div> No Historical Data </div>
                </div>
                <div
                    id={'tv_chart_container'}
                    className={'TVChartContainer'}
                />
            </div>
        </BFPortlet>
    );
}

// function getLanguageFromURL(): LanguageCode | null {
//     const regex = new RegExp('[\\?&]lang=([^&#]*)');
//     const results = regex.exec(window.location.search);
//     return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode;
// }