/* eslint-disable jsx-a11y/alt-text */
import { BFGradientButton, BFGradientButtonType } from './html/BFGradientButton';

import { ArticleType } from './staticpages/StaticPagesLayout';
import { NavLink } from 'react-router-dom';
import affiliate_icon from '../images/affiliate.png'
import api_icon from '../images/api.png'
import coins_icon from '../images/coin.png'
import device_img from '../images/mobblock2.png'
import face_kyc from '../images/facescan2.png'
import history_icon from '../images/history.png'
import { isMobile } from 'react-device-detect';
import margin_orders_icon from '../images/Margin Order(1).png'
import orders_icon from '../images/Spot Order(1).png'
import shield from '../images/shield.svg';
import { useTranslation } from 'react-i18next';
import useUserState from '../hooks/useUserState';

export function NavSideMenu() {

    const getNavLinkClass = (path) => {
        return window.location.pathname === path ? 'active' : '';
    }

    // const isThisActive = (path): CSSProperties => {
    //     return window.location.pathname === path ? { color: 'white' } : { color: '#cf8900' };
    // }
    const { setSignOut } = useUserState();
    const { t } = useTranslation();

    return (

        <div className="page-sidebar" style={{ zIndex: 10 }}>
            {isMobile && <div style={{ margin: 20 }}>{localStorage.getItem('obfuscatedEmail')}</div>}
            <ul className="page-sidebar-menu page-header-fixed bf-dashboard-sidemenu">

                <li className="heading">
                    <h3 className="uppercase">Wallet</h3>
                </li>
                <li className={getNavLinkClass("/wallet/assets")}>
                    <NavLink to='/wallet/assets'>
                        <img src={coins_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>Assets</span>
                    </NavLink>
                </li>
                <li className={getNavLinkClass("/wallet/history")}>
                    <NavLink to='/wallet/history'>
                        <img src={history_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>History</span>
                    </NavLink>
                </li>

                <li className="heading">
                    <h3 className="uppercase">Trading</h3>
                </li>
                <li className={getNavLinkClass("/dashboard/orders")}>
                    <NavLink to='/dashboard/orders' className={({ isActive }) => isActive ? "active" : ""}>
                        <img src={orders_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>Orders</span>
                    </NavLink>
                </li>
                <li className={getNavLinkClass("/dashboard/positions")}>
                    <NavLink to='/dashboard/positions' className={({ isActive }) => isActive ? "active" : ""}>
                        <img src={margin_orders_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>Positions</span>
                    </NavLink>
                </li>
                <li className={getNavLinkClass("/dashboard/tradehistory")}>
                    <NavLink to='/dashboard/tradehistory' className={({ isActive }) => isActive ? "active" : ""}>
                        <img src={history_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>History</span>
                    </NavLink>
                </li>
                <li className="heading">
                    <h3 className="uppercase">Settings</h3>
                </li>
                <li className={getNavLinkClass("/settings/security")}>
                    <NavLink to='/settings/security' className={({ isActive }) => isActive ? "active" : ""}>
                        <img src={shield} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>Security</span>
                    </NavLink>
                </li>

                <li className={getNavLinkClass("/settings/devices")}>
                    <NavLink to='/settings/devices' className={({ isActive }) => isActive ? "active" : ""}>

                        <img src={device_img} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>Devices</span>
                    </NavLink>
                </li>

                <li className={getNavLinkClass("/settings/kyc")}>
                    <NavLink to='/settings/kyc' className={({ isActive }) => isActive ? "active" : ""}>

                        <img src={face_kyc} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>KYC</span>
                    </NavLink>
                </li>


                <li className={getNavLinkClass("/settings/apikeys")}>
                    <NavLink to='/settings/apikeys' className={({ isActive }) => isActive ? "active" : ""}>
                        <img src={api_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>API Keys</span>
                    </NavLink>
                </li>

                <li className="heading">
                    <h3 className="uppercase">Affiliate</h3>
                </li>
                <li className={getNavLinkClass("/dashboard/affiliate")}>
                    <NavLink to='/dashboard/affiliate' className={({ isActive }) => isActive ? "active" : ""}>
                        <img src={affiliate_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>Manage</span>
                    </NavLink>
                </li>

                <li className="heading">
                    <h3 className="uppercase">FLEX Pay</h3>
                </li>
                <li className={getNavLinkClass("/dashboard/affiliate")}>
                    <NavLink to='/payments/merchants' className={({ isActive }) => isActive ? "active" : ""}>
                        <img src={affiliate_icon} className={'icon-home'} />
                        <span className="title" style={{ fontSize: 16, marginLeft: 4 }}>Merchants</span>
                    </NavLink>
                </li>

                {isMobile &&
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <BFGradientButton buttonType={BFGradientButtonType.Destructive} onPress={setSignOut} text={t('Sign Out')} width={'100%'} />
                        </div>

                        <div></div>

                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right', paddingTop: 5 }}>
                            <NavLink to={'/fees'} style={{ padding: 3 }}>Fees and Rebates</NavLink>
                            <NavLink to={'/terms'} style={{ padding: 3 }}>Terms and Conditions</NavLink>
                            <NavLink to={'/privacy'} style={{ padding: 3 }}>Privacy Policy</NavLink>
                            <NavLink to={'/affiliate'} style={{ padding: 3 }}>Affiliate Program</NavLink>
                            <NavLink to={'/api'} style={{ padding: 3 }}>API Description</NavLink>
                        </div>
                    </>
                }
            </ul>
        </div>
    );
}