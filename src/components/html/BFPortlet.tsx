import { BFGradientButton, BFGradientButtonType } from "./BFGradientButton";
/* eslint-disable jsx-a11y/alt-text */
import { FaAppStoreIos, FaCircle, FaExclamationTriangle, FaGooglePlay } from 'react-icons/fa';
import React, { useState } from "react";
import { Trans, useTranslation } from 'react-i18next';
import { isIOS, isMobile } from 'react-device-detect';

import Colors from "../../Colors";
import { Link } from "react-router-dom";
import { Store } from "../../store";
import appStore from '../../images/Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg'
import flexTechLogo from '../../images/flex_technologies_logo.svg'
import googlePlay from '../../images/get-it-on-google-play-logo-svg-vector.svg'
import loading_png from '../../images/loading.svg'
import logo from '../../images/bitflex-logo.svg';
import qrdownload from '../../images/qr-code.png'
import useUserState from "../../hooks/useUserState";

export const BFPortlet = ({
    title,
    children,
    rightActionComponent,
    secondTitleComponent,
    isLoading = false,
    isError = false,
    isBlockUnauthorized = false,
    noHeader = false,
    renderBlurredAnyway = false,
    isStringUnauthenticated = false,
    isWelcomeOverlay = false,
    isScrollable = false
}: {
    title: string,
    children: React.ReactNode,
    rightActionComponent?: JSX.Element,
    secondTitleComponent?: JSX.Element,
    isLoading?: Boolean,
    isError?: Boolean,
    isBlockUnauthorized?: Boolean,
    noHeader?: Boolean,
    renderBlurredAnyway?: Boolean,
    isStringUnauthenticated?: Boolean,
    isWelcomeOverlay?: Boolean,
    isScrollable?: Boolean
}): JSX.Element => {
    const {
        state: { averageColor }
    } = React.useContext(Store);

    const [isOpen, setisOpen] = useState(true);

    const { isSignedIn } = useUserState();
    const { t } = useTranslation();

    const GetAppMobile = () => {
        return <>
            <div style={{ borderBottom: '1px solid rgb(39, 39, 42)', margin: 10 }}></div>
            <div style={{ textAlign: 'center' }}>
                {/* <p style={{ fontSize: 20 }}><Trans>Get the App:</Trans></p> */}
                <a href={'/getapp'}><img src={isIOS ? appStore : googlePlay} width={'55%'} alt={'get the app'} /></a>
            </div>
        </>
    }

    if (isWelcomeOverlay && !isSignedIn)
        return (
            <div className="portlet light portlet-fit bordered glowing" style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginTop: 25 }}>
                    <p style={{ fontSize: 20 }}><Trans>Welcome to BCFLEX</Trans></p>
                    <img src={logo} width={'60%'} style={{ marginTop: '10%', marginBottom: '10%' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10%' }}>
                    <BFGradientButton isLinkButton to={'/signin'} text={t('I_have_BITFLEX')} width={'85%'} buttonType={BFGradientButtonType.Shadow} />
                    <div style={{ marginTop: '5%' }}></div>
                    <BFGradientButton isLinkButton to={'/signup'} text={t('I_dont_have_BITFLEX')} width={'85%'} />
                </div>

                {isMobile && GetAppMobile()}

                <div style={{textAlign:'center', position: 'absolute', bottom: 5}}>
                    <div>Created By:</div>
                    <img src={flexTechLogo} width={'50%'} alt="flex tech logo" />
                </div>
            </div >
        )
    return (
        <div className="portlet light portlet-fit bordered" style={{ height: '100%', overflowX: 'hidden' }}>
            {(!isSignedIn && isBlockUnauthorized) &&
                <div className="blocklogin-overlay">
                    <div className="blocklogin-content">
                        {
                            isStringUnauthenticated
                                ?
                                <div style={{ marginTop: 50 }}>
                                    <Trans>Please</Trans> <Link to={'/signin'} style={{ color: Colors.bitFlexGoldenColor }}>Login</Link> <Trans>or</Trans> <Link to={'/signup'} style={{ color: Colors.bitFlexGoldenColor }}>Register</Link> first
                                </div>
                                :
                                <>
                                    <BFGradientButton isLinkButton to={'/signin'} text={t('Login')} buttonType={BFGradientButtonType.Shadow} />
                                    <br />
                                    <p style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>OR</p>
                                    <BFGradientButton isLinkButton to={'/signup'} text={t('Register')} />
                                </>
                        }
                    </div>
                </div>
            }
            {!noHeader &&
                <div className="portlet-title draggable" style={{ position: 'sticky', display: 'flex', flexDirection: 'row', }}>
                    <div className="caption">
                        <FaCircle style={{ fontSize: 14, color: averageColor, marginRight: 4 }} />
                        {title}
                    </div>
                    {(!isMobile && rightActionComponent) && rightActionComponent}
                </div>
            }

            {secondTitleComponent && secondTitleComponent}

            <div
                className={((!isSignedIn && isBlockUnauthorized) ? 'portlet-body blocklogin-item ' : 'portlet-body ')}
                style={{
                    height: noHeader ? '100%' : secondTitleComponent ? 'calc(100% - 84px)' : 'calc(100% - 41px)',
                    overflowX: isScrollable ? 'auto' : 'hidden'
                }}
            >
                {isError ? <div className={'info-well warning-well'} style={{ top: '50%', transform: 'translateY(-50%)', padding: 5, margin: '3%', paddingBottom: 15, paddingTop: 15, textAlign: 'center', position: 'absolute', }}>
                    <p style={{ fontWeight: 400, margin: 0, fontSize: 17 }}><FaExclamationTriangle /></p>
                    <p style={{ fontWeight: 400, margin: 0, fontSize: 17, marginBottom: 10 }}><Trans>We're sorry, but we're having some technical difficulties. Please try again later.</Trans></p>
                    <BFGradientButton buttonType={BFGradientButtonType.Action} text="Reload" onPress={() => {

                        window.location.reload()
                    }} />
                </div> :
                    (renderBlurredAnyway && !isSignedIn)
                        ? children
                        : <>
                            <div style={{ display: !isLoading ? 'none' : 'flex', position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', right: 0, left: 0 }}>
                                <img src={loading_png} style={{ width: 300 }} />
                            </div>
                            <div style={{ display: isLoading ? 'none' : 'contents' }}>{children}</div>
                        </>
                }
            </div>
        </div>
    )
}