import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import Colors from "../../Colors";
import { StylesDictionary } from "../dashboard/settings/ApiKeys";
import { BFGradientButton, BFGradientButtonType } from "../html/BFGradientButton";
import { StaticPagesLayout } from "../staticpages/StaticPagesLayout";
import { FaCheck } from "react-icons/fa";
import { BFInput, BFInputType } from "../html/BFInput";
import { BitflexOpenApi } from "../../_helpers/BitflexOpenApi";
import { BFNotification, BFNotificationType, IBFNotification } from "../html/BFNotification";
import { useNavigate } from "react-router-dom";

import Dropdown from 'react-dropdown';
import { Store } from "../../store";
import React from "react";
import { GetBalanceRequestModel } from "../../api-wrapper";
import { DispacherBaseTypes } from "../terminal";


export default function P2PCreate() {


    const [isLoading, setisLoading] = useState(false);
    const [agreed, setagreed] = useState(false);
    const [username, setusername] = useState<string>();

    const [loadingButton, setloadingButton] = useState(false);
    const [alreadyApplied, setalreadyApplied] = useState(false);
    const BFNotifictionRef = useRef<IBFNotification>(null);

    const { t } = useTranslation();
    const navigate = useNavigate();

    const timeIntervals = [
        "15", "30", "45", "60"
    ];


    const orderType = [
        'BUY', 'SELL'
    ];

    const baseCurrency = [
        'INR'
    ];

    const quoteCurrency = [
        'YOC'
    ];

    const [baseCurrencyValue, setbaseCurrencyValue] = useState<string>(baseCurrency[0]);
    const [orderTypeValue, setorderTypeValue] = useState<string>(orderType[0]);
    const [timeIntervalValue, settimeIntervalValue] = useState<string>(timeIntervals[1]);
    const [quoteCurrencyValue, setquoteCurrencyValue] = useState<string>(quoteCurrency[0]);

    function SubmitForm() {

    }

    useEffect(() => {
        BitflexOpenApi.UserApi.apiVversionUserBalanceslistGet("1.0",)
            .then(response =>
                dispatch_balances({
                    type: DispacherBaseTypes.INIT_LOAD,
                    value: response.data.balances
                }))
    }, [])

    const [balances, dispatch_balances] = useReducer((balances: Array<GetBalanceRequestModel>, { type, value }): Array<GetBalanceRequestModel> => {
        const index = balances.findIndex((item) => item.currency === value.currency);
        switch (type) {
            case DispacherBaseTypes.INIT_LOAD: {
                return value;
            }
            case DispacherBaseTypes.ADD_OR_UPDATE:
                if (index === -1) return [...balances, value];
                else {
                    const newBalances = [...balances];
                    newBalances[index] = value;
                    return newBalances;
                }
            default: return balances;
        }
    }, []);

    return (
        <StaticPagesLayout
            isDashboard={true}
            isLoading={isLoading}>
            <>
                <div className={'bf-dash-header'} style={{ position: 'relative' }}>
                    <h1 className={'bf-dashboard-title'}><Trans>Create P2P Advertisment</Trans></h1>
                </div>
                <div style={{ height: '100%' }}>
                    <div style={{ padding: isMobile ? 15 : '2vw', paddingTop: 10 }}>
                        {/* <h3 style={{ marginTop: 25, marginBottom: 10, color: 'red' }}>Order Information</h3>
                        <div style={{ border: '1px dashed ' + Colors.bitFlexborderColor }}></div> */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ width: '100%' }}>

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>I want to</h4>
                                    <Dropdown options={orderType}
                                        menuClassName='order-market-dropdown-menu'
                                        arrowClassName='p2p-dropdown-arrow'

                                        controlClassName='p2p-dropdown-control'
                                        onChange={(e) => { setorderTypeValue(e.value) }}
                                        value={orderTypeValue} placeholder="BUY"
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>Crypto to {orderTypeValue}</h4>
                                    <Dropdown options={quoteCurrency}
                                        menuClassName='order-market-dropdown-menu'
                                        arrowClassName='p2p-dropdown-arrow'

                                        controlClassName='p2p-dropdown-control'
                                        onChange={(e) => { setquoteCurrencyValue(e.value) }}
                                        value={quoteCurrencyValue} placeholder="USDT"

                                    />
                                </div>

                                {orderTypeValue === "SELL" &&
                                    <>
                                        <div style={{ borderWidth: 1, borderStyle: 'dashed', borderRadius: 5, borderColor: Colors.bitFlexGoldenColor, padding: 10, marginTop: 0 }}>
                                            <Trans>Your {quoteCurrencyValue} balance</Trans>: {balances && balances.find(_ => _.currency === "USDT")?.available}
                                        </div>
                                    </>
                                }

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>FIAT to {orderTypeValue === "BUY" ? "SEND" : "RECEIVE"}</h4>
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

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>Unit Price</h4>
                                    <div>
                                        <BFInput
                                            type={BFInputType.Text}
                                            onValue={(e: React.SetStateAction<string | undefined>) => {
                                                // setcity(prev => (e?.toString()));
                                            }}

                                            width={110}
                                            leftsideSymbol={baseCurrencyValue}

                                        />
                                    </div>
                                </div>


                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>Total Quantity</h4>
                                    <div>
                                        <BFInput
                                            type={BFInputType.Text}
                                            onValue={(e: React.SetStateAction<string | undefined>) => {
                                                // setcity(prev => (e?.toString()));
                                            }}

                                            width={110}
                                            leftsideSymbol={quoteCurrencyValue}

                                        />
                                    </div>
                                </div>


                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>Payment Window(min)</h4>
                                    <Dropdown options={timeIntervals}
                                        menuClassName='order-market-dropdown-menu'
                                        arrowClassName='p2p-dropdown-arrow'

                                        controlClassName='p2p-dropdown-control'
                                        onChange={(e) => { settimeIntervalValue(e.value) }}
                                        value={timeIntervalValue} placeholder="15 min"
                                    />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>Minimum</h4>
                                    <div>
                                        <BFInput
                                            type={BFInputType.Text}
                                            onValue={(e: React.SetStateAction<string | undefined>) => {
                                                // setcity(prev => (e?.toString()));
                                            }}

                                            width={110}
                                            leftsideSymbol={quoteCurrencyValue}

                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>
                                    <h4>Maximum</h4>
                                    <div>
                                        <BFInput
                                            type={BFInputType.Text}
                                            onValue={(e: React.SetStateAction<string | undefined>) => {
                                                // setcity(prev => (e?.toString()));
                                            }}

                                            width={110}
                                            leftsideSymbol={quoteCurrencyValue}

                                        />
                                    </div>
                                </div>



                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignContent: 'center', alignItems: 'center', textAlign: 'center', }}>

                                </div>
                            </div>
                        </div>
                        <div style={{ margin: 20 }}></div>
                        <BFGradientButton buttonType={BFGradientButtonType.GreenBorder}
                            isDisabled={
                                false
                            }
                            isLoading={isLoading}
                            width={'100%'} text='Save & Continue' onPress={SubmitForm}></BFGradientButton>
                    </div>
                </div>
            </>

        </StaticPagesLayout>
    );
}

