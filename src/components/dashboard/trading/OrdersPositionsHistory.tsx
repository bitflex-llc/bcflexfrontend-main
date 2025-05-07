import 'moment-timezone';

import { ApiGetDepositsWitdrawals, Order, OrderState, TradeType } from '../../../api-wrapper/api';
import React, { useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import Moment from 'react-moment';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Trans } from 'react-i18next';

export default function OrdersPositionsHistory() {

    const [orderspositions, setorderspositions] = useState<Order[]>();

    useEffect(() => {
        BitflexOpenApi.UserApi.apiVversionUserTradehistoryGet("1.0", undefined)
            .then(response => {
                setorderspositions(response.data)
            })
    }, [])

    return (
        <StaticPagesLayout isDashboard={true} isLoading={!orderspositions}>
            <>
                <div className={'bf-dash-header'}>
                    <h1 className={'bf-dashboard-title'}><Trans>Orders & Positions History</Trans></h1>
                </div>
                <Tabs className='tabbable-custom dontDragMe'>
                    <TabList>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' ><Trans>Orders</Trans></Tab>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab'><Trans>Positions</Trans></Tab>
                    </TabList>
                    <TabPanel>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped scrollable-bf">
                                <thead>
                                    <tr>
                                        <th className='thFix stickyHeader' style={{ fontWeight: 'bold' }}><Trans>Date</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Pair</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Type</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Price</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Quantity</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Filled%</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Total</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Trigger</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Close Reason</Trans></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderspositions &&
                                        orderspositions.filter(_ => !_.isMargin).map(userOrder =>
                                            <tr id={userOrder.id?.toString()} key={userOrder.id}
                                                style={{
                                                    borderLeftColor: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa',
                                                    borderWidth: 5, borderStyle: 'solid', borderTopWidth: 0, borderBottomWidth: 0, borderRightWidth: 0
                                                }}>
                                                <td className='tdFix font-roboto-condensed'>
                                                    {userOrder.dateCreated && <Moment format="HH:mm:ss" unix tz="GMT">{userOrder.dateCreated!}</Moment>}
                                                </td>
                                                <td className='tdFix'>
                                                    {userOrder.tradePairname}
                                                </td>
                                                <td className='tdFix' style={{ color: 'white' }}>
                                                    {userOrder.orderType}
                                                </td>
                                                <td className='tdFix font-roboto-condensed'>
                                                    <span style={{ color: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa' }}>{userOrder.price!.toFixed(8)}</span></td>
                                                <td className='tdFix font-roboto-condensed'>
                                                    <span style={{ cursor: 'pointer' }}>{userOrder.amount!.toFixed(8)}</span>
                                                </td>
                                                <td className='tdFix font-roboto-condensed'>
                                                    {(((userOrder.amount! - userOrder.amountLeft!) / userOrder.amount!) * 100).toFixed(2)}
                                                </td>
                                                <td className='tdFix font-roboto-condensed'>
                                                    <span style={{}}>{(userOrder.price! * userOrder.amount!).toFixed(8)}</span>
                                                </td>
                                                <td className='tdFix font-roboto-condensed'>
                                                    {userOrder.stopLossPrice! > 0 && <span>≤ {userOrder.stopLossPrice} </span>} {(userOrder.stopLossPrice! > 0 && userOrder.takeProfitPrice! > 0) ? <span>&</span> : <span>—</span>} {userOrder.takeProfitPrice! > 0 && <span>≥ {userOrder.takeProfitPrice} </span>}
                                                </td>
                                                <td className='tdFix' style={{ textAlign: 'center' }}>
                                                    {userOrder.orderState}
                                                </td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th className='thFix stickyHeader' style={{ fontWeight: 'bold' }}><Trans>Date</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Pair</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Type</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Price</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Quantity</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Filled%</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Total</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Trigger</Trans></th>
                                        <th className='thFix stickyHeader'><Trans>Close Reason</Trans></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {witdrawals.map(widthrawal => {
                                    return (
                                        <tr key={widthrawal.txId}>
                                            <td className='tdFix tdFix-left'>{widthrawal.currency}</td>
                                            <td className='tdFix'>{widthrawal.amount!.toFixed(8)}</td>
                                            <td className='tdFix'><Moment format="DD MMMM HH:mm:ss" unix tz="GMT">{widthrawal.dateTime!}</Moment></td>
                                            <td className='tdFix'><a href={widthrawal.blockExURL! + widthrawal.txId} target='_blank' rel='noopener noreferrer'>{widthrawal.txId}</a></td>
                                        </tr>
                                    )
                                })} */}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                </Tabs>
            </>
        </StaticPagesLayout>
    );
}