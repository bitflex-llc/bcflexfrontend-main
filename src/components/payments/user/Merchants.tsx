import { ApiKey, CreateMerchantRequest, CreateTransactionRequest, GenerateApiKeyRequest, Merchant, Type } from '../../../api-wrapper/api';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../html/BFInput';
import { FaCheck, FaEye, FaEyeSlash, FaFolderOpen, FaShoppingCart, FaTimesCircle } from 'react-icons/fa';
/* eslint-disable jsx-a11y/alt-text */
import React, { CSSProperties, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ActionType } from '../../../store/actionTypes';
import { BFModalWindow } from '../../html/BFModalWindow';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import Colors from '../../../Colors';
import { Logger } from '../../../Logger';
// import { RequestSettingsTokenOverlay } from './security/RequestSettingsTokenOverlay';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Store } from '../../../store';
import { isMobile } from 'react-device-detect';
import { useCallback } from 'react';
import { useCryptoKeys } from '../../../hooks/useCryptoKeys';
import { RequestSettingsTokenOverlay } from '../../dashboard/settings/security/RequestSettingsTokenOverlay';

export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

export default function Merchants() {
    const {
        state: { currencies, settings },
        dispatch
    } = React.useContext(Store);

    const [isLoading, setisLoading] = useState(true);
    const [merchants, setMerchants] = useState<Merchant[]>();
    const [isCreateApiKeyModalActive, setisCreateApiKeyModalActive] = useState(false);
    const [removeRequestMerchant, setremoveRequestApiKey] = useState<Merchant>();

    const [newMerchantName, setnewMerchantName] = useState<string>('My Merchant');
    const [newMerchantCallbackUrl, setnewMerchantCallbackUrl] = useState<string>();
    const [newMerchantSuccessUrl, setnewMerchantSuccessUrl] = useState<string>();
    const [newMerchantFailUrl, setnewMerchantFailUrl] = useState<string>();

    const [isKeysHidden, setisKeysHidden] = useState(true);

    const [removeMerchantName, setremoveMerchantName] = useState<string>();

    const { t } = useTranslation();

    const LoadData = () => {
        setisLoading(true)
        BitflexOpenApi.GatewayApi.apiVversionGatewayMerchantGet("1.0")
            .then(response => {
                setMerchants(response.data);
            })
            .catch(Logger.Catch)
            .finally(() => setisLoading(false))
    }

    useEffect(() => {
        LoadData()
    }, []);

    const RemoveMerchant = useCallback((apiKey: string | null | undefined) => {

    }, [])

    const RequestRemoveApiKey = useCallback((key: ApiKey) => {
        setremoveRequestApiKey(key)
        setisConfirmationDialogActive(true)
    }, []);

    const CreateNewMerchant = useCallback((requestData: CreateMerchantRequest) => {

        BitflexOpenApi.GatewayApi.apiVversionGatewayMerchantPost("1.0", requestData)
            .then(response => console.log())
            .catch(Logger.Catch)
            .finally(() => setisLoadingKeyCreation(false))

    }, [merchants]);

    const [isConfirmationDialogActive, setisConfirmationDialogActive] = useState(false);
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
                <BFModalWindow isOpen={isCreateApiKeyModalActive} title={t('Merchant Creation')} onClose={() => setisCreateApiKeyModalActive(false)}>
                    <div>
                        <div style={{ margin: 10 }}>
                            <label className={''} style={{ fontSize: 24 }}>Name:</label>
                            <BFInput type={BFInputType.Text} placeholder={'My Merchant'} onValue={setnewMerchantName} onValidated={setisApiLabelTextCorrect} maxStringLength={32} />
                        </div>

                        <div style={{ margin: 10 }}>
                            <label className={''} style={{ fontSize: 24 }}>POST Callback Url:</label>
                            <BFInput type={BFInputType.Text} onValue={setnewMerchantCallbackUrl} onValidated={setisApiLabelTextCorrect} maxStringLength={256} />
                        </div>
                        <div style={{ margin: 10 }}>
                            <label className={''} style={{ fontSize: 24 }}>Redirect Success Url:</label>
                            <BFInput type={BFInputType.Text} placeholder={'My Merchant'} onValue={setnewMerchantSuccessUrl} onValidated={setisApiLabelTextCorrect} maxStringLength={256} />
                        </div>
                        <div style={{ margin: 10 }}>
                            <label className={''} style={{ fontSize: 24 }}>Redirect Fail Url:</label>
                            <BFInput type={BFInputType.Text} placeholder={'My Merchant'} onValue={setnewMerchantFailUrl} onValidated={setisApiLabelTextCorrect} maxStringLength={12562} />
                        </div>

                    </div>

                    <div style={{ display: 'flex', padding: 20 }}>
                        <BFGradientButton
                            isDisabled={!isApiLabelTextCorrect}
                            isLoading={isLoadingKeyCreation}
                            text={t('Create Merchant')}
                            buttonType={BFGradientButtonType.Action}
                            onPress={() => {
                                setisLoadingKeyCreation(true)
                                CreateNewMerchant({
                                    name: newMerchantName,
                                    callbackUrl: newMerchantCallbackUrl,
                                    successUrl: newMerchantSuccessUrl,
                                    faultUrl: newMerchantFailUrl
                                })
                            }}
                        />
                    </div>
                </BFModalWindow>

                <BFModalWindow isOpen={isConfirmationDialogActive} title={t('Confirm Merchant Revocation')} onClose={() => setisConfirmationDialogActive(false)}>
                    <div style={{ margin: isMobile ? 1 : 12, }}>
                        <label className={''} style={{ fontSize: 16 }}>Type "{removeRequestMerchant?.name}" in field below:</label>
                        <input className="input-inline-form" style={{ width: '100%', height: 32, fontSize: 14 }} onChange={e => setremoveMerchantName(e.target.value)} type="text" placeholder={removeRequestMerchant?.name || ""} />
                    </div>
                    <BFGradientButton buttonType={BFGradientButtonType.Destructive} text={t('Revoke Merchant')} onPress={() => {
                        if (removeMerchantName !== removeRequestMerchant?.name) {
                            alert(t("Merchant name mismatch"))
                            return;
                        }
                        RemoveMerchant(removeRequestMerchant?.key)
                    }} />
                </BFModalWindow>

                <div className={'bf-dash-header'} style={{ position: 'relative' }}>
                    <h1 className={'bf-dashboard-title'}><Trans>Merchants</Trans></h1>
                    <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', flexDirection: 'row' }}>
                        <button onClick={() => setisKeysHidden(!isKeysHidden)} className='btn btn-lg bf-login-button font-roboto' style={{ width: '80%', margin: 42 }}>
                            {!isKeysHidden ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'scroll' }}>
                    {(merchants && merchants.length > 0)
                        ? <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th className='thFix stickyHeader tdFix-left noborder'><Trans>Name</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Id</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>Key</Trans></th>
                                    <th className='thFix stickyHeader noborder'><Trans>#</Trans></th>

                                </tr>
                            </thead>
                            <tbody style={{ whiteSpace: 'nowrap' }}>
                                {merchants?.map(key => {
                                    return (
                                        <>
                                            <tr id={key.key!} style={{ fontSize: 12, height: 30 }}>
                                                <td className='tdFix tdFix-left'>{key.name}</td>
                                                <td className={'tdFix'}>{key.id}</td>
                                                <td className={isKeysHidden ? 'tdFix noselect' : 'tdFix'} style={{ filter: isKeysHidden ? 'blur(2px)' : '' }}>{key.key}</td>
                                                <td className='tdFix' style={{ padding: 0 }}>
                                                    <BFGradientButton buttonType={BFGradientButtonType.Shadow} isLinkButton text={t('Control Panel')} to={'/payments/merchants/' + key.id} />
                                                </td>
                                            </tr>
                                        </>
                                    )
                                })}
                            </tbody>
                        </table>
                        : <div>
                            <div style={styles.emptyList}>
                                <FaShoppingCart style={{ fontSize: 60, color: Colors.bitFlexGoldenColor, marginBottom: 15 }} />
                                <div className={''} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25 }}>
                                    <Trans>There is no Merchants yet</Trans>
                                    <button onClick={() => setisCreateApiKeyModalActive(true)} className='btn btn-lg bf-register-button font-roboto' style={{ width: '80%', margin: 30 }}><Trans>Create Merchant</Trans></button>
                                </div>
                            </div>
                        </div>


                    }
                </div>

                <div className={''} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25 }}>

                    <button onClick={() => setisCreateApiKeyModalActive(true)} className='btn btn-lg bf-register-button font-roboto' style={{ width: '80%', margin: 30 }}><Trans>Create Merchant</Trans></button>
                </div>


                {(isMobile && merchants?.length! > 0) &&
                    <div style={{ textAlign: 'center' }}><button onClick={() => setisCreateApiKeyModalActive(true)} className='btn btn-lg bf-register-button font-roboto' style={{ width: '80%', margin: 30 }}><Trans>Create Merchant</Trans></button></div>
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
