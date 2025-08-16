// ====================================================================================
// IMPORTS - All the stuff we need from other files
// ====================================================================================

// React stuff - the basic building blocks
import React, { CSSProperties, useCallback, useContext, useEffect, useState } from 'react';

// Translation stuff - for multiple languages
import { Trans, useTranslation } from 'react-i18next';

// Device detection - to know if user is on mobile
import { isMobile } from 'react-device-detect';

// Icons - pretty symbols
import { FaExclamationTriangle } from 'react-icons/fa';

// Our custom components - reusable UI pieces
import { BFGradientButton, BFGradientButtonType } from '../../../html/BFGradientButton';
import { BFInput, BFInputType } from '../../../html/BFInput';
import { BFModalWindow } from '../../../html/BFModalWindow';
import { StaticPagesLayout } from '../../../staticpages/StaticPagesLayout';

// Security-specific components
import { ChangePasswordModal } from './ChangePasswordModal';
import { DisableTwoFactorModal } from './DisableTwoFactorModal';
import { RequestSettingsTokenOverlay } from './RequestSettingsTokenOverlay';
import EnableTwoFactor from './EnableTwoFactor';

// API stuff - for talking to the server
import { BitflexOpenApi } from '../../../../_helpers/BitflexOpenApi';
import { ParameterType, TwoStepVerificationTypes } from '../../../../api-wrapper/api';

// Store stuff - for managing app state
import { Store } from '../../../../store';
import { ActionType } from '../../../../store/actionTypes';
import { IState } from '../../../../store/types';
import { SetBlur } from '../../../../store/actions';

// Hooks - reusable logic pieces
import { useBitflexDeviceId } from '../../../../hooks/useBitflexDeviceId';

// Utilities and styles
import SecureLS from 'secure-ls';
import Colors from '../../../../Colors';

// ====================================================================================
// TYPE DEFINITIONS - What shape our data should have
// ====================================================================================

// Interface for CSS styles dictionary
export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

// Interface for UI state
interface UIState {
    isLoading: boolean;                           // Is the page loading?
    isPasswordChangeModalActive: boolean;         // Should we show password change modal?
    isEnableTwoStepModalActive: boolean;          // Should we show enable 2FA modal?
    isDisableTwoStepModalActive: boolean;         // Should we show disable 2FA modal?
    isSessionLifetimeChangingActive: boolean;     // Is user changing session lifetime?
    isTfaButtonLoading: boolean;                  // Is 2FA button in loading state?
    modalTitle: string;                           // What title to show in modal
}

// ====================================================================================
// MAIN COMPONENT - The security settings page
// ====================================================================================

