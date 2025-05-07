import 'moment-timezone';

import { GetTradeHistoryResponse, TradeType } from '../../api-wrapper/api';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { BFPortlet } from '../html/BFPortlet';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { FaCircle } from 'react-icons/fa';
import Moment from 'react-moment';
import { Store } from '../../store';
import { formatDigits } from './MarketTabs';

export function History({
    tradeHistory,
    isLoading,
    isError
}: {
    tradeHistory: GetTradeHistoryResponse[],
    isLoading: Boolean,
    isError?: Boolean
}) {
    const {
        state: { averageColor } } = React.useContext(Store);
    const { t } = useTranslation();

    return <BFPortlet title={t('History')}
        isLoading={isLoading}
        isError={isError}
    >
        <table className="table table-striped scrollable-bf">
            <thead>
                <tr>
                    <th className='thFix stickyHeader'><Trans>Time</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Price</Trans></th>
                    <th className='thFix stickyHeader'><Trans>Quantity</Trans></th>
                </tr>
            </thead>
            <tbody>
                {tradeHistory.map(history => (
                    <tr key={history.dateTime! + history.amount! + history.price! + Math.random()}>
                        <td className='tdFix font-roboto-condensed' style={{ color: 'white' }}>
                            <Moment format="HH:mm:ss" unix tz="GMT">{history.dateTime}</Moment>
                        </td>
                        <td className='tdFix font-roboto-condensed'>
                            <div style={{ textAlign: 'center', color: history.type === TradeType.Sell ? '#E03C2D' : '#35CB3Baa' }}>
                                {history.price! > 0 ? formatDigits(history.price!) : "Market"}
                            </div>
                        </td>
                        <td className='tdFix font-roboto-condensed' style={{ color: 'white' }}>
                            {formatDigits(history.amount!)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </BFPortlet>

    // return (
    //     <div className="portlet light portlet-fit bordered" style={{ height: '100%' }}>
    //         <div className="portlet-title draggable">
    //             <div className="caption">
    //                 <FaCircle style={{ fontSize: 11, color: averageColor, marginRight: 6 }} />
    //                 <Trans>History</Trans>
    //             </div>
    //         </div>
    //         <div className="portlet-body">
    //             <div className={'scrollable-bf'} style={{ height: '100%', clear: 'both' }}>

    //             </div>
    //         </div>
    //     </div>
    // );
}