import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
/* eslint-disable jsx-a11y/alt-text */
import React, { CSSProperties, useEffect, useState } from 'react';

import { ActionType } from '../../../store/actionTypes';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { GetAccessTokensResponse } from '../../../api-wrapper/api';

import { RequestSettingsTokenOverlay } from './security/RequestSettingsTokenOverlay';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Store } from '../../../store';
import bitflex_guard_icon from '../../../images/shield.png'
import { useTranslation } from 'react-i18next';
import useUserState from '../../../hooks/useUserState';

import 'moment-timezone';
import Moment from 'react-moment';

export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

export default function Devices() {
    const {
        state: { settings },
        dispatch
    } = React.useContext(Store);

    const [isLoading, setisLoading] = useState(true);
    const [accessTokens, setaccessTokens] = useState<GetAccessTokensResponse[]>();

    useEffect(() => {
        BitflexOpenApi.GuardApi.apiVversionGuardGetAccessTokensGet("1.0").then(response => {
            if (response.data) {
                setaccessTokens(response.data)
            }
            setisLoading(false)
        })
    }, []);

    const { setSignOut } = useUserState();

    const { t } = useTranslation();

    return (
        <StaticPagesLayout isDashboard={true} isLoading={isLoading}
            overlayElement={<RequestSettingsTokenOverlay onLoadingStart={setisLoading} onTokenReceive={token => {
                dispatch({
                    type: ActionType.SET_ACCOUNT_SETTINGS,
                    payload: token
                });
            }} />}
            isOverlayActive={settings == null || settings?.expiration! < Math.floor(Date.now() / 1000)}
        >
            <>
                <div className={'bf-dash-header'}>
                    <h1 className={'bf-dashboard-title'}>Active Devices</h1>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th className='thFix stickyHeader tdFix-left noborder'>Device</th>
                                <th className='thFix stickyHeader noborder'>Expires At</th>
                                <th className='thFix stickyHeader noborder'>Last Active</th>
                                <th className='thFix stickyHeader noborder'>Last IP</th>
                                <th className='thFix stickyHeader noborder'>Revoke?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accessTokens
                                ?.sort((a, b) => {
                                    if (a.expiration! > b.expiration!)
                                        return 1;
                                    return -1;
                                })
                                .filter(_ => _.expiration! > Math.floor(Date.now() / 1000))
                                .filter(_ => !_.terminateReason)
                                .map(token => {
                                    return (
                                        <>
                                            <tr style={{ fontSize: 12, height: 30, opacity: token.terminateReason ? 0.3 : 1 }}>
                                                <td className='tdFix tdFix-left' style={{ display: 'flex' }}>
                                                    {token.description} {token.isThisDevice && <span style={{ backgroundColor: 'green', borderRadius: 4, padding: 1, marginLeft: 4 }}>&nbsp;This Device&nbsp;</span>}
                                                    {token.isGuardDevice && <div title={' BCFLEX Guard Enabled on this Device'} style={{ marginBottom: -4, marginTop: -4, marginLeft: 8, paddingTop: 2 }}><img src={bitflex_guard_icon} width={23} /></div>}
                                                </td>
                                                <td className='tdFix'><Moment format="MMMM, DD HH:mm" unix tz="GMT">{token.expiration}</Moment></td>
                                                <td className='tdFix'>{(token.isOnline || token.isThisDevice) ? <span style={{ backgroundColor: 'green', borderRadius: 4, padding: 2 }}>&nbsp;Online&nbsp;</span> : <span><Moment fromNow>{token.lastActive}</Moment></span>}</td>
                                                <td className='tdFix'>{token.lastIP}</td>
                                                <td className='tdFix' style={{ padding: 0 }}>
                                                    <BFGradientButton buttonType={BFGradientButtonType.DestructiveSmall} text={t('Terminate')} onPress={() => {
                                                        BitflexOpenApi.GuardApi.apiVversionGuardRevokeTokenByIdPost("1.0", { id: token.id, reasonText: "Manual Termination" }).then(() => {
                                                            if (token.isThisDevice) {
                                                                setSignOut();
                                                            }
                                                            BitflexOpenApi.GuardApi.apiVversionGuardGetAccessTokensGet("1.0").then(response => {
                                                                if (response.data)
                                                                    setaccessTokens(response.data)
                                                            })
                                                        })
                                                    }} />
                                                </td>
                                            </tr>
                                        </>
                                    )
                                })}
                        </tbody>
                    </table>
                </div>
            </>
        </StaticPagesLayout >
    );
}