export default function Security() {

    // ====================================================================================
    // HOOKS - Get functionality from other parts of the app
    // ====================================================================================

    // Get app state and dispatch function from store
    const { state, dispatch } = useContext(Store);
    const { settings } = state as IState;

    // Get translation function
    const { t } = useTranslation();

    // Get device ID for security
    const { bitflexDeviceId } = useBitflexDeviceId();

    // ====================================================================================
    // STATE - Data that can change and cause re-renders
    // ====================================================================================

    // UI state - controls what the user sees
    const [uiState, setUiState] = useState<UIState>({
        isLoading: false,
        isPasswordChangeModalActive: false,
        isEnableTwoStepModalActive: false,
        isDisableTwoStepModalActive: false,
        isSessionLifetimeChangingActive: false,
        isTfaButtonLoading: false,
        modalTitle: ''
    });

    // Secure local storage for sensitive data
    const [secureStorage] = useState(new SecureLS({
        encodingType: 'rc4',
        isCompression: false
    }));

    // ====================================================================================
    // COMPUTED VALUES - Derived from other data
    // ====================================================================================

    // Check if settings overlay should be shown (when token expired)
    const isOverlayActive = settings == null || settings?.expiration! < Math.floor(Date.now() / 1000);

    // ====================================================================================
    // EFFECT HOOKS - Code that runs when component mounts or data changes
    // ====================================================================================

    // Handle blur effect when modals are open
    useEffect(() => {
        if (dispatch) {
            SetBlur(uiState.isEnableTwoStepModalActive, dispatch);
        }
    }, [dispatch, uiState.isEnableTwoStepModalActive]);

    // ====================================================================================
    // UI STATE HANDLERS - Functions to update UI state
    // ====================================================================================

    // Update a specific part of UI state
    const updateUIState = useCallback((updates: Partial<UIState>) => {
        setUiState(prev => ({ ...prev, ...updates }));
    }, []);

    // Handle loading state changes
    const handleLoadingStart = useCallback((loading: boolean) => {
        updateUIState({ isLoading: loading });
    }, [updateUIState]);

    // Handle token receive from overlay
    const handleTokenReceive = useCallback((token: any) => {
        if (dispatch) {
            dispatch({
                type: ActionType.SET_ACCOUNT_SETTINGS,
                payload: token
            });
        }
    }, [dispatch]);

    // ====================================================================================
    // MODAL HANDLERS - Functions to open/close modals
    // ====================================================================================

    // Handle password change modal
    const handlePasswordChangeModal = useCallback((isActive: boolean) => {
        updateUIState({ isPasswordChangeModalActive: isActive });
    }, [updateUIState]);

    // Handle enable 2FA modal
    const handleEnableTwoStepModal = useCallback((isActive: boolean, title: string = '') => {
        updateUIState({
            isEnableTwoStepModalActive: isActive,
            modalTitle: title
        });
    }, [updateUIState]);

    // Handle disable 2FA modal
    const handleDisableTwoStepModal = useCallback((isActive: boolean, title: string = '') => {
        updateUIState({
            isDisableTwoStepModalActive: isActive,
            modalTitle: title
        });
    }, [updateUIState]);

    // ====================================================================================
    // SESSION LIFETIME HANDLERS - Functions for session management
    // ====================================================================================

    // Handle session lifetime changes
    const handleSessionLifetimeChange = useCallback((value: number) => {
        if (value > 0 && settings?.token) {
            BitflexOpenApi.UserApi.apiUserSetparametersPost(
                ParameterType.SessionLifetime,
                settings.token,
                value
            )
                .then(settingsToken => {
                    if (dispatch) {
                        dispatch({
                            type: ActionType.SET_ACCOUNT_SETTINGS,
                            payload: settingsToken.data
                        });
                    }
                })
                .catch((error) => {
                    alert(`Settings not saved. Wrong token? ${error}`);
                });
        }
    }, [settings?.token, dispatch]);

    // Toggle session lifetime editing mode
    const toggleSessionLifetimeEditing = useCallback((isActive: boolean) => {
        updateUIState({ isSessionLifetimeChangingActive: isActive });
    }, [updateUIState]);

    // ====================================================================================
    // TWO-FACTOR AUTHENTICATION HANDLERS
    // ====================================================================================

    // Render appropriate button based on 2FA status
    const renderTfaButton = useCallback((type: TwoStepVerificationTypes) => {
        const buttonProps = {
            isLoading: uiState.isTfaButtonLoading,
            width: 130
        };

        switch (type) {
            case TwoStepVerificationTypes.Bitflex:
                return (
                    <BFGradientButton
                        {...buttonProps}
                        buttonType={BFGradientButtonType.Destructive}
                        text={t('Disable Guard')}
                        onPress={() => handleDisableTwoStepModal(true)}
                    />
                );

            case TwoStepVerificationTypes.Google:
                return (
                    <BFGradientButton
                        {...buttonProps}
                        buttonType={BFGradientButtonType.Destructive}
                        text={t('Disable OTP')}
                        onPress={() => handleDisableTwoStepModal(true)}
                    />
                );

            default:
                return isOverlayActive ? null : (
                    <BFGradientButton
                        {...buttonProps}
                        buttonType={BFGradientButtonType.Green}
                        text={t('SETUP TFA')}
                        onPress={() => handleEnableTwoStepModal(true)}
                    />
                );
        }
    }, [
        isOverlayActive,
        uiState.isTfaButtonLoading,
        t,
        handleDisableTwoStepModal,
        handleEnableTwoStepModal
    ]);

    // Get 2FA status text and color
    const getTfaStatusInfo = useCallback(() => {
        if (!settings?.verificationTypes || settings.verificationTypes === TwoStepVerificationTypes.No) {
            return { text: 'Disabled', color: 'red' };
        }

        const type = settings.verificationTypes === TwoStepVerificationTypes.Bitflex
            ? 'BCFLEX Guard'
            : 'Google Authenticator';

        return {
            text: `Enabled ${type}`,
            color: 'green'
        };
    }, [settings?.verificationTypes]);

    // ====================================================================================
    // RENDER COMPONENTS - Individual UI pieces
    // ====================================================================================

    // Password settings row
    const PasswordRow: React.FC = () => (
        <div style={styles.rowStyle}>
            <div>
                <div style={styles.headerStyle}>
                    <Trans>Password</Trans>
                </div>
                <div style={styles.headerInformation}>
                    <Trans>Update your password</Trans>
                </div>
            </div>
            <div style={styles.subHeaderStyle}>
                <BFGradientButton
                    buttonType={BFGradientButtonType.Action}
                    text={t('CHANGE')}
                    onPress={() => handlePasswordChangeModal(true)}
                    width={130}
                />
            </div>
        </div>
    );

    // Support code row
    const SupportCodeRow: React.FC = () => (
        <div style={styles.rowStyle}>
            <div>
                <div style={styles.headerStyle}>
                    {t('Support Code')}
                </div>
                <div style={styles.headerInformation}>
                    {t('We will ask you for this code on Support Request.')}
                </div>
            </div>
            <div style={styles.subHeaderStyle}>
                <div style={{ width: 130, textAlign: 'right' }}>
                    {settings?.supportPIN! > 0 ? settings?.supportPIN : '****'}
                </div>
            </div>
        </div>
    );

    // Two-factor authentication row
    const TwoFactorRow: React.FC = () => {
        const statusInfo = getTfaStatusInfo();

        return (
            <div style={styles.rowStyle}>
                <div>
                    <div style={styles.headerStyle}>
                        {t('2-Step Verification')}
                    </div>
                    <div style={styles.headerInformation}>
                        {t('Protect your funds and account with Two Step Authentication.')}
                        <br />
                        {t('Status')}: <span style={{ color: statusInfo.color }}>
                            {t(statusInfo.text)}
                        </span>
                    </div>
                </div>
                <div style={styles.subHeaderStyle}>
                    {renderTfaButton(settings?.verificationTypes!)}
                </div>
            </div>
        );
    };

    // Session lifetime settings row
    const SessionLifetimeRow: React.FC = () => (
        <div style={styles.lastRow}>
            <div>
                <div style={styles.headerStyle}>
                    {t('Session Lifetime')}
                </div>
                <div style={styles.headerInformation}>
                    {t('Set lifetime (in Minutes) for Access Token. Without')}
                    <span style={{ color: Colors.bitFlexGoldenColor }}> BCFLEX Guard</span>
                    {t(' will take effect only after current Token expired.')}
                </div>
            </div>
            <div style={styles.subHeaderStyle}>
                {uiState.isSessionLifetimeChangingActive ? (
                    <div style={styles.sessionLifetimeEditor}>
                        <BFInput
                            type={BFInputType.Int}
                            setValue={settings?.sessionLifeTimeMinutes}
                            onDebouncedValue={handleSessionLifetimeChange}
                        />
                        <div style={styles.saveButtonContainer}>
                            <BFGradientButton
                                buttonType={BFGradientButtonType.FormSaveSquare}
                                width={42}
                                onPress={() => toggleSessionLifetimeEditing(false)}
                            />
                        </div>
                    </div>
                ) : (
                    <BFGradientButton
                        buttonType={BFGradientButtonType.Action}
                        text={t('CHANGE')}
                        width={130}
                        onPress={() => toggleSessionLifetimeEditing(true)}
                    />
                )}
            </div>
        </div>
    );

    // ====================================================================================
    // MAIN RENDER - What actually gets shown on the page
    // ====================================================================================

    return (
        <StaticPagesLayout
            isDashboard={true}
            isLoading={uiState.isLoading}
            overlayElement={
                <RequestSettingsTokenOverlay
                    onLoadingStart={handleLoadingStart}
                    onTokenReceive={handleTokenReceive}
                />
            }
            isOverlayActive={isOverlayActive}
        >
            {/* Enable Two-Factor Modal */}
            <BFModalWindow
                title={uiState.modalTitle}
                isOpen={uiState.isEnableTwoStepModalActive}
                onClose={() => handleEnableTwoStepModal(false)}
            >
                <EnableTwoFactor
                    isDash={true}
                    onClose={() => handleEnableTwoStepModal(false)}
                    onTitleChange={(title) => updateUIState({ modalTitle: title })}
                />
            </BFModalWindow>

            {/* Disable Two-Factor Modal */}
            <BFModalWindow
                title={uiState.modalTitle}
                isOpen={uiState.isDisableTwoStepModalActive}
                onClose={() => handleDisableTwoStepModal(false)}
            >
                <DisableTwoFactorModal
                    isDash={true}
                    onClose={() => handleDisableTwoStepModal(false)}
                    onTitleChange={(title) => updateUIState({ modalTitle: title })}
                />
            </BFModalWindow>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isActive={uiState.isPasswordChangeModalActive}
                onCancel={() => handlePasswordChangeModal(false)}
            />

            {/* Page Header */}
            <div className="bf-dash-header">
                <h1 className="bf-dashboard-title">
                    <Trans>Security Settings</Trans>
                </h1>
            </div>

            {/* Settings Content */}
            <div>
                <PasswordRow />
                <SupportCodeRow />
                <TwoFactorRow />
                <SessionLifetimeRow />
            </div>
        </StaticPagesLayout>
    );
}

