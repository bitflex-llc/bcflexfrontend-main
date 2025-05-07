import { ArticleType, StaticPagesLayout } from './StaticPagesLayout';
import { FaCheck, FaTimesCircle } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';

import { BFNotification } from '../html/BFNotification';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import Colors from '../../Colors';
import { CurrencyStatus } from '../../api-wrapper/api';
import { LoadingComponent } from '../LoadingComponent';
import { NavMenu } from '../NavMenu';
import { isMobile } from 'react-device-detect';

export  default function Status() {

    const [statuses, setstatuses] = useState<Array<CurrencyStatus>>();

    useEffect(() => {
        BitflexOpenApi.StaticPagesApi.apiVversionStaticPagesStatusGet("1.0").then(data => {
            setstatuses(data.data)
        });

    }, [])

    return (
        <StaticPagesLayout article={ArticleType.Privacy} isDashboard={false} isFullScreen={true}>
            <div style={{}}>
                {!statuses
                    ? <LoadingComponent />
                    :
                    <>
                        <table className={'table-striped scrollable-bf'}>
                            <thead>
                                <tr style={{ height: 50 }}>
                                    <th className={'table-fee-th stickyHeader tdFix-left width10Percent '}>Currency</th>
                                    <th className={'table-fee-th stickyHeader'}>Withdraw Status</th>
                                    <th className={'table-fee-th stickyHeader'}>Deposit Status</th>
                                    <th className={'table-fee-th stickyHeader'}>Last Block</th>
                                    <th className={'table-fee-th stickyHeader'}>Last Proceeded Block</th>
                                </tr>
                            </thead>

                            <tbody>

                                {statuses.map(status => {
                                    return <tr style={{ height: 65 }}>

                                        <td className='table-fee-td tdFix-left width10Percent'>
                                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                <div><img alt="image1" style={{ maxHeight: 18, marginTop: 4, marginRight: 5 }} src={status.image!} /></div>
                                                <span>{status.name}</span>
                                            </div>
                                        </td>
                                        <td className={'table-fee-td'}>{!status.withdrawDisabled ? <FaCheck style={{ fontSize: 14, color: Colors.bitFlexGreenColor }} /> : <FaTimesCircle style={{ fontSize: 14, color: 'white', opacity: 0.3 }} />}</td>
                                        <td className={'table-fee-td'}>{!status.depositDisabled ? <FaCheck style={{ fontSize: 14, color: Colors.bitFlexGreenColor }} /> : <FaTimesCircle style={{ fontSize: 14, color: 'white', opacity: 0.3 }} />}</td>
                                        <td className={'table-fee-td'}>{status.lastBlock}</td>
                                        <td className={'table-fee-td'}>{status.lastLocalBlock}</td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </>
                }
            </div>
        </StaticPagesLayout>


    );
}