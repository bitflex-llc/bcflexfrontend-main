import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { BFInput, BFInputType } from "../html/BFInput"
import { BFNotification, BFNotificationType, IBFNotification } from "../html/BFNotification";
import React, { useEffect, useRef, useState } from "react"
import StepWizard, { StepWizardChildProps } from "react-step-wizard";
import { Trans, useTranslation } from 'react-i18next';

import { BFModalWindow } from '../html/BFModalWindow';
import { BitflexOpenApi } from '../../_helpers/BitflexOpenApi';
import { SetBlur } from "../../store/actions";
import { Store } from "../../store";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function ListingRequestModal({
    isActive,
    onClose
}: {
    isActive: boolean,
    onClose
}) {

    const {
        dispatch
    } = React.useContext(Store);

    const { executeRecaptcha } = useGoogleReCaptcha();

    const [applicationFormModalActive, setapplicationFormModalActive] = useState(false);
    const [recaptchaToken, setrecaptchaToken] = useState<string>();
    const [showSuccess, setshowSuccess] = useState(false);
    const [isLoading, setisLoading] = useState(false);

    let BFNotifictionRef = useRef<IBFNotification>(null);

    const { t } = useTranslation();

    useEffect(() => {
        SetBlur(isActive || applicationFormModalActive, dispatch)
    }, [isActive, applicationFormModalActive, dispatch]);

    useEffect(() => {
        if (isActive)
            if (executeRecaptcha)
                executeRecaptcha("login_page").then(token => {
                    setrecaptchaToken(token)
                })
    }, [executeRecaptcha, isActive]);

    const FirstWizardStep = (SW: Partial<StepWizardChildProps>): JSX.Element => {
        return <>
            <div className={'row bf-row'}>
                <p style={{ fontSize: 21, fontWeight: 500, marginTop: -10, marginBottom: 10 }}><span>Listing Policy:</span></p>
                <p><span >&ldquo; BCFLEX Cryptocurrency &amp; Asset Exchange&rdquo;, hereinafter referred to as &ldquo;Exchange&rdquo; requiring from applicants next:</span></p>
                <ol style={{ fontSize: 15 }}>
                    <li ><span >Core Member as an applicant</span></li>
                    <li ><span >Website and Block Explorer</span></li>
                    <li ><span >At least one Social Group (Telegram, Discord, Slack)</span></li>
                    <li ><span >Ann thread on BitcoinTalk forum</span></li>
                    <li ><span >The project has finished ICO state</span></li>
                    <li ><span >Telegram username of CTO (CEO if none)</span></li>
                </ol>
                <div style={{ width: '100%' }}>
                    <div className={"listing-type-div "}>
                        <div className={"listing-type-namecell"}>
                            ERC20 Token
                        </div>
                        <div className={"listing-type-pricecell"}>
                            Installation 500 USD Equivalent in BTC/ETH/USDT<br />
                            Additional 250 USD each Pair<sup>[1]</sup><br />
                            Application in 1-2 Days
                        </div>
                    </div>

                    <div className={"listing-type-div "}>
                        <div className={"listing-type-namecell"}>
                            Bitcoin-like RPC API
                        </div>
                        <div className={"listing-type-pricecell"}>
                            Installation 1000 USD Equivalent in BTC/ETH/USDT<br />
                            Additional 250 USD each Pair<sup>[1]</sup><br />
                            Application in 1-2 Days
                        </div>
                    </div>

                    <div className={"listing-type-div "}>
                        <div className={"listing-type-namecell"}>
                            Custom Blockchain API
                        </div>
                        <div className={"listing-type-pricecell"}>
                            Installation 2000<sup>[2]</sup> USD Equivalent in BTC/ETH/USDT<br />
                            Additional 250 USD each Pair<sup>[1]</sup><br />
                            Application in 5-7 Days
                        </div>
                    </div>
                </div>
                <div><sup>[1]</sup> One Pair (BTC or ETH) included in the installation price</div>
                <div><sup>[2]</sup> 1000 USD if there complete C# API Wrapper</div>
                <p style={{ fontSize: 21, fontWeight: 500, marginTop: 10, marginBottom: 10 }}><span>Delisting Policy:</span></p>
                <ol style={{ fontSize: 15 }}>
                    <li ><span >Technical issues with blockchain</span></li>
                    <li ><span >Monthly trading volume less than 1000 USD equivalent on all pairs summary</span></li>
                    <li ><span >Multiple SCAM reports</span></li>
                    <li ><span >Legal Issues</span></li>
                </ol>
            </div>
            <div className='createorder_container' style={{ paddingBottom: 10, height: '10%', marginTop: 0, flex: 1.5, maxHeight: 50 }}>
                <button className="btn btn-md hoverbutton sellbutton" style={{ fontSize: 19 }} type="button" onClick={() => {
                    onClose()
                    setapplicationFormModalActive(true)
                }}>
                    <Trans>DECLINE</Trans>
                </button>
                <div className='span_between'></div>
                <button className="btn btn-md hoverbutton buybutton" style={{ fontSize: 19 }} type="button" onClick={SW.nextStep}>
                    <Trans>ACCEPT</Trans>
                </button>
            </div>
        </>
    }


    const SecondWizardStep = (SW: Partial<StepWizardChildProps>): JSX.Element => {


        const [name, setname] = useState<string>();
        const [telegram, setTelegram] = useState<string>();
    
        const [projectName, setProjectName] = useState<string>();
        const [tickerSymbol, setTickerSymbol] = useState<string>();
        const [websiteUrl, setWebsiteUrl] = useState<string>();
        const [bitcoinTalkThreadUrl, setBitcoinTalkThreadUrl] = useState<string>();

        return <>
            <BFNotification ref={BFNotifictionRef} />
            <div className="scrollable-bf" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="static-text-container" style={{  paddingTop: 0, overflowY: 'scroll',  color: 'white', flex: 10 }}>
                    <div style={{ display: !showSuccess ? 'block' : 'none', padding: 5 }}>
                        <fieldset className="scheduler-border">
                            <legend className="scheduler-border">Team Information</legend>
                            <div>
                                <div className={'listing-form-divhalf'}>
                                    <label>Your Name</label>
                                    <BFInput type={BFInputType.Text} setValue={name} onValue={setname} placeholder={'Joseph A. Cooper'} />
                                </div>
                                <div className={'listing-form-divhalf'}>
                                    <label>Telegram Username</label>
                                    <BFInput type={BFInputType.Text} onValue={setTelegram} placeholder={'@bitflex_exchange'} />
                                </div>
                            </div>
                        </fieldset>
                        <fieldset className="scheduler-border">
                            <legend className="scheduler-border">Project Information</legend>
                            <div>
                                <div className={'listing-form-divhalf'}>
                                    <label>Name</label>
                                    <BFInput type={BFInputType.Text} onValue={setProjectName} placeholder={'Bitcoin'} />
                                </div>

                                <div className={'listing-form-divhalf'}>
                                    <label>Ticker (Symbol)</label>
                                    <BFInput type={BFInputType.Text} onValue={setTickerSymbol} placeholder={'BTC'} />
                                </div>
                            </div>
                            <div>
                                <div className={'listing-form-divhalf'}>
                                    <label>Website</label>
                                    <BFInput type={BFInputType.Text} onValue={setWebsiteUrl} placeholder={'https://bitcoin.org'} />
                                </div>
                                <div className={'listing-form-divhalf'}>
                                    <label>BitcoinTalk Ann Thread</label>
                                    <BFInput type={BFInputType.Text} onValue={setBitcoinTalkThreadUrl} placeholder={'https://bitcointalk.org/index.php?topic='} />
                                </div>
                            </div>
                            <div className={"info-well"} style={{ background: 'rgba(16, 22, 26, 0.35)', position: 'relative' }}>
                                <div className={'vert-cent'}>
                                    We will ask you for more information in a personal conversation.
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div style={{ display: showSuccess ? 'block' : 'none', textAlign: 'center' }}>
                        <svg id="successAnimation" className="animated" xmlns="http://www.w3.org/2000/svg" width={180} height={180} viewBox="0 0 70 70">
                            <path id="successAnimationResult" fill="#35CB3Baa" d="M35,60 C21.1928813,60 10,48.8071187 10,35 C10,21.1928813 21.1928813,10 35,10 C48.8071187,10 60,21.1928813 60,35 C60,48.8071187 48.8071187,60 35,60 Z M23.6332378,33.2260427 L22.3667622,34.7739573 L34.1433655,44.40936 L47.776114,27.6305926 L46.223886,26.3694074 L33.8566345,41.59064 L23.6332378,33.2260427 Z" />
                            <circle id="successAnimationCircle" cx={35} cy={35} r={24} stroke="#979797" strokeWidth={2} strokeLinecap="round" fill="transparent" />
                            <polyline id="successAnimationCheck" stroke="#979797" strokeWidth={2} points="23 34 34 43 47 27" fill="transparent" />
                        </svg>
                        <h3 >We will contact you soon via Telegram to complete integration.</h3>

                        <button className="btn btn-md hoverbutton buybutton" style={{ fontSize: 19 }} type="button" onClick={() => {
                            setshowSuccess(false)
                            setapplicationFormModalActive(false)
                            onClose()
                        }}>
                            <Trans>GOT IT</Trans>
                        </button>
                    </div>
                </div>
                <div style={{ paddingLeft: 12, paddingRight: 12, paddingBottom: 10, display: showSuccess ? 'none' : 'unset' }}>
                    <BFGradientButton
                        buttonType={BFGradientButtonType.Action}
                        isLoading={isLoading}
                        text={t('SUBMIT LISTING')}
                        width={'100%'}
                        isDisabled={!name || !telegram || !projectName || !tickerSymbol || !websiteUrl || !bitcoinTalkThreadUrl}
                        onPress={() => {
                            setisLoading(true)
                            BitflexOpenApi.MarketsApi.apiMarketsListingRequestPost(recaptchaToken, {
                                name: name,
                                // telegramUsername: telegram,
                                projectName: projectName,
                                ticker: tickerSymbol,
                                websiteUrl: websiteUrl,
                                bitcoinTalkAnnThreadUrl: bitcoinTalkThreadUrl
                            })
                                .then(response => {
                                    if (response.data.success) {
                                        BFNotifictionRef.current?.Notify(t('Success'), t('Listing Request Submitted'), BFNotificationType.Success);
                                        setshowSuccess(true)
                                    }
                                    else
                                        BFNotifictionRef.current?.Notify(t('Error'), response.data.error!, BFNotificationType.Error);

                                })
                                .finally(() => {
                                    if (executeRecaptcha)
                                        executeRecaptcha("login_page")
                                            .then(token => {
                                                setrecaptchaToken(token)
                                            })
                                            .finally(() => {
                                                setisLoading(false)
                                            })
                                })
                        }} />
                </div>
            </div>
        </>
    }

    return <BFModalWindow isOpen={isActive} title={'Listing Request'} onClose={onClose}>
        <StepWizard>
            <FirstWizardStep />
            <SecondWizardStep />
        </StepWizard>
    </BFModalWindow>
}