// ====================================================================================
// STYLES - How everything should look
// ====================================================================================

const styles: StylesDictionary = {
    // Row without border at bottom
    rowStyleNoBorder: {
        display: 'flex',
        color: 'white',
        margin: isMobile ? 15 : 35,
        padding: 0,
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: isMobile ? 15 : 35,
        fontSize: 24,
        cursor: 'pointer'
    },

    // Standard row with dashed border at bottom
    rowStyle: {
        display: 'flex',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#bdbdbd',
        borderBottomStyle: 'dashed',
        margin: isMobile ? 15 : 35,
        padding: 0,
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: isMobile ? 15 : 35
    },

    // Last row without border
    lastRow: {
        display: 'flex',
        justifyContent: 'space-between',
        margin: isMobile ? 15 : 35,
        padding: 0,
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: isMobile ? 15 : 35,
        borderBottomWidth: 0
    },

    // Main header text style
    headerStyle: {
        color: 'white',
        fontWeight: 400,
        fontSize: 21
    },

    // Sub header text style (usually for buttons/actions)
    subHeaderStyle: {
        color: Colors.bitFlexGoldenColor,
        fontWeight: 500,
        fontSize: 22
    },

    // Information text style
    headerInformation: {
        paddingRight: 15,
        color: '#bdbdbd',
        fontSize: 14,
        marginTop: 5
    },

    // Session lifetime editor container
    sessionLifetimeEditor: {
        fontSize: 15,
        display: 'inline-flex',
        justifyContent: 'space-around',
        marginTop: 1,
        width: 130
    },

    // Save button container in session lifetime editor
    saveButtonContainer: {
        margin: 1,
        marginLeft: 7
    }
};