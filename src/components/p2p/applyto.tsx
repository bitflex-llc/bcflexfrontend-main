import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import Colors from "../../Colors";
import { StylesDictionary } from "../dashboard/settings/ApiKeys";
import { BFGradientButton, BFGradientButtonType } from "../html/BFGradientButton";
import { StaticPagesLayout } from "../staticpages/StaticPagesLayout";
import { FaCheck, FaTelegram } from "react-icons/fa";
import { BFInput, BFInputType } from "../html/BFInput";
import { BitflexOpenApi } from "../../_helpers/BitflexOpenApi";
import { BFNotification, BFNotificationType, IBFNotification } from "../html/BFNotification";
import { useNavigate } from "react-router-dom";

export default function ApplyTo() {

    const [isLoading, setisLoading] = useState(true);
    const [agreed, setagreed] = useState(false);
    const [username, setusername] = useState<string>();

    const [firstTelegramCode, setfirstTelegramCode] = useState<string>();

    const [loadingButton, setloadingButton] = useState(false);
    const [alreadyApplied, setalreadyApplied] = useState(false);
    const BFNotifictionRef = useRef<IBFNotification>(null);

    const [telegramPressed, settelegramPressed] = useState(false);
    const [confirmationCode, setconfirmationCode] = useState<string>();

    const { t } = useTranslation();
    const navigate = useNavigate();

    useEffect(() => {
        setisLoading(true)
        BitflexOpenApi.P2PApi.apiP2PInfoGet()
            .then(result => {
                if (result.data.username) {
                    setalreadyApplied(true)
                    setusername(result.data.username)
                }
                if (result.data.telegramVerificationCode) {
                    setfirstTelegramCode(result.data.telegramVerificationCode)
                }
            })
            .finally(() => setisLoading(false))
    }, []);

    function Submit() {
        if (agreed && username && confirmationCode) {
            setloadingButton(true)
            BitflexOpenApi.P2PApi.apiP2PInfoPost(username, confirmationCode)
                .then(result => {
                    if (result.data) navigate('/settings/kyc');
                    else BFNotifictionRef.current?.Notify(t('Error'), t('Error applying to P2P. Maybe wrong confirmation code?'), BFNotificationType.Error);
                })
                .catch(() => BFNotifictionRef.current?.Notify(t('Network Error'), t('Check  your connection'), BFNotificationType.Error))
                .finally(() => {
                    setTimeout(() => setloadingButton(false), 100)
                })
        }
    }

    const AgreeTerms = useCallback(({ isChecked, setChecked, text }): JSX.Element => {
        return <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }} onClick={() => setChecked(!isChecked)}>
            <div style={{
                margin: 0, background: isChecked ? Colors.bitFlexGreenColor : 'transparent', borderRadius: 4,
                padding: 2, paddingLeft: 20, justifyContent: 'space-between', display: 'flex',
                flexDirection: 'row', width: '100%', alignItems: 'center',
                borderWidth: 1, borderStyle: isChecked ? 'solid' : 'dashed',
                borderColor: isChecked ? Colors.bitFlexGreenColor : '#433C3C',
                marginBottom: 14
            }}>
                <div>
                    <div style={{ fontSize: 17, color: 'rbga(255,255,255,0.8)' }}>{text}</div>
                </div>
                <div>
                    <FaCheck style={{ fontSize: 25, color: 'white', margin: 10, opacity: isChecked ? 1 : 0.1 }} />
                </div>
            </div>
        </div>
    }, []);

    return (
        <StaticPagesLayout
            isDashboard={true}
            isLoading={isLoading}>
            <>
                <div className={'bf-dash-header'} style={{ position: 'relative' }}>
                    <h1 className={'bf-dashboard-title'}><Trans>Apply to P2P</Trans></h1>
                </div>
                <div style={styles.centerScreen}>
                    <BFNotification ref={BFNotifictionRef} />
                    {alreadyApplied
                        ? <>
                            <h3>Dear <span style={{ color: Colors.bitFlexGoldenColor, fontWeight: 600 }}>{username}</span>, you are already accepted Terms and Conditions.<br /><br />But KYC is still mandatory</h3>
                            <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} isLoading={loadingButton} isDisabled={!username} width={'100%'} text='Continue to KYC' onPress={() => navigate('/settings/kyc')}></BFGradientButton>
                        </>
                        : <>
                            <h3>Welcome to BCFLEX P2P</h3>
                            <h5>To start work, you should accept Terms & Conditions of P2P, enter username and apply to KYC.</h5>
                            <p style={{ fontStyle: 'italic', padding: 0 }}>Usually whole process took around 3 minutes</p>
                            <AgreeTerms isChecked={agreed} setChecked={setagreed} text={'I\'m accepting T&C'} />
                            <div style={{ border: "1px dashed " + Colors.bitFlexborderColor, margin: 17, marginLeft: 0, marginRight: 0 }}></div>
                            <div style={{ display: agreed ? 'block' : 'none' }}>
                                <h4>Enter Username</h4>
                                <BFInput type={BFInputType.Text} onValue={(e: React.SetStateAction<string | undefined>) => { setusername(e?.toString()); }} placeholder='elonmusk' />
                            </div>
                            <div style={{ border: "1px dashed " + Colors.bitFlexborderColor, margin: 17, marginLeft: 0, marginRight: 0 }}></div>
                            <div style={{ display: agreed ? 'block' : 'none' }}>
                                <h4>Connect to Telegram Bot</h4>
                                <h5>We are requiring you to connect to our Notifications Bot, to get immediate updates about new trade requests.</h5>
                                <br />

                                <BFGradientButton buttonType={BFGradientButtonType.TelegramColor} width={'100%'} text='CONNECT TELEGRAM' onPress={() => {
                                    settelegramPressed(true)
                                    window.open("tg://resolve?domain=bcflex_notification_bot&start=" + firstTelegramCode, '_blank')
                                }}></BFGradientButton>


                                <div style={{ display: telegramPressed ? 'block' : 'none' }}>
                                    <h4>Enter Confirmation Code</h4>
                                    <BFInput type={BFInputType.Text} onValue={(e: React.SetStateAction<string | undefined>) => { setconfirmationCode(e?.toString()); }} placeholder='FzU9N4Qx' />
                                </div>


                            </div>
                            <div style={{ border: "1px dashed " + Colors.bitFlexborderColor, margin: 17, marginLeft: 0, marginRight: 0 }}></div>
                            <div>
                                <BFGradientButton buttonType={BFGradientButtonType.Action} isLoading={loadingButton} isDisabled={!username || !confirmationCode} width={'100%'} text='Continue to KYC' onPress={Submit}></BFGradientButton>
                            </div>
                        </>
                    }
                </div>
            </>
        </StaticPagesLayout>
    );
}

const styles: StylesDictionary = {
    centerScreen: {
        margin: 8,
        padding: 20,
        width: isMobile ? 'unset' : '40%', borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto', marginTop: isMobile ? 0 : '5%',
        textAlign: 'center',
    }
}
