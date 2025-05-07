import { useEffect, useState } from 'react';

import { ProfileLayout } from '../../ProfileLayout';
import { useParams } from "react-router";
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { BFInput, BFInputType } from '../../html/BFInput';
import { isMobile } from 'react-device-detect';
import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import { KYCState } from '../settings/KYC';
import { KYCRequest, KYCRequestState } from '../../../api-wrapper';

export default function CheckKYC() {

    const [userSearchResult, setuserSearchResult] = useState<Array<string>>([]);

    let { guid } = useParams<{ guid: string }>();

    BitflexOpenApi.Init();

    const [kyc, setKyc] = useState<KYCRequest>();

    useEffect(() => {
        if (guid)
            BitflexOpenApi.AdminApi.apiAdminGetkycbyguidGet(guid).then(data => setKyc(data.data))
    }, [guid]);


    if (kyc?.requestState == KYCRequestState.Rejected || kyc?.requestState == KYCRequestState.Verified)


        return (
            <ProfileLayout>
                <h1 style={{ textAlign: 'center' }}>KYC State: {kyc?.requestState}</h1>

            </ProfileLayout>
        )

    else

        return (
            <ProfileLayout>
                <h1 style={{ textAlign: 'center' }}>Verify KYC</h1>
                <div className="row">
                    <div className="col-lg-12">
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between' }}>
                            <div style={{ width: '100%' }}>
                                <h4>First Name</h4>
                                <BFInput
                                    type={BFInputType.Text}
                                    setValue={kyc?.firstName!}


                                />
                                <h4>Last Name</h4>
                                <BFInput
                                    type={BFInputType.Text}
                                    setValue={kyc?.lastName!}

                                />
                            </div>
                            {!isMobile && <div style={{ padding: 15 }}></div>}
                            <div style={{ width: '100%' }}>
                                {kyc?.passportPhoto && <img src={"data:image/png;base64," + kyc.passportPhoto} style={{ maxWidth: '100%' }} />}

                                {kyc?.iDorDrivingLicenseFrontSide && <img src={"data:image/png;base64," + kyc.iDorDrivingLicenseFrontSide} style={{ maxWidth: '100%' }} />}

                                {kyc?.iDorDrivingLicenseBackSide && <img src={"data:image/png;base64," + kyc.iDorDrivingLicenseBackSide} style={{ maxWidth: '100%' }} />}

                            </div>


                        </div>
                        <div style={{ margin: 10 }}></div>
                        <BFGradientButton buttonType={BFGradientButtonType.Green} width={'100%'} text='Apply' onPress={() => {
                            BitflexOpenApi.AdminApi.apiAdminSetKYCStatePost(guid, KYCRequestState.Verified).then(data => setKyc(data.data))
                        }}></BFGradientButton>
                        <div style={{ margin: 10 }}></div>
                        <BFGradientButton buttonType={BFGradientButtonType.Destructive} width={'100%'} text='Reject' onPress={() => {
                            BitflexOpenApi.AdminApi.apiAdminSetKYCStatePost(guid, KYCRequestState.Rejected).then(data => setKyc(data.data))
                        }}></BFGradientButton>
                    </div>
                </div>
            </ProfileLayout>
        )
}