import { useEffect, useState } from 'react';

import { ProfileLayout } from '../../ProfileLayout';
import { useParams } from "react-router";
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { BFInput, BFInputType } from '../../html/BFInput';
import { isMobile } from 'react-device-detect';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { ManualWithdrawRequest, ManualWithdrawStatus } from '../../../api-wrapper';

export default function VerifyManualwithdraw() {
    let { guid } = useParams<{ guid: string }>();

    BitflexOpenApi.Init();

    const [withdraw, setwithdraw] = useState<ManualWithdrawRequest>();

    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (guid)
            BitflexOpenApi.AdminApi.apiAdminGetManualWithdrawInformationGet(guid).then(data => {
                setwithdraw(data.data)
                setAmount(data.data.amount!)
            })
    }, [guid]);

    if (withdraw?.status == ManualWithdrawStatus.Declined || withdraw?.status == ManualWithdrawStatus.Paid)
        return (
            <ProfileLayout>
                <h1 style={{ textAlign: 'center' }}>Withdraw Status Status: {withdraw?.status}</h1>
            </ProfileLayout>
        )
    else
        return (
            <ProfileLayout>
                <h1 style={{ textAlign: 'center' }}>Verify withdraw</h1>
                <div className="row">
                    <div className="col-lg-12">
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between' }}>
                            <div style={{ width: '100%' }}>
                                <h4>Amount</h4>
                                <BFInput
                                    type={BFInputType.Decimal}
                                    setValue={withdraw?.amount!}
                                    onValue={setAmount}
                                />
                                <h4>Bank Name</h4>
                                <BFInput
                                    type={BFInputType.Text}
                                    setValue={withdraw?.bankName!}
                                />

                                {withdraw?.bankAccountNumber && <>
                                    <h4>Bank Account Number</h4>
                                    <BFInput
                                        type={BFInputType.Text}
                                        setValue={withdraw?.bankAccountNumber!}
                                    />

                                </>}

                                {withdraw?.ifscCode && <>
                                    <h4>IFSC Code</h4>
                                    <BFInput
                                        type={BFInputType.Text}
                                        setValue={withdraw?.ifscCode!}
                                    />

                                </>}

                                {withdraw?.upiid && <>
                                    <h4>UPI ID</h4>
                                    <BFInput
                                        type={BFInputType.Text}
                                        setValue={withdraw?.upiid!}
                                    />
                                </>}
                            </div>
                            {/* {!isMobile && <div style={{ padding: 15 }}></div>}
                            <div style={{ width: '100%' }}>
                                {withdraw? && <img src={"data:image/png;base64," + withdraw.recieptPhoto} style={{ maxWidth: '100%' }} />}
                            </div> */}


                        </div>
                        <div style={{ margin: 10 }}></div>
                        <BFGradientButton buttonType={BFGradientButtonType.Green} width={'100%'} text='Apply' onPress={() => {
                            BitflexOpenApi.AdminApi.apiAdminSetManualWithdrawStatePost(guid, ManualWithdrawStatus.Paid, amount).then(data => setwithdraw(data.data))
                        }}></BFGradientButton>
                        <div style={{ margin: 10 }}></div>
                        <BFGradientButton buttonType={BFGradientButtonType.Destructive} width={'100%'} text='Reject' onPress={() => {
                            BitflexOpenApi.AdminApi.apiAdminSetManualWithdrawStatePost(guid, ManualWithdrawStatus.Declined).then(data => setwithdraw(data.data))
                        }}></BFGradientButton>
                    </div>
                </div>
            </ProfileLayout>
        )
}