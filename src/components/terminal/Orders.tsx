import { ApiGetOrders, GetOrdersResponse, TradeType } from '../../api-wrapper/api';
import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import React, { useCallback, useEffect, useState } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Trans, useTranslation } from 'react-i18next';

import { BFPortlet } from '../html/BFPortlet';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { DispacherBaseTypes } from '.';
import { FaCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { Store } from '../../store';
import { isMobile } from 'react-device-detect';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useSignalR } from '../../hooks/useSignalR';
import useUserState from '../../hooks/useUserState';

export function Orders({
    orders, dispatch_myOrders,
    myOrdersClosed, dispatch_myOrdersClosed,
    onForceUpdate,
    onForceUserOrdersReload,
    isLoading
}: {
    orders: Array<ApiGetOrders>, dispatch_myOrders: React.Dispatch<{ type: any; value: any }>,
    myOrdersClosed: Array<ApiGetOrders>, dispatch_myOrdersClosed: React.Dispatch<{ type: any; value: any }>,
    onForceUpdate,
    onForceUserOrdersReload,
    isLoading: Boolean
}) {
    const {
        state: {
            globalPairName
        } } = React.useContext(Store);

    const [hideMyValues, sethideMyValues] = useLocalStorage('hideMyValues', 'false');

    const [tabIndex, settabIndex] = useState(0);
    const { OnUserOrdersUpdate } = useSignalR();

    useEffect(() => {
        if (!dispatch_myOrders) return;

        OnUserOrdersUpdate((actionType: any, order: ApiGetOrders) => {
            switch (actionType) {
                case "Add":
                case "Update": dispatch_myOrders({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: order });
                    break;
                case "Remove": dispatch_myOrders({ type: DispacherBaseTypes.DELETE, value: order });
                    break;
            }
        });

    }, [OnUserOrdersUpdate, dispatch_myOrders]);

    const CancelOrder = useCallback((order) => {
        if (!dispatch_myOrders) return;

        document.getElementById(order.id)?.style.setProperty("opacity", "0.3");
        document.getElementById(order.id)?.style.setProperty("dsiabled", "true");
        BitflexOpenApi.OrdersApi.apiVversionOrdersCancelPost("1.0", order.id).then(result => {

            if (result.data.result)
                dispatch_myOrders({ type: DispacherBaseTypes.DELETE, value: order })
            else {
                document.getElementById(order.id)?.style.setProperty("opacity", "1");
                alert("[Orders] Error order cancel: " + result.data.reason)
            }
        })
    }, [dispatch_myOrders])

    const ToggleHideMyValues = useCallback(() => {
        sethideMyValues(hideMyValues === 'false' ? 'true' : 'false');
        onForceUpdate();
    }, [hideMyValues, onForceUpdate, sethideMyValues]);

    const { t } = useTranslation();

    const [isCancelAllLoading, setisCancelAllLoading] = useState(false);

    return (
        <BFPortlet title={t('My Orders & Positions')}
            isLoading={isLoading}
            isBlockUnauthorized={true}
            isStringUnauthenticated={true}
            isScrollable={true}
        >
            <Tabs
                className='tabbable-custom dontDragMe'
                selectedIndex={tabIndex}
                onSelect={settabIndex}
                style={{ whiteSpace: 'nowrap' }}>
                <TabList>
                    <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ maxWidth: isMobile ? '30%' : '25%', padding: 12 }}><Trans>Active Orders</Trans></Tab>
                    <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ maxWidth: isMobile ? '30%' : '25%', padding: 12 }}><Trans>Closed Orders</Trans></Tab>
                    <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ maxWidth: isMobile ? '30%' : '25%', padding: 12 }}><Trans>Active Positions</Trans></Tab>
                    <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ maxWidth: isMobile ? '30%' : '25%', padding: 12 }}><Trans>Closed Positions</Trans></Tab>
                </TabList>
                <TabPanel>
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
                                <th className='thFix stickyHeader' style={{ textAlign: 'center' }} >
                                    <div style={{ margin: -2 }}>
                                        <BFGradientButton buttonType={BFGradientButtonType.DestructiveSmall} isDisabled={isCancelAllLoading} text={t('Cancel All')} onPress={() => {
                                            BitflexOpenApi.OrdersApi.apiOrdersCancelallPost(globalPairName, false,).finally(() => {
                                                onForceUserOrdersReload();
                                            })
                                        }} />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="font-roboto-condensed">
                            {orders &&
                                orders.filter(_ => !_.isMargin).map(userOrder =>
                                    <tr id={userOrder.id?.toString()} key={userOrder.id}
                                        style={{
                                            borderLeftColor: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa',
                                            borderWidth: 5, borderStyle: 'solid', borderTopWidth: 0, borderBottomWidth: 0, borderRightWidth: 0
                                        }}>
                                        <td className='tdFix'>
                                            {userOrder.created && <Moment format="HH:mm:ss D.MMM" unix tz="GMT">{userOrder.created!}</Moment>}
                                        </td>
                                        <td className='tdFix'>
                                            {globalPairName}
                                        </td>
                                        <td className='tdFix' style={{ color: 'white' }}>
                                            {userOrder.orderType}
                                        </td>
                                        <td className='tdFix'>
                                            <span style={{ color: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa' }}>{userOrder.price!.toFixed(8)}</span></td>
                                        <td className='tdFix'>
                                            <span style={{ cursor: 'pointer' }} onClick={ToggleHideMyValues}>{hideMyValues === 'false' ? userOrder.amount!.toFixed(8) : '***'}</span>
                                        </td>
                                        <td className='tdFix'>
                                            {(((userOrder.amount! - userOrder.amountLeft!) / userOrder.amount!) * 100).toFixed(2)}
                                        </td>
                                        <td className='tdFix'>
                                            <span style={{ cursor: 'pointer' }} onClick={ToggleHideMyValues}>{hideMyValues === 'false' ? (userOrder.price! * userOrder.amount!).toFixed(8) : '***'}</span>
                                        </td>
                                        <td className='tdFix'>
                                            {userOrder.stopLossPrice! > 0 && <span>≤ {userOrder.stopLossPrice} </span>} {(userOrder.stopLossPrice! > 0 && userOrder.takeProfitPrice! > 0) ? <span>&</span> : <span>—</span>} {userOrder.takeProfitPrice! > 0 && <span>≥ {userOrder.takeProfitPrice} </span>}
                                        </td>
                                        <td className='tdFix' style={{ textAlign: 'center' }}>
                                            <BFGradientButton buttonType={BFGradientButtonType.GoldenBorderActionSmall} onPress={() => CancelOrder(userOrder)} text={t('Cancel')} />
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </TabPanel>
                <TabPanel>
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
                            </tr>
                        </thead>
                        <tbody className="font-roboto-condensed">
                            {myOrdersClosed &&
                                myOrdersClosed.filter(_ => !_.isMargin).map(userOrder =>
                                    <tr id={userOrder.id?.toString()} key={userOrder.id}
                                        style={{
                                            borderLeftColor: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa',
                                            borderWidth: 5, borderStyle: 'solid', borderTopWidth: 0, borderBottomWidth: 0, borderRightWidth: 0
                                        }}>
                                        <td className='tdFix'>
                                            {userOrder.created && <Moment format="HH:mm:ss D.MMM" unix tz="GMT">{userOrder.created!}</Moment>}
                                        </td>
                                        <td className='tdFix'>
                                            {globalPairName}
                                        </td>
                                        <td className='tdFix' style={{ color: 'white' }}>
                                            {userOrder.orderType}
                                        </td>
                                        <td className='tdFix'>
                                            <span style={{ color: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa' }}>{userOrder.price!.toFixed(8)}</span></td>
                                        <td className='tdFix'>
                                            <span style={{ cursor: 'pointer' }} onClick={ToggleHideMyValues}>{hideMyValues === 'false' ? userOrder.amount!.toFixed(8) : '***'}</span>
                                        </td>
                                        <td className='tdFix'>
                                            {(((userOrder.amount! - userOrder.amountLeft!) / userOrder.amount!) * 100).toFixed(2)}
                                        </td>
                                        <td className='tdFix'>
                                            <span style={{ cursor: 'pointer' }} onClick={ToggleHideMyValues}>{hideMyValues === 'false' ? (userOrder.price! * userOrder.amount!).toFixed(8) : '***'}</span>
                                        </td>
                                        <td className='tdFix'>
                                            {userOrder.stopLossPrice! > 0 && <span>≤ {userOrder.stopLossPrice} </span>} {(userOrder.stopLossPrice! > 0 && userOrder.takeProfitPrice! > 0) ? <span>&</span> : <span>—</span>} {userOrder.takeProfitPrice! > 0 && <span>≥ {userOrder.takeProfitPrice} </span>}
                                        </td>

                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </TabPanel>
                <TabPanel>

                </TabPanel>

                <TabPanel>

                </TabPanel>
            </Tabs>
        </BFPortlet>
    );
}