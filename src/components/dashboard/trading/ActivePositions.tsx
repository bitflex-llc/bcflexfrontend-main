import 'moment-timezone';

import { ApiGetOrders, TradeType } from '../../../api-wrapper';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import React, { useEffect, useReducer, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BFPortlet } from '../../html/BFPortlet';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { DispacherBaseTypes } from '../../terminal';
import Moment from 'react-moment';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Store } from '../../../store';
import { useCallback } from 'react';
import useLocalStorage from '../../../hooks/useLocalStorage';
import { useSignalR } from '../../../hooks/useSignalR';
import useUserState from '../../../hooks/useUserState';

export default function ActivePositions({
    isOnlyPortlet
}: {
    isOnlyPortlet?: Boolean
}) {

    const {
        state: { globalPairName }
    } = React.useContext(Store);

    const [hideMyValues, sethideMyValues] = useLocalStorage('hideMyValues', 'false');
    const { isSignedIn } = useUserState();
    const { OnUserOrdersUpdate } = useSignalR();
    const { t } = useTranslation();

    const [isLoading, setisLoading] = useState(true);

    const [myOrders, dispatch] = useReducer((orders: Array<ApiGetOrders>, { type, value }): Array<ApiGetOrders> => {
        const index = orders.findIndex((item) => item.id === value.id);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                setisLoading(false)
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

    useEffect(() => {
        if (!isSignedIn || !globalPairName || !BitflexOpenApi.UserApi)
            return;

        BitflexOpenApi.UserApi.apiVversionUserOrdersGet("1.0", globalPairName).then(response => dispatch({ type: DispacherBaseTypes.INIT_LOAD, value: response.data.openOrders?.filter(_ => _.isMargin) }));
    }, [globalPairName, isSignedIn]);

    useEffect(() => {
        OnUserOrdersUpdate((actionType, order) => {
            switch (actionType) {
                case "Add":
                case "Update":
                    console.log("terminalHubConnection.on('userOrdersUpdate') ADD OR UPDATE", order)
                    dispatch({ type: DispacherBaseTypes.ADD_OR_UPDATE, value: order as ApiGetOrders });
                    break;

                case "Remove":
                    console.log("terminalHubConnection.on('userOrdersUpdate') REMOVE", order)
                    dispatch({ type: DispacherBaseTypes.DELETE, value: order });
                    break;
            }
        });
    }, [OnUserOrdersUpdate]);

    function CancelOrder(order) {
        BitflexOpenApi.OrdersApi.apiVversionOrdersCancelPost("1.0", order.id).then(result => {
            if (result.data.result)
                dispatch({ type: DispacherBaseTypes.DELETE, value: order })
            else {
                alert("[ActivePositions]Error order cancel: " + result.data.reason)
            }
        });
    }

    const ToggleHideMyValues = useCallback((): void => {
        sethideMyValues(hideMyValues === 'false' ? 'true' : 'false');
    }, [hideMyValues, sethideMyValues]);

    const RenderOrderTable = useCallback((): JSX.Element => {
        return <table className="table table-striped">
            <thead>
                <tr>
                    <th className='thFix stickyHeader' style={{ fontWeight: 'bold' }}><Trans>Date</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Pair</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Type</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Side</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Price</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Quantity</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Total</Trans></th>
                    <th className='thFix stickyHeader' style={{ textAlign: 'center' }} >
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody className="font-roboto-condensed">
                {myOrders &&
                    (myOrders as Array<ApiGetOrders>).map(userOrder =>
                        <tr id={userOrder.id?.toString()} key={userOrder.id} >
                            <td className='tdFix'>
                                {userOrder.created && <Moment format="HH:mm:ss" unix tz="GMT">{userOrder.created!}</Moment>}
                                {/* {userOrder.dateCreated > 0 && <Moment format="HH:mm:ss" unix tz="GMT">{userOrder.dateCreated!}</Moment>} */}
                            </td>
                            <td className='tdFix'>
                                {userOrder.pairName}
                            </td>
                            <td className='tdFix' style={{ color: 'white' }}>
                                {userOrder.orderType}
                            </td>
                            <td className='tdFix'>
                                <span style={{ color: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa' }}>{userOrder.tradeType}</span>
                            </td>
                            <td className='tdFix'>
                                <span style={{ color: userOrder.tradeType! === TradeType.Sell ? '#E03C2D' : '#35CB3Baa' }}>{userOrder.price!.toFixed(8)}</span></td>
                            <td className='tdFix'>
                                <span style={{ cursor: 'pointer' }} onClick={ToggleHideMyValues}>{hideMyValues === 'false' ? userOrder.amount!.toFixed(8) : '***'}</span>
                            </td>
                            <td className='tdFix'>
                                <span style={{ cursor: 'pointer' }} onClick={ToggleHideMyValues}>{hideMyValues === 'false' ? (userOrder.price! * userOrder.amount!).toFixed(8) : '***'}</span>
                            </td>

                            <td className='tdFix' style={{ textAlign: 'center' }}>
                                <BFGradientButton buttonType={BFGradientButtonType.GoldenBorderActionSmall} onPress={() => CancelOrder(userOrder)} text={t('Cancel')} />
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </table>
    }, [t, myOrders, globalPairName, ToggleHideMyValues, hideMyValues])

    const PortletApperance = useCallback((): JSX.Element => {
        return <BFPortlet title={t('My Orders')}>{RenderOrderTable()}</BFPortlet>
    }, [RenderOrderTable, t]);

    const DashboardAppearance = useCallback((): JSX.Element => {
        return <StaticPagesLayout isDashboard={true} isLoading={isLoading}>
            <>
                <div className={'bf-dash-header'}>
                    <h1 className={'bf-dashboard-title'}><Trans>My Positions</Trans></h1>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    {RenderOrderTable()}
                </div>
            </>
        </StaticPagesLayout>
    }, [RenderOrderTable, isLoading])

    return isOnlyPortlet ? PortletApperance() : DashboardAppearance();
}