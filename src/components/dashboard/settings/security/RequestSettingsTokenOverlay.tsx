/* eslint-disable jsx-a11y/alt-text */
import 'moment-timezone';

import { BFNotification, IBFNotification } from '../../../html/BFNotification';
import { useRef, useState } from 'react';

import { BFGradientButton } from '../../../html/BFGradientButton';
import { BitflexOpenApi } from '../../../../_helpers/BitflexOpenApi';
import { RequestSettingsTokenResponseModel } from '../../../../api-wrapper/api';
import { SettingsTokenRequestErrorType } from '../../../../api-wrapper';
import { useTranslation } from 'react-i18next';

export function RequestSettingsTokenOverlay({
    onLoadingStart,
    onTokenReceive
}: {
    onLoadingStart: (isLoading: boolean) => void,
    onTokenReceive: (settings: RequestSettingsTokenResponseModel) => void
}): JSX.Element {
    let BFNotifictionRef = useRef<IBFNotification>(null);
    const { t } = useTranslation();
    const divRef = useRef<HTMLDivElement>(null);
    const [isLoading, setisLoading] = useState(false);

    return (
        <div className={'row bf-row'} ref={divRef} style={{ backgroundColor: '#14181e', padding: 15, border: '1px #E03C2D dashed', borderRadius: 4 }}>
            <BFNotification ref={BFNotifictionRef} />
            <h3>Settings Locked</h3>
            <div style={{ marginLeft: 25, marginRight: 25 }}>
                <BFGradientButton text={t('Unlock')} width={150} isLoading={isLoading} onPress={() => {
                    setisLoading(true)
                    onLoadingStart(true)
                    BitflexOpenApi.GuardApi.apiVversionGuardRequestSettingsTokenPost("1.0", { biometryIdentified: true })
                        .then(resultResponse => {
                            if (!resultResponse.data.success) {
                                switch (resultResponse.data.errorType) {
                                    case SettingsTokenRequestErrorType.DeviceNotAllowed:
                                        alert("This device is not allowed.")
                                        break;
                                }
                            } else {
                                onLoadingStart(false)
                                onTokenReceive(resultResponse.data)
                            }
                        })
                        .finally(() => setisLoading(false));
                }} />
            </div>
        </div>
    );
}