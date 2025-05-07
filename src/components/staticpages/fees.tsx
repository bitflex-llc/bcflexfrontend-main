import { ArticleType, StaticPagesLayout } from './StaticPagesLayout';
import { AssetsResponseModel, ReturnFeeStructure } from '../../api-wrapper/api';
import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { useNavigate } from 'react-router-dom';
import useUserState from '../../hooks/useUserState';

export default function Fees() {

    const [feeStructure, setfeeStructure] = useState<ReturnFeeStructure>();
    const [isLoading, setisLoading] = useState(true);
    const [tabSelectedIndex, settabSelectedIndex] = useState(0);

    const [assets, setassets] = useState<{ [key: string]: AssetsResponseModel; }>();

    useEffect(() => {
        BitflexOpenApi.UserApi.apiVversionUserFeesGet("1.0")
            .then(response => {
                setfeeStructure(response.data)
            })
            .finally(() => setisLoading(false))


        BitflexOpenApi.MarketsApi.apiMarketsAssetsGet()
            .then(response => {
                setassets(response.data)
            })
    }, [])

    const history = useNavigate();

    const { t } = useTranslation();


    const { isSignedIn } = useUserState();
    return (
        <StaticPagesLayout article={ArticleType.Fees} isDashboard={false} isLoading={isLoading} header={'Fee Schedule'} pageIndex={2} >
            <>
                <div style={{ textAlign: 'center', fontWeight: 1000, height: '100%' }} className={'scrollable-bf'}>
                    {!isSignedIn ?
                        <>
                            <h3 className={'fee-h3'}>Log in to check your trading fee rate</h3>
                            <BFGradientButton buttonType={BFGradientButtonType.Action} text={t('Login')} isLinkButton={true} to={'/signin'} width={200} />
                            <div className={'bf-well-orange center marginTop30'} style={{ width: 300, padding: 20, marginBottom: 30, color: 'white' }}>
                                Up to 25% Trading Fee Off
                                <br />
                                <span className={'bf-textSubtitle'}>For BTFX Token Holders</span>
                            </div>
                        </>
                        : feeStructure &&
                        <>
                            <h3>Your fee rate level is: {feeStructure.userFeeLevel?.feeLevel}</h3>
                        </>
                    }

                    <Tabs
                        className='tabbable-custom dontDragMe'
                        selectedIndex={tabSelectedIndex}
                        onSelect={settabSelectedIndex}
                    >
                        <TabList>
                            <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '33%', fontSize: 21 }}><Trans>Spot Markets</Trans></Tab>
                            <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '33%', fontSize: 21 }}><Trans>Margin Markets</Trans></Tab>
                            <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '33%', fontSize: 21, }}><Trans>Deposit & Withdrawal Fees</Trans></Tab>
                        </TabList>
                        <TabPanel>
                            <table className={'table-striped scrollable-bf'}>
                                <thead>
                                    <tr style={{ height: 50 }}>
                                        <th className={'table-fee-th stickyHeader width10Percent'}>Level</th>
                                        {/* <th className={'table-fee-th width10Percent'}>and/or</th> */}
                                        <th className={'table-fee-th stickyHeader'}>30d Trade Volume(in BTC)</th>
                                        <th className={'table-fee-th stickyHeader'}>Maker / Taker</th>
                                        <th className={'table-fee-th stickyHeader'}>BTFX Balance</th>
                                        <th className={'table-fee-th stickyHeader'}>BTFX Holders Maker/Taker</th>
                                    </tr>
                                </thead>
                                {/* // background: '#101318'  */}
                                {/* background: '#2A3541'  */}
                                <tbody>
                                    {feeStructure && Object.entries(feeStructure?.baseFeeLevels!).map(feeLevel => {
                                        return <tr style={{ height: 65 }}>
                                            <td className={'table-fee-td width10Percent'}>{feeLevel[0]}</td>
                                            {feeLevel[0] === "0"
                                                ? <td className={'table-fee-td'}>Less than 25 BTC</td>
                                                : <td className={'table-fee-td'}>More than {feeLevel[1].btcTurnover} BTC</td>
                                            }
                                            <td className={'table-fee-td'}>{feeLevel[1].makerFee?.toFixed(3)}% / {feeLevel[1].takerFee?.toFixed(3)}%</td>
                                            <td className={'table-fee-td'}>TBD*</td>
                                            <td className={'table-fee-td'}>TBD*</td>
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                            <h4>*TBD - To Be Determined upon BTFX Token Release</h4>
                        </TabPanel>
                        <TabPanel>
                            <div className={'info-well'} style={{ fontSize: 26 }}>
                                Margin Market fee rate will be determined upon Margin Trade activation.
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <table className={'table-striped scrollable-bf'}>
                                <thead>
                                    <tr style={{ height: 50 }}>
                                        <th className={'table-fee-th stickyHeader width10Percent'}>Asset</th>
                                        <th className={'table-fee-th stickyHeader'}>Withdraw Fee</th>
                                        <th className={'table-fee-th stickyHeader'}>Min. Withdraw</th>
                                        {/* <th className={'table-fee-th stickyHeader'}>Max. Withdraw</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets && Object.entries(assets).map(asset => {
                                        console.log(asset)
                                        return <tr style={{ height: 65 }}>
                                            <td className={'table-fee-td width10Percent'}>{asset[1].name}</td>
                                            <td className={'table-fee-td'}>{parseFloat(asset[1]['withdraw_fee']).toFixed(8)} {asset[0]}</td>
                                            <td className={'table-fee-td'}>{parseFloat(asset[1]['min_withdraw']).toFixed(8)} {asset[0]}</td>
                                            {/* <td className={'table-fee-td'}>{parseFloat(asset[1]['max_withdraw']).toFixed(8)} {asset[0]}</td> */}
                                        </tr>
                                    })}
                                </tbody>
                            </table>
                            <h4>*TBD - To Be Determined upon BTFX Token Release</h4>
                        </TabPanel>
                    </Tabs>
                </div>
            </>
        </StaticPagesLayout >
    );
}