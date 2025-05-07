import 'react-dropdown/style.css';

import { useEffect, useState } from "react";
import { Layout } from "./layout";
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { Trans } from "react-i18next";
import { TradeRow } from "./components/index/TradeRow";
import { isMobile } from "react-device-detect";
import Colors from "../../Colors";
import { StylesDictionary } from "../dashboard/settings/ApiKeys";
import { ApiOpenOffer, OfferStatus, TradeDirection } from "../../api-wrapper";
import { BFGradientButton, BFGradientButtonType } from "../html/BFGradientButton";

import Dropdown from 'react-dropdown';

export default function P2p() {
    const [tabSelectedIndex, settabSelectedIndex] = useState(0);

    const [openTradesList, setopenTradesList] = useState<ApiOpenOffer[]>();

    const [baseCurrencyValue, setbaseCurrencyValue] = useState<string>("INR");
    const [quoteCurrencyValue, setquoteCurrencyValue] = useState<string>("USDT");
    const [orderTypeValue, setorderTypeValue] = useState<string>();

    const orderType = [
        'BUY', 'SELL'
    ];

    const baseCurrency = [
        'INR'
    ];

    const quoteCurrency = [
        'USDT'
    ];

    useEffect(() => {
        const apiOffer: ApiOpenOffer[] = [
        ];

        setopenTradesList(apiOffer)
    }, []);

    return <Layout>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 10, alignContent: 'center', alignItems: 'center', textAlign: 'center', flexWrap: 'wrap' }}>
                <h2>I want to:</h2>
                <div style={{ marginLeft: 15 }}>
                    <Dropdown options={orderType}
                        menuClassName='order-market-dropdown-menu'
                        arrowClassName='p2p-dropdown-arrow'
                        // placeholderClassName='order-market-dropdown-placeholder-2'
                        controlClassName='p2p-dropdown-control'
                        onChange={(e) => { setorderTypeValue(e.value) }}
                        value={orderTypeValue} placeholder="BUY"
                    // className="dropdown-fix"
                    />
                </div>
                <div style={{ marginLeft: 15 }}>
                    <Dropdown options={baseCurrency}
                        menuClassName='order-market-dropdown-menu'
                        arrowClassName='p2p-dropdown-arrow'
                        // placeholderClassName='order-market-dropdown-placeholder-2'
                        controlClassName='p2p-dropdown-control'
                        onChange={(e) => { setbaseCurrencyValue(e.value) }}
                        value={baseCurrencyValue} placeholder="INR"
                    // className="dropdown-fix"
                    />
                </div>
                <h2 style={{ marginLeft: 15 }}>for</h2>
                <div style={{ marginLeft: 15 }}>
                    <Dropdown options={quoteCurrency}
                        menuClassName='order-market-dropdown-menu'
                        arrowClassName='p2p-dropdown-arrow'
                        // placeholderClassName='order-market-dropdown-placeholder-2'
                        controlClassName='p2p-dropdown-control'
                        onChange={(e) => { setquoteCurrencyValue(e.value) }}
                        value={quoteCurrencyValue} placeholder="USDT"
                    // className="dropdown-fix"
                    />
                </div>
                <div style={{ width: '100%' }}>
                    <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} text='Search' width={'100%'} />
                </div>


            </div>
            <div style={{ backgroundColor: Colors.TextInput, textAlign: 'center', padding: 10 }}>
                <h4 style={{ margin: 10, marginTop: 0 }}>Or make your offer</h4>
                <div style={{ width: '100%' }}>
                    <BFGradientButton buttonType={BFGradientButtonType.GreenBorder} text='Create Advertisment' width={'90%'} />
                </div>

            </div>

            <Tabs
                className='tabbable-custom width100Perc'
                selectedIndex={tabSelectedIndex}
                onSelect={settabSelectedIndex}
                style={{ whiteSpace: 'nowrap' }}>
                <TabList>
                    <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '33.333%', fontSize: isMobile ? 14 : 20 }}><Trans>Open Trades</Trans></Tab>
                    <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '33.333%', fontSize: isMobile ? 14 : 20 }}><Trans>My Open Trades</Trans></Tab>
                    <Tab className='react-tabs__tab unactive-tab' selectedClassName='active-tab' style={{ width: '33.334%', fontSize: isMobile ? 14 : 20 }}><Trans>Finished Trades</Trans></Tab>
                </TabList>
                <TabPanel>

                    <div style={{ maxHeight: 400, overflow: 'scroll' }}>
                        <h2 style={{ paddingLeft: 25 }}>Buy INR with USD</h2>
                        <table className="table table-striped scrollable-bf">
                            <thead>
                                <tr>
                                    <th className='thFix stickyHeader'><Trans>Seller</Trans></th>
                                    <th className='thFix stickyHeader'><Trans>Method & Terms</Trans></th>
                                    <th className='thFix stickyHeader'><Trans>Price</Trans></th>
                                    <th className='thFix stickyHeader'><Trans>Quantity</Trans></th>

                                    <th className='thFix stickyHeader'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {openTradesList?.filter(_ => _.direction === TradeDirection.Buy).map(trade => { return <TradeRow row={trade} /> })}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ maxHeight: 400, overflow: 'scroll' }}>
                        <h2 style={{ paddingLeft: 25 }}>Sell INR for USD</h2>
                        <table className="table table-striped scrollable-bf">
                            <thead>
                                <tr>
                                    <th className='thFix stickyHeader'><Trans>Seller</Trans></th>
                                    <th className='thFix stickyHeader'><Trans>Method & Terms</Trans></th>
                                    <th className='thFix stickyHeader'><Trans>Price</Trans></th>
                                    <th className='thFix stickyHeader'><Trans>Quantity</Trans></th>

                                    <th className='thFix stickyHeader'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {openTradesList?.filter(_ => _.direction === TradeDirection.Sell).map(trade => { return <TradeRow row={trade} /> })}
                            </tbody>
                        </table>
                    </div>

                </TabPanel>

                <TabPanel>
                </TabPanel>

                <TabPanel>
                </TabPanel>
            </Tabs>
        </div>

    </Layout>
}

const styles: StylesDictionary = {
    emptyList: {
        padding: 40,
        width: isMobile ? 'unset' : '40%', backgroundColor: Colors.bitFlexBackground, borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto', marginTop: '10%',
        textAlign: 'center',
    }
}