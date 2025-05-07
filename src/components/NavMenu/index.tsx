import '../../css/navmenu.css';

import { BFGradientButton, BFGradientButtonType } from '../html/BFGradientButton';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import { ActionType } from '../../store/actionTypes';
import { ApiTickers } from '../../api-wrapper';
import BitflexLogo from '../../images/bitflex-logo.svg';
import menu_icon from '../../images/menu-svgrepo-com.svg';
import Colors from '../../Colors';
import { FaMobileAlt } from 'react-icons/fa';
import { ImExit } from 'react-icons/im'
import { ListingRequestModal } from './ListingRequestModal';
import { slide as Menu } from 'react-burger-menu'
import { NavSideMenu } from '../NavSideMenu';
import { SetMarketType } from '../../store/actions';
import { Store } from '../../store';
import { formatDigits } from '../terminal/MarketTabs';
import { isMobile } from 'react-device-detect';
import qr_app_image from '../../images/qr-code.png';
import useLocalStorage from '../../hooks/useLocalStorage';
import { useSignalR } from '../../hooks/useSignalR';
import { useTranslation } from 'react-i18next';
import useUserState from '../../hooks/useUserState';
import { IN } from 'country-flag-icons/react/3x2'

import india_flag from '../../images/india_flag.png';

export function NavMenu({
    activeIndexIn = -1,
    tickers,
    isSmall = false
}: {
    activeIndexIn?: number,
    tickers?: Array<ApiTickers>,
    isSmall?: boolean
}) {
    const {
        state: {

            globalPairName

        },
        dispatch
    } = React.useContext(Store);

    const [isListingRequestModalOpen, setisListingRequestModalOpen] = useState(false);

    let history = useNavigate();
    const { isSignedIn } = useUserState();
    var isTerminal = window.location.pathname.startsWith('/terminal')


    const [activeIndex, setactiveIndex] = useState(activeIndexIn);

    const [marketType, setMarketType] = useLocalStorage('marketType', 'Spot')


    // const [price, setprice] = useState(0);
    const [usdPrice] = useState(0);
    // const [change, setchange] = useState(0);
    // const [highPrice, sethighPrice] = useState(0);
    // const [lowPrice, setlowPrice] = useState(0);
    // const [, setpairVolume] = useState(0);
    // const [volume, setvolume] = useState(0);


    const [prevPrice, setprevPrice] = useState(0);
    const { setSignOut } = useUserState();
    const { t } = useTranslation();
    const [isGetAppVisible, setisGetAppVisible] = useState(false);
    const { OnTicker } = useSignalR();

    const [currentTicker, setcurrentTicker] = useState<ApiTickers>();

    function getColorChange(change) {
        if (Number(change) === 0) return '#bdbdbd';
        return change > 0 ? 'rgb(30, 233, 149)' : 'rgb(248, 73, 96)';
    }

    function getColor(change) {
        if (Number(change) === prevPrice) return 'white';

        var returnColor = prevPrice > change ? 'rgb(30, 233, 149)' : 'rgb(248, 73, 96)';
        // setprevPrice(change)
        return returnColor;
    }


    function Grow() {
        document.getElementById('price_grower')?.classList.add("grow");
        document.getElementById('price_grower')!.style!.color = "rgb(30, 233, 149)";
        setTimeout(() => {
            document.getElementById('price_grower')?.classList.add("show");
            setTimeout(() => {
                document.getElementById('price_grower')?.classList.remove("grow");
                document.getElementById('price_grower')?.classList.remove("show");
            }, 150)
        }, 10)
    }

    function Reduce() {
        document.getElementById('price_grower')?.classList.add("reduce");
        document.getElementById('price_grower')!.style!.color = "rgb(248, 73, 96)";
        setTimeout(() => {
            document.getElementById('price_grower')?.classList.add("show");
            setTimeout(() => {
                document.getElementById('price_grower')?.classList.remove("reduce");
                document.getElementById('price_grower')?.classList.remove("show");
            }, 200)
        }, 10)
    }

    useEffect(() => {
        var ticker = tickers?.find(x => x.pair === globalPairName);
        setcurrentTicker(ticker)
        console.log("globalPairName -<>", globalPairName)

        dispatch({ type: ActionType.SET_lastPrice, payload: ticker?.price });

    }, [dispatch, globalPairName, tickers]);

    useEffect(() => {

        OnTicker((pair, price, quote, change) => {
            var tickersProxy = tickers as Array<ApiTickers>

            var itemIndex = tickersProxy.findIndex(item => item.pair === pair);
            if (!tickersProxy[itemIndex]) return;
            var oldPrice = tickersProxy[itemIndex].price;

            // tickersProxy[itemIndex].price = price;
            // tickersProxy[itemIndex].change = change;
            // tickersProxy[itemIndex].usdPrice = 0;

            // var tickerParsed = tickersProxy[itemIndex]! as ApiTickers;

            if (oldPrice) {
                if (oldPrice > price) {
                    Reduce()
                }

                if (price > oldPrice) {
                    Grow()
                }
            }

            // setTimeout(() => {
            //     setprice(tickerParsed.price!)
            //     // setusdPrice(tickerParsed.usdPrice ? tickerParsed.usdPrice : 0)
            //     setchange(tickerParsed.change!)
            //     setlowPrice(tickerParsed.low!)
            //     sethighPrice(tickerParsed.high!)
            //     setvolume(tickerParsed.volume!)
            //     setpairVolume(tickerParsed.pairVolume!)
            // }, 250)

        });

    }, []);

    useEffect(() => {
        if (!dispatch) return;
        SetMarketType(marketType, dispatch)
    }, [dispatch, marketType]);


    return (
        <>
            <ListingRequestModal isActive={isListingRequestModalOpen} onClose={() => setisListingRequestModalOpen(false)} />
            <header className="bf-header">
                <Link className="" style={{ cursor: 'pointer', paddingBottom: 0, marginLeft: 7, marginRight: 16, position: 'relative' }} to={'/terminal/' + globalPairName}>
                    <img style={{ width: 170, height: 49.14 }} src={BitflexLogo} alt="" />
                    {window.location.hostname === 'bcflex.in' && <div style={{ position: 'absolute', top: 8, right: -11 }}>{<img style={{ width: 22 }} src={india_flag} alt="" />}</div>}
                </Link>

                {isMobile && <div className={"font-roboto menuitem"} style={{ position: 'relative' }} onClick={() => {
                    history('/p2p')
                }}>P2P
                    <div style={{ position: 'absolute', top: -7, right: -16, fontSize: 8, height: 9, background: Colors.bitFlexGoldenColor, padding: 1, paddingLeft: 3, paddingRight: 3, borderRadius: 3 }}>NEW</div>
                </div>}

                {!isSmall &&
                    <>
                        {!isMobile &&
                            <>
                                <div className={activeIndex === 0 ? "font-roboto menuitem selected bf-header-content-hide" : "font-roboto menuitem bf-header-content-hide"} onClick={() => {
                                    setactiveIndex(0)
                                    history('/terminal/' + globalPairName)
                                }}>Trade</div>

                                {/* <div className={activeIndex === 1 ? "font-roboto menuitem selected bf-header-content-hide" : "font-roboto menuitem bf-header-content-hide"} onClick={() => {
                                    setisListingRequestModalOpen(true)
                                    setactiveIndex(1)
                                }}>Listing Request</div> */}

                                <div className={activeIndex === 2 ? "font-roboto menuitem selected bf-header-content-hide" : "font-roboto menuitem bf-header-content-hide"} style={{ position: 'relative' }} onClick={() => {
                                    setactiveIndex(2)
                                    history('/nft')
                                }}>NFT
                                    <div style={{ position: 'absolute', top: -7, right: -16, fontSize: 8, height: 9, background: Colors.bitFlexGoldenColor, padding: 1, paddingLeft: 3, paddingRight: 3, borderRadius: 3 }}>DEV</div>
                                </div>

                                <div className={activeIndex === 2 ? "font-roboto menuitem selected bf-header-content-hide" : "font-roboto menuitem bf-header-content-hide"} style={{ position: 'relative' }} onClick={() => {
                                    setactiveIndex(3)
                                    history('/launchpad')
                                }}>Launchpad
                                    <div style={{ position: 'absolute', top: -7, right: -16, fontSize: 8, height: 9, background: Colors.bitFlexGoldenColor, padding: 1, paddingLeft: 3, paddingRight: 3, borderRadius: 3 }}>DEV</div>
                                </div>
                                {/* 
                                <div className={activeIndex === 2 ? "font-roboto menuitem selected bf-header-content-hide" : "font-roboto menuitem bf-header-content-hide"} style={{ position: 'relative' }} onClick={() => {
                                    setactiveIndex(100)
                                    history('/launchpad')
                                }}>LaunchPad
                                    <div style={{ position: 'absolute', top: -7, right: -16, fontSize: 8, height: 9, background: Colors.bitFlexGoldenColor, padding: 1, paddingLeft: 3, paddingRight: 3, borderRadius: 3 }}>BETA</div>
                                </div> */}

                                <div className={activeIndex === 3 ? "font-roboto menuitem selected bf-header-content-hide" : "font-roboto menuitem bf-header-content-hide"} style={{ position: 'relative' }} onClick={() => {
                                    setactiveIndex(3)
                                    history('/p2p')
                                }}>P2P
                                    <div style={{ position: 'absolute', top: -7, right: -16, fontSize: 8, height: 9, background: Colors.bitFlexGoldenColor, padding: 1, paddingLeft: 3, paddingRight: 3, borderRadius: 3 }}>DEV</div>
                                </div>
                            </>
                        }
                        {isTerminal &&
                            <>
                                {!isMobile &&
                                    <div className="menu-market-type-selector bf-header-content-hide">
                                        <div onClick={() => setMarketType("Spot")} className={marketType === "Spot" ? "menu-market-type-selector-spot selected-navmenu-spot" : "menu-market-type-selector-spot"}>Spot</div>
                                        <div onClick={() => setMarketType("Margin")} className={marketType === "Margin" ? "menu-market-type-selector-margin selected-navmenu-margin" : "menu-market-type-selector-margin"}>Margin</div>
                                    </div>
                                }
                                <div className="navmenu-stat-box bf-header-content-hide">
                                    <div className="navmenu-stat-box-item" style={{ width: 70 }}>
                                        <div id="price_grower" className='font-roboto-condensed bf-price-in-header' style={{ fontSize: 13, color: getColor(currentTicker?.price!), position: 'relative' }}>{currentTicker && formatDigits(currentTicker?.price!)}</div>
                                        <div className='font-roboto-condensed' style={{ color: 'white', lineHeight: '18px', fontSize: 15 }}>${usdPrice.toFixed(2)}</div>
                                    </div>

                                    <div className="navmenu-stat-box-item" style={{ paddingLeft: 25, lineHeight: '28px', height: '42px' }}>
                                        <div className='navbar-stat-header'>24h Change</div>
                                        <div className='font-roboto-condensed' style={{ color: getColorChange(currentTicker?.change!), fontSize: 13, letterSpacing: 1 }}>{currentTicker?.change!.toFixed(2)}%</div>
                                    </div>

                                    <div className="navmenu-stat-box-item small-laptop-hidden" style={{ paddingLeft: 15, width: 80, lineHeight: '28px', height: '42px' }}>
                                        <div className='navbar-stat-header'>24h High</div>
                                        <div className='font-roboto-condensed' style={{ color: 'white', fontSize: 13 }}>{formatDigits(currentTicker?.high!)}</div>
                                    </div>

                                    <div onClick={() => Grow()} className="navmenu-stat-box-item small-laptop-hidden" style={{ paddingLeft: 15, width: 80, lineHeight: '28px', height: '42px' }}>
                                        <div className='navbar-stat-header'>24h Low</div>
                                        <div className='font-roboto-condensed' style={{ color: 'white', fontSize: 13 }}>{formatDigits(currentTicker?.low!)}</div>
                                    </div>

                                    <div onClick={() => Reduce()} className="navmenu-stat-box-item small-laptop-hidden" style={{ paddingLeft: 15, width: 130, lineHeight: '28px', height: '42px' }}>
                                        <div className='navbar-stat-header'>24h Volume</div>
                                        <div className='font-roboto-condensed' style={{ color: 'white', fontSize: 13 }}>{formatDigits(currentTicker?.volume!, (globalPairName as string).split('_')[1])}</div>
                                    </div>
                                </div>
                            </>
                        }
                    </>
                }


                <div className="topbar-actions" style={{ display: 'flex' }}>
                    {isSignedIn ?
                        <>
                            {!isMobile &&
                                <>
                                    <div className={'vertical-center'}>{localStorage.getItem('obfuscatedEmail')}</div>
                                    {!isSmall &&
                                        <div
                                            className={'vertical-center font-roboto'}
                                            onMouseLeave={() => setisGetAppVisible(false)}
                                            onMouseOver={() => setisGetAppVisible(true)}
                                            style={{ color: 'white', fontSize: 18, marginRight: 0, marginLeft: 25, position: 'relative', zIndex: 4 }}>
                                            <span onClick={() => { setisGetAppVisible(true) }}>GET APP</span>
                                            <FaMobileAlt className="icon-home" style={{ color: Colors.bitFlexGoldenColor }} onClick={() => { setisGetAppVisible(true) }} />

                                            {isGetAppVisible &&
                                                <div className={'getApp'}>
                                                    <img src={qr_app_image} style={{ width: 240, margin: -10, marginBottom: 10 }} alt={'QR to download app'} />
                                                </div>
                                            }
                                        </div>
                                    }

                                    <button className="btn bf-blue" style={{ width: 120, }} onClick={() => isTerminal ? history('/wallet/assets') : history('/terminal/' + globalPairName)}>
                                        {isTerminal ? 'DASHBOARD' : '< ' + globalPairName}
                                    </button>
                                    <div className={'vertical-center'} style={{ color: 'white', fontSize: 25, marginRight: 20, cursor: 'pointer' }}>
                                        <ImExit className="icon-home" onClick={setSignOut} />
                                    </div>
                                </>
                            }
                        </>
                        :
                        !isMobile
                            ? <>
                                <BFGradientButton isLinkButton to={'/signin'} text={t('Login')} buttonType={BFGradientButtonType.Shadow} marginRight={10} />
                                <BFGradientButton isLinkButton to={'/signup'} text={t('Register')} marginRight={10} />
                            </>
                            : <>

                            </>
                    }
                </div>
                {isMobile &&
                    <Menu customBurgerIcon={<img src={menu_icon} alt="" />} right styles={{ bmMenuWrap: { width: 250, background: 'transparent', borderRadius: 4, top: 0 } }}>
                        {isSignedIn
                            ? <NavSideMenu />
                            : <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                                <p>Welcome to BCFLEX</p>
                                <div style={{ margin: 5, padding: 5 }}>
                                    <BFGradientButton isLinkButton to={'/signin'} text={t('Login')} buttonType={BFGradientButtonType.Shadow} width={'100%'} />
                                    <div style={{ margin: 18 }}></div>
                                    <BFGradientButton isLinkButton to={'/signup'} text={t('Register')} width={'100%'} />


                                </div>


                            </div>
                        }
                    </Menu>
                }
            </header>
        </>
    );
}