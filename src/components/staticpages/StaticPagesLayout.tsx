import '../../css/staticpages.css'

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';

import { ActionType } from '../../store/actionTypes';
import Colors from '../../Colors';
import Countdown from 'react-countdown';
import { IState } from '../../store/types';
import { LoadingComponent } from '../LoadingComponent';
import { NavLink } from 'react-router-dom';
import { NavMenu } from '../NavMenu';
import { NavSideMenu } from '../NavSideMenu';
import React, { } from 'react';
import { Store } from '../../store';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

export enum ArticleType {
    Fees,
    TermsConditions,
    Affiliate,
    API,
    Privacy,
    Legal
}

export function StaticPagesLayout({
    children,
    article,
    isDashboard = false,
    isLoading = false,
    header,
    overlayElement,
    isOverlayActive = false,
    pageIndex,
    isFullScreen = false,
    bannerElement
}: {
    children: React.ReactNode,
    article?: ArticleType,
    isDashboard?: boolean,
    isLoading?: boolean,
    header?: string,
    overlayElement?: JSX.Element,
    isOverlayActive?: boolean
    pageIndex?: number,
    isFullScreen?: boolean,
    bannerElement?: JSX.Element
}) {

    const {
        state: { },
        dispatch
    } = React.useContext(Store);

    var context = React.useContext(Store);
    const stateData = context.state as IState;

    const { t } = useTranslation();

    const renderer = ({ minutes, seconds, completed }) => {
        if (completed)
            dispatch({ type: ActionType.FLUSH_ACCOUNT_SETTINGS });
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return <span>{minutes}:{seconds}</span>;
    };

    return (
        <>
            <div style={{ filter: stateData.isBlur ? 'blur(4px)' : '' }}>
                {stateData.isBlur && <div style={{ background: 'black', width: '100vw', height: '100vh', zIndex: 5, opacity: 0.5, position: 'relative' }}></div>}
                <NavMenu activeIndexIn={pageIndex} />

                {bannerElement && bannerElement}
                <div className="bf-dashboard-container" //style={{width:'100%', maxWidth:'100%'}}
                >
                    <div className="bf-dashboard-content" style={{ position: 'relative', overflow: 'hidden', }}>
                        {!isFullScreen && <div className="bf-dashboard-sidemenu-container" style={{ position: 'absolute', display: 'flex', flexDirection: 'column', height: '100%', zIndex: 10 }}>
                            {isDashboard ?
                                <NavSideMenu />
                                :
                                <>
                                    <h4 className={'bf-static-header'} style={{ padding: 5 }}>Articles in this section</h4>
                                    <NavLink to={'/fees'} className={'bf-static-menuelem ' + (article === ArticleType.Fees && 'active')}>Fees and Rebates</NavLink>
                                    <NavLink to={'/terms'} className={'bf-static-menuelem ' + (article === ArticleType.TermsConditions && 'active')}>Terms and Conditions</NavLink>
                                    <NavLink to={'/privacy'} className={'bf-static-menuelem ' + (article === ArticleType.TermsConditions && 'active')}>Privacy Policy</NavLink>
                                    <NavLink to={'/affiliate'} className={'bf-static-menuelem ' + (article === ArticleType.Affiliate && 'active')}>Affiliate Program</NavLink>
                                    <NavLink to={'/api'} className={'bf-static-menuelem ' + (article === ArticleType.API && 'active')}>API Description</NavLink>
                                    <NavLink to={'/legal'} className={'bf-static-menuelem ' + (article === ArticleType.Legal && 'active')}>Legal</NavLink>
                                </>
                            }
                        </div>}
                        <div className={isMobile ? 'scrollable-bf' : ''} style={{ width: isMobile || isFullScreen ? '100%' : 'calc(100% - 240px)', paddingLeft: isMobile || isFullScreen ? 0 : 240, display: 'flex', flexDirection: 'column', position: 'relative', height: isMobile ? '90vh' : 'unset' }}>
                            {isOverlayActive &&
                                <div className="blocklogin-overlay">
                                    <div className="blocklogin-content">
                                        {overlayElement}
                                    </div>
                                </div>
                            }
                            <div className={isOverlayActive ? 'blocklogin-item' : ''} style={{}}>
                                <>
                                    {header
                                        && <div className={'bf-dash-header'}>
                                            <h1 className={'bf-dashboard-title'}>{header}</h1>
                                        </div>
                                    }
                                    {console.log("isLoading", isLoading)}

                                    {isLoading
                                        ? <div style={{ position: 'absolute', width: '100%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: (isOverlayActive || !isLoading) ? 'none' : 'unset' }}><LoadingComponent /></div>
                                        : <>{children}</>
                                    }
                                </>
                            </div>
                            {(!isOverlayActive && stateData.settings?.expiration) &&
                                <div
                                    className={'toTheBottom'}
                                    style={{ backgroundColor: Colors.BITFLEXBorderTerminal, width: isMobile ? '95%' : '98%', display: 'flex', padding: 15, alignContent: 'center', justifyContent: 'space-around', flexWrap: 'wrap' }} >
                                    <div style={{ lineHeight: '42px' }}>
                                        Settings will be locked in: <Countdown
                                            date={stateData.settings?.expiration * 1000}
                                            renderer={renderer}
                                        />
                                    </div>
                                    <div>
                                        <BFGradientButton
                                            onPress={() => {
                                                dispatch({ type: ActionType.FLUSH_ACCOUNT_SETTINGS });
                                            }}
                                            text={t('Lock now')}
                                            buttonType={BFGradientButtonType.GoldenBorder} />
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}