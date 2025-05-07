import { ApiKey, GenerateApiKeyRequest, Type } from '../../../api-wrapper/api';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../html/BFInput';
import { FaCheck, FaEye, FaEyeSlash, FaFolderOpen, FaTimesCircle } from 'react-icons/fa';
/* eslint-disable jsx-a11y/alt-text */
import React, { CSSProperties, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ActionType } from '../../../store/actionTypes';
import { BFModalWindow } from '../../html/BFModalWindow';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import Colors from '../../../Colors';
import { Logger } from '../../../Logger';
import { RequestSettingsTokenOverlay } from './security/RequestSettingsTokenOverlay';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Store } from '../../../store';
import { isMobile } from 'react-device-detect';
import { useCallback } from 'react';
import { useCryptoKeys } from '../../../hooks/useCryptoKeys';

export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

export default function ApiKeys() {
    const {
        state: { currencies, settings },
        dispatch
    } = React.useContext(Store);

    const [isLoading, setisLoading] = useState(true);
    const [accessKeys, setaccessKeys] = useState<ApiKey[]>();
    const [isCreateApiKeyModalActive, setisCreateApiKeyModalActive] = useState(false);
    const [removeRequestApiKey, setremoveRequestApiKey] = useState<ApiKey>();

    const [tradingChecked, settradingChecked] = useState(false);
    const [marginChecked, setmarginChecked] = useState(false);

    const [withdrawChecked, setwithdrawChecked] = useState(false);
    const [newApiKeyLabel, setnewApiKeyLabel] = useState<string>('API Key');

    const { t } = useTranslation();

    // const { Decrypt } = useCryptoKeys();

    const LoadData = () =>{
        setisLoading(true)
        BitflexOpenApi.UserApi.apiVversionUserApikeysGet("1.0")
            .then(response => {
                setaccessKeys(response.data);
            })
            .catch(Logger.Catch)
            .finally(() => setisLoading(false))
    }

    useEffect(() => {
        LoadData()
    }, []);

    const RevokeApiKey = useCallback((apiKey: string | null | undefined) => {
        if (!apiKey) return;

        BitflexOpenApi.UserApi.apiVversionUserApikeysDelete("1.0", apiKey.toString().trim().replaceAll("%00", ""))
            .catch(Logger.Catch)
            .finally(() => {
                setisConfirmationDialogActive(false)
                LoadData()
            })
    }, [])

    const RequestRemoveApiKey = useCallback((key: ApiKey) => {
        setremoveRequestApiKey(key)
        setisConfirmationDialogActive(true)
    }, []);

    const CreateNewApiKey = useCallback((keyRequest: GenerateApiKeyRequest) => {
        setisLoadingKeyCreation(true)
        BitflexOpenApi.UserApi.apiVversionUserApikeysPost("1.0", keyRequest)
            .then((response) => {
                var accessTokensProxy = accessKeys;
                accessTokensProxy?.push(response.data);
                setaccessKeys(accessTokensProxy)
            })
            .catch(Logger.Catch)
            .finally(() => {
                setisLoadingKeyCreation(false)
                setisCreateApiKeyModalActive(false)
            })
    }, [accessKeys]);

    const [isKeysHidden, setisKeysHidden] = useState(true);
    const [isConfirmationDialogActive, setisConfirmationDialogActive] = useState(false);

    const ApiRightsRow = useCallback(({ isChecked, setChecked, label, text }): JSX.Element => {
        return <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }} onClick={() => setChecked(!isChecked)}>
            <div style={{
                margin: 10, background: isChecked ? Colors.bitFlexGoldenColor : 'transparent', borderRadius: 5,
                padding: 13, justifyContent: 'space-between', display: 'flex',
                flexDirection: 'row', width: '100%', alignItems: 'center',
                borderWidth: 1, borderStyle: isChecked ? 'solid' : 'dashed',
                borderColor: isChecked ? Colors.bitFlexGoldenColor : 'grey'
            }}>
                <div>
                    <div style={{ fontSize: 23, color: 'white' }}>{label}</div>
                    <div style={{ fontSize: 17, color: 'rbga(255,255,255,0.8)' }}>{text}</div>
                </div>
                <div>
                    <FaCheck style={{ fontSize: 25, color: 'white', margin: 10, opacity: isChecked ? 1 : 0.1 }} />
                </div>
            </div>
        </div>
    }, []);

    const [isLoadingKeyCreation, setisLoadingKeyCreation] = useState(false);

    const [isApiLabelTextCorrect, setisApiLabelTextCorrect] = useState(false);

    return (
        <StaticPagesLayout
            isDashboard={true}
            isLoading={isLoading}
            overlayElement={<RequestSettingsTokenOverlay onLoadingStart={setisLoading} onTokenReceive={token => {
                dispatch({
                    type: ActionType.SET_ACCOUNT_SETTINGS,
                    payload: token
                });
            }} />}
            isOverlayActive={settings == null || settings?.expiration! < Math.floor(Date.now() / 1000)}
        >
            <>
                <BFModalWindow isOpen={isCreateApiKeyModalActive} title={t('API Key Creation')} onClose={() => setisCreateApiKeyModalActive(false)}>
                    <div>
                        <div style={{ margin: 10 }}>
                            <label className={''} style={{ fontSize: 24 }}>Name:</label>
                            <BFInput type={BFInputType.Text} placeholder={'My API Key'} onValue={setnewApiKeyLabel} onValidated={setisApiLabelTextCorrect} maxStringLength={12} />
                        </div>
                        <ApiRightsRow isChecked={tradingChecked} setChecked={settradingChecked} label={t('Spot')} text={t('Allow to trade on spot market with this API Key')} />
                        <ApiRightsRow isChecked={marginChecked} setChecked={setmarginChecked} label={t('Margin')} text={t('Allow to trade on margin market with this API Key')} />
                        <ApiRightsRow isChecked={withdrawChecked} setChecked={setwithdrawChecked} label={t('Withdraw')} text={t('Allow to withdraw using this API Key')} />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <BFGradientButton
                            isDisabled={!isApiLabelTextCorrect}
                            isLoading={isLoadingKeyCreation}
                            text={t('Create API KEY')}
                            buttonType={BFGradientButtonType.Action}
                            onPress={() => {
                                CreateNewApiKey({
                                    name: newApiKeyLabel,
                                    isMarginTradeAllowed: marginChecked,
                                    isTradeAllowed: tradingChecked,
                                    isWithdrawAllowed: withdrawChecked
                                })
                            }}
                        />
                    </div>
                </BFModalWindow>

                <BFModalWindow isOpen={isConfirmationDialogActive} title={t('Confirm API KEY Revocation')} onClose={() => setisConfirmationDialogActive(false)}>

                    <div style={{ margin: isMobile ? 1 : 12, }}>
                        <label className={''} style={{ fontSize: 16 }}>Type "{removeRequestApiKey?.name}" in field below:</label>
                        <input className="input-inline-form" style={{ width: '100%', height: 32, fontSize: 14 }} onChange={e => setnewApiKeyLabel(e.target.value)} type="text" placeholder={removeRequestApiKey?.name || ""} />
                    </div>

                    <BFGradientButton buttonType={BFGradientButtonType.Destructive} text={t('Revoke API Key')} onPress={() => {
                        if (newApiKeyLabel !== removeRequestApiKey?.name) {
                            alert(t("API KEY name mismatch"))
                            return;
                        }
                        RevokeApiKey(removeRequestApiKey?.key)
                    }} />
                </BFModalWindow>

                <div className={'bf-dash-header'} style={{ position: 'relative' }}>
                    <h1 className={'bf-dashboard-title'}><Trans>API KEYS</Trans></h1>
                    <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'row' }}>
                        {!isMobile &&
                            <div style={{ width: '80%', margin: 30, marginRight: 5 }}>
                                <BFGradientButton buttonType={BFGradientButtonType.Action} text={t('Create API Key')} onPress={() => setisCreateApiKeyModalActive(true)} />
                            </div>

                            // <button onClick=className='btn btn-lg bf-register-button font-roboto' style={{ width: '80%', margin: 30, marginRight: 5 }}>
                            //     <Trans>Create API KEY</Trans>
                            // </button>
                        }
                        <button onClick={() => setisKeysHidden(!isKeysHidden)} className='btn btn-lg bf-login-button font-roboto' style={{ width: '80%', margin: 30 }}>
                            {!isKeysHidden ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'scroll' }}>
                    {(accessKeys && accessKeys.length > 0)
                        ? <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className='thFix stickyHeader tdFix-left noborder'><Trans>Name</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Key</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Spot</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Margin</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Withdraw</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Action</Trans></th>
                                </tr>
                            </thead>
                            <tbody style={{ whiteSpace: 'nowrap' }}>
                                {accessKeys?.map(key => {
                                    return (
                                        <>
                                            <tr id={key.key!} style={{ fontSize: 12, height: 30 }}>
                                                <td className='tdFix tdFix-left'>{key.name}</td>
                                                <td className={isKeysHidden ? 'tdFix noselect' : 'tdFix'} style={{ filter: isKeysHidden ? 'blur(2px)' : '' }}>{key.key}</td>
                                                <td className='tdFix'>{key.isTradeAllowed ? <FaCheck style={{ fontSize: 14, color: Colors.bitFlexGreenColor }} /> : <FaTimesCircle style={{ fontSize: 14, color: 'white', opacity: 0.3 }} />}</td>
                                                <td className='tdFix'>{key.isMarginTradeAllowed ? <FaCheck style={{ fontSize: 14, color: Colors.bitFlexGreenColor }} /> : <FaTimesCircle style={{ fontSize: 14, color: 'white', opacity: 0.3 }} />}</td>
                                                <td className='tdFix'>{key.isWithdrawAllowed ? <FaCheck style={{ fontSize: 14, color: Colors.bitFlexGreenColor }} /> : <FaTimesCircle style={{ fontSize: 14, color: 'white', opacity: 0.3 }} />}</td>
                                                {/* <td className='tdFix'><button className={'red-actionbutton'} onClick={() => RequestRemoveApiKey(key)}><Trans>Revoke</Trans></button></td> */}

                                                <td className='tdFix' style={{ padding: 0 }}>
                                                    <BFGradientButton buttonType={BFGradientButtonType.DestructiveSmall} text={t('Revoke')} onPress={() => {
                                                        RequestRemoveApiKey(key)
                                                    }} />
                                                </td>
                                            </tr>
                                        </>
                                    )
                                })}
                            </tbody>
                        </table>
                        : <div>
                            <div style={styles.emptyList}>
                                <FaFolderOpen style={{ fontSize: 60, color: Colors.bitFlexGoldenColor, marginBottom: 15 }} />
                                <div className={''} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25 }}>
                                    <Trans>There is no API Keys yet</Trans>
                                    <button onClick={() => setisCreateApiKeyModalActive(true)} className='btn btn-lg bf-register-button font-roboto' style={{ width: '80%', margin: 30 }}><Trans>Create API KEY</Trans></button>
                                </div>
                            </div>
                        </div>
                    }

                </div>

                {(isMobile && accessKeys?.length! > 0) &&
                    <div style={{ textAlign: 'center' }}><button onClick={() => setisCreateApiKeyModalActive(true)} className='btn btn-lg bf-register-button font-roboto' style={{ width: '80%', margin: 30 }}><Trans>Create API KEY</Trans></button></div>

                }
            </>
        </StaticPagesLayout>
    );
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
