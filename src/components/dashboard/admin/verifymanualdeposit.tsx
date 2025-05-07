import { useEffect, useState } from 'react';

import { ProfileLayout } from '../../ProfileLayout';
import { useParams } from "react-router";
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { BFInput, BFInputType } from '../../html/BFInput';
import { isMobile } from 'react-device-detect';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { ManualDepositRequest, ManualDepositStatus } from '../../../api-wrapper';

export default function VerifyManualDeposit() {
    let { guid } = useParams<{ guid: string }>();

    BitflexOpenApi.Init();

    const [deposit, setdeposit] = useState<ManualDepositRequest>();

    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (guid)
            BitflexOpenApi.AdminApi.apiAdminGetManualDepositInformationGet(guid).then(data => {
                setdeposit(data.data)
                setAmount(data.data.amount!)
            })
    }, [guid]);

    if (deposit?.status == ManualDepositStatus.Declined || deposit?.status == ManualDepositStatus.Paid)
        return (
            <ProfileLayout>
                <h1 style={{ textAlign: 'center' }}>Deposit Status: {deposit?.status}</h1>
            </ProfileLayout>
        )
    else
        return (
            <ProfileLayout>
                <h1 style={{ textAlign: 'center' }}>Verify DEPOSIT</h1>
                <div className="row">
                    <div className="col-lg-12">
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between' }}>
                            <div style={{ width: '100%' }}>
                                <h4>Amount</h4>
                                <BFInput
                                    type={BFInputType.Decimal}
                                    setValue={deposit?.amount!}
                                    onValue={setAmount}
                                />
                                <h4>Transaction ID</h4>
                                <BFInput
                                    type={BFInputType.Text}
                                    setValue={deposit?.transactionId!}

                                />
                            </div>
                            {!isMobile && <div style={{ padding: 15 }}></div>}
                            <div style={{ width: '100%' }}>
                                {deposit?.recieptPhoto && <img src={"data:image/png;base64," + deposit.recieptPhoto} style={{ maxWidth: '100%' }} />}
                            </div>


                        </div>
                        <div style={{ margin: 10 }}></div>
                        <BFGradientButton buttonType={BFGradientButtonType.Green} width={'100%'} text='Apply' onPress={() => {
                            BitflexOpenApi.AdminApi.apiAdminSetManualDepositStatePost(guid, ManualDepositStatus.Paid, amount).then(data => setdeposit(data.data))
                        }}></BFGradientButton>
                        <div style={{ margin: 10 }}></div>
                        <BFGradientButton buttonType={BFGradientButtonType.Destructive} width={'100%'} text='Reject' onPress={() => {
                            BitflexOpenApi.AdminApi.apiAdminSetManualDepositStatePost(guid, ManualDepositStatus.Declined).then(data => setdeposit(data.data))
                        }}></BFGradientButton>
                    </div>
                </div>
            </ProfileLayout>
        )
}