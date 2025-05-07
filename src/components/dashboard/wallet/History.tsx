import 'moment-timezone';

import { FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { useEffect, useState } from 'react';

import { ApiGetDepositsWitdrawals } from '../../../api-wrapper/api';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import Colors from '../../../Colors';
import { ICurrency } from '../../../store/types';
import Moment from 'react-moment';
import React from 'react';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Store } from '../../../store';
import { Trans } from 'react-i18next';
// import { useClientMethod } from 'react-use-signalr';
import { useSignalR } from '../../../hooks/useSignalR';

export default function History() {

    const [deposits, setdeposits] = useState<Array<ApiGetDepositsWitdrawals>>([]);
    const [witdrawals, setwitdrawals] = useState<Array<ApiGetDepositsWitdrawals>>([]);

    const {
        state: { currencies },
        dispatch
    } = React.useContext(Store);

    const { privateInstance } = useSignalR();

    async function LoadDepositsAndWithdrawals() {
        Promise.all([
            BitflexOpenApi.UserApi.apiVversionUserDepositsGet("1.0", undefined),
            BitflexOpenApi.UserApi.apiVversionUserWithdrawalsGet("1.0", undefined)
        ]).then(promiseResult => {
            setdeposits(promiseResult[0].data)
            setwitdrawals(promiseResult[1].data)
        });
    }

    useEffect(() => {
        LoadDepositsAndWithdrawals()
    }, [])

    // useClientMethod(privateInstance, "update_depositswithdrawals", () => {
    //     LoadDepositsAndWithdrawals();
    // });


    return (
        <StaticPagesLayout isDashboard={true} isLoading={!deposits || !witdrawals || !currencies}>
            <>
                <div className={'bf-dash-header'}>
                    <h1 className={'bf-dashboard-title'}><Trans>Deposits & Withdrawals</Trans></h1>
                </div>
                <Tabs className='tabbable-custom dontDragMe'>
                    <TabList>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab'><Trans>Deposits</Trans></Tab>
                        <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab'><Trans>Withdrawals</Trans></Tab>
                    </TabList>
                    <TabPanel>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped scrollable-bf">
                                <thead>
                                    <tr>
                                        <th className='thFix stickyHeader tdFix-left noborder'><Trans>Coin / Token / Asset</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>Amount</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>Datetime (UTC)</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>TxId / Hash</Trans></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deposits.map(deposit => {
                                        var currencyIn = currencies.find(x => x.name === deposit.currency) as ICurrency;
                                        if (currencyIn)
                                            return (
                                                <tr key={deposit.txId} style={{ fontSize: 12, height: 46, opacity: deposit.pending ? 0.4 : 1 }}>


                                                    <td className='tdFix tdFix-left'>
                                                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                            <div>{(currencyIn && currencyIn.imageBase64) && <img alt="image1" style={{ maxHeight: 18, marginTop: 4, marginRight: 5 }} src={currencyIn.imageBase64} />}</div>
                                                            <div>{deposit.currency}</div>
                                                        </div>
                                                    </td>

                                                    <td className='tdFix' style={{ color: Colors.bitFlexGreenColor }}>{deposit.amount!.toFixed(8)}</td>
                                                    <td className='tdFix'>
                                                        {deposit.pending
                                                            ? <div style={{ display: 'inline-flex' }}>
                                                                <div>Pending Deposit</div>
                                                            </div>
                                                            :
                                                            <Moment format="DD MMMM HH:mm:ss" unix tz="GMT">{deposit.dateTime!}</Moment>
                                                        }
                                                    </td>
                                                    <td className='tdFix'><a href={deposit.blockExURL! + deposit.txId} target='_blank' rel='noopener noreferrer'>{deposit.txId?.substring(0, 16)}... <FaExternalLinkAlt /></a></td>
                                                </tr>
                                            )

                                        return <></>
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th className='thFix stickyHeader tdFix-left noborder'><Trans>Coin / Token / Asset</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>Amount</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>Datetime (UTC)</Trans></th>
                                        <th className='thFix stickyHeader noborder'><Trans>TxId / Hash</Trans></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {witdrawals.map(widthrawal => {
                                        return (
                                            <tr key={widthrawal.txId} style={{ fontSize: 12, height: 46 }}>
                                                <td className='tdFix tdFix-left'>{widthrawal.currency}</td>
                                                <td className='tdFix'>{widthrawal.amount!.toFixed(8)}</td>
                                                <td className='tdFix'><Moment format="DD MMMM HH:mm:ss" unix tz="GMT">{widthrawal.dateTime!}</Moment></td>
                                                <td className='tdFix'><a href={widthrawal.blockExURL! + widthrawal.txId} target='_blank' rel='noopener noreferrer'>{widthrawal.txId?.substring(0, 16)}... <FaExternalLinkAlt /></a></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </TabPanel>
                </Tabs>
            </>
        </StaticPagesLayout>
    );
}