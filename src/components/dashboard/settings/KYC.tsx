import { BFGradientButton, BFGradientButtonType } from '../../html/BFGradientButton';
import React, { CSSProperties, useCallback, useEffect, useState } from 'react';
import { ActionType } from '../../../store/actionTypes';
import { RequestSettingsTokenOverlay } from './security/RequestSettingsTokenOverlay';
import { StaticPagesLayout } from '../../staticpages/StaticPagesLayout';
import { Trans, useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import 'moment-timezone';
import { BFInput, BFInputType, KYCDocumentType } from '../../html/BFInput';
import { isMobile } from 'react-device-detect';
import cross from '../../../images/cross.png'
import check from '../../../images/check.png'
import Colors from '../../../Colors';
import { FaDotCircle } from 'react-icons/fa';
// import { KYCFormData } from '../../../api-wrapper';
import { Store } from '../../../store';
import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { LoadingComponent } from '../../LoadingComponent';
import { KYCRequestState, VerifiedContactsResponse } from '../../../api-wrapper';

export interface StylesDictionary {
    [Key: string]: CSSProperties;
}

export enum KYCState {
    ResidenceRegion,
    RestrictedCountry,
    Submitted,
    Accepted
}

async function compress(elementUploader): Promise<File> {
    return await imageCompression(elementUploader.target.files[0], {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,

    });
}

export default function KYC(): JSX.Element {

    const {
        dispatch
    } = React.useContext(Store);

    const [isLoading, setisLoading] = useState(false);


    const [country, setcountry] = useState<string | undefined>('Pick a country...');
    const [firstName, setfirstName] = useState<string>();
    const [lastName, setlastName] = useState<string>();
    const [city, setcity] = useState<string>();
    const [address, setaddress] = useState<string>();
    const [phoneNumber, setphoneNumber] = useState<string>();
    const [telegramId, settelegramId] = useState<string>();
    const [documents, setdocuments] = useState<File[]>([]);

    const [verifiedContacts, setverifiedContacts] = useState<VerifiedContactsResponse>();

    const [documentType, setdocumentType] = useState<KYCDocumentType | string | undefined>(KYCDocumentType.NationalID);

    const [viewState, setviewState] = useState(KYCState.ResidenceRegion);

    const { t } = useTranslation();

    const [isPageLoading, setisPageLoading] = useState(true);

    // const [KYCFormData, setKYCFormData] = useState<KYCFormData>({ country: '', documents: [] });

    // const [country, setcountry] = useState();

    const [documentSelected, setdocumentSelected] = useState(false);

    const SubmitForm = () => {
        setisLoading(true)
        BitflexOpenApi.UserApi.apiUserApplykycPost(country, firstName, lastName, city, address, documents)
            .then(result => {
                if (result) {
                    setviewState(KYCState.Submitted)
                    // setTimeout(() => setviewState(KYCState.Accepted), 5000)
                }
            })
            .finally(() => {
                setisLoading(false)
            })
    }

    useEffect(() => {
        BitflexOpenApi.UserApi.apiUserKycstateGet()
            .then(result => {
                if (result.data === KYCRequestState.Verified)
                    setviewState(KYCState.Accepted)

                if (result.data === KYCRequestState.Applied)
                    setviewState(KYCState.Submitted)
            })
            .finally(() => setisPageLoading(false))

        BitflexOpenApi.UserApi.apiUserGetverifiedcontactsGet().then(data => {
            setverifiedContacts(data.data)
            data.data.phoneNumber && setphoneNumber(data.data.phoneNumber)
            data.data.telegramUsername && settelegramId(data.data.telegramUsername)
        })
    }, []);

    const DocumentSelector = useCallback(({ isChecked, setChecked, label }): JSX.Element => {
        return <div style={{ width: '100%', cursor: 'pointer', display: 'flex' }} onClick={() => setChecked(!isChecked)}>
            <div style={{
                marginBottom: 5, background: isChecked ? 'rgba(207, 137, 0, 0.3)' : 'transparent', borderRadius: 5,
                padding: 13, justifyContent: 'space-between', display: 'flex',
                flexDirection: 'row', width: '100%', alignItems: 'center',
                borderWidth: 1, borderStyle: isChecked ? 'solid' : 'dashed',
                borderColor: isChecked ? Colors.bitFlexGoldenColor : Colors.BITFLEXBorder
            }}>
                <div>
                    {/* <div style={{ fontSize: 23, color: 'white' }}>{label}</div> */}
                    <div style={{ fontSize: 18, color: 'rbga(255,255,255,0.8)' }}>{label}</div>
                </div>
                <div>
                    <FaDotCircle style={{ fontSize: 25, color: 'white', margin: 10, opacity: isChecked ? 1 : 0.1 }} />
                </div>
            </div>
        </div>
    }, []);


    const ResidenceRegionView = () => {
        return <>
            <h3 style={{ marginTop: 25, marginBottom: 10, color: 'red' }}>Identity Verification</h3>
            <div style={{ border: '1px dashed ' + Colors.bitFlexborderColor }}></div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between' }}>

                <div style={{ width: '100%' }}>
                    <h4>Select Residence Region</h4>
                    <BFInput
                        type={BFInputType.Country}
                        placeholder='Pick a country...'
                        onValue={(e: React.SetStateAction<string | undefined>) => {
                            setcountry(e)
                            if (e === 'United States' || e === 'China') {
                                setviewState(KYCState.RestrictedCountry); return;
                            }
                        }}


                    />
                    <h4 style={{}}>Select Document Type</h4>
                    <DocumentSelector isChecked={documentType === KYCDocumentType.NationalID} setChecked={() => setdocumentType(KYCDocumentType.NationalID)} label={t('National ID')} />
                    <DocumentSelector isChecked={documentType === KYCDocumentType.Passport} setChecked={() => setdocumentType(KYCDocumentType.Passport)} label={t('Passport')} />
                    <DocumentSelector isChecked={documentType === KYCDocumentType.DrivingLicense} setChecked={() => setdocumentType(KYCDocumentType.DrivingLicense)} label={t('Driving License')} />
                </div>
                <div style={{ padding: 15 }}></div>
                <div style={{ width: '100%', position: 'relative' }}>
                    <h4 style={{}}>Upload Images of Documents</h4>
                    {documentType && documentType?.length > 0 ? <><div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {documentType === KYCDocumentType.Passport ? <>
                            <div style={{ width: '100%' }}>
                                <div style={styles.passport}>
                                    <div className={'Absolute-Center'} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25, width: '80%' }}>
                                        <Trans><h4>Second page of Passport<br />(with your Photo)</h4></Trans>
                                        <div style={{ width: '100%', padding: 15 }}>
                                            <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} isDisabled={viewState === KYCState.RestrictedCountry} width={'100%'} onPress={() =>
                                                document?.getElementById("selectPassportImage")?.click()
                                            } text='Select File.. (jpeg, png)'></BFGradientButton>
                                            <input
                                                type="file"
                                                id='selectPassportImage'
                                                name='passport'
                                                accept="image/png,image/jpeg"
                                                // ref={passportInputRef?.current}
                                                onChange={passportElement => {
                                                    compress(passportElement)
                                                        .then((compressedFile: File) => {
                                                            setdocuments(prev => [...prev, compressedFile])
                                                        });
                                                }}
                                                hidden={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                            : <>
                                <div style={{ width: '100%' }}>
                                    <div style={styles.idanddriving}>
                                        <div className={''} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25 }}>
                                            <Trans><h4>Front side of {documentType}</h4></Trans>
                                            <div style={{ width: '100%' }}>
                                                <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} isDisabled={viewState === KYCState.RestrictedCountry} width={'80%'} text='Select File.. (jpeg, png)' onPress={() =>
                                                    document?.getElementById("selectFrontImage")?.click()
                                                }></BFGradientButton>
                                                <input
                                                    type="file"
                                                    id='selectFrontImage'
                                                    accept="image/png,image/jpeg"
                                                    name='front'
                                                    onChange={passportElement => {
                                                        compress(passportElement)
                                                            .then((compressedFile: File) => setdocuments(prev => [...prev, compressedFile]));
                                                    }}
                                                    hidden={true}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: 5 }}></div>
                                <div style={{ width: '100%', position: 'relative' }}>
                                    <div style={styles.idanddriving}>

                                        <div className={''} style={{ color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontWeight: 500, fontSize: 25 }}>
                                            <Trans><h4>Back side of {documentType}</h4></Trans>
                                            <div style={{ width: '100%' }}>
                                                <BFGradientButton buttonType={BFGradientButtonType.GoldenBorder} isDisabled={viewState === KYCState.RestrictedCountry} width={'80%'} text='Select File.. (jpeg, png)' onPress={() =>
                                                    document?.getElementById("selectBackImage")?.click()
                                                }></BFGradientButton>
                                                <input
                                                    type="file"
                                                    id='selectBackImage'
                                                    accept="image/png,image/jpeg"
                                                    name='back'
                                                    onChange={passportElement => {
                                                        compress(passportElement)
                                                            .then((compressedFile: File) => setdocuments(prev => [...prev, compressedFile]));
                                                    }}
                                                    hidden={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                    </>
                        : <></>
                    }
                </div>

            </div>
            <h3 style={{ marginTop: 25, marginBottom: 10, color: 'red' }}>Personal Information</h3>
            <div style={{ border: '1px dashed ' + Colors.bitFlexborderColor }}></div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between' }}>
                <div style={{ width: '100%' }}>
                    <h4>First Name</h4>
                    <BFInput
                        type={BFInputType.Text}
                        onValue={(e: React.SetStateAction<string | undefined>) => {
                            setfirstName(e?.toString());
                        }}
                        placeholder='Elon'


                    />
                    <h4>Last Name</h4>
                    <BFInput
                        type={BFInputType.Text}
                        onValue={(e: React.SetStateAction<string | undefined>) => {
                            setlastName(e?.toString());
                        }}

                        placeholder='Musk'
                    />
                </div>
                {!isMobile && <div style={{ padding: 15 }}></div>}
                <div style={{ width: '100%', position: 'relative' }}>
                    <h4>City</h4>
                    <BFInput
                        type={BFInputType.Text}
                        onValue={(e: React.SetStateAction<string | undefined>) => {
                            setcity(prev => (e?.toString()));
                        }}
                        placeholder='New York'
                    />
                    <h4>Address</h4>
                    <BFInput
                        type={BFInputType.Text}
                        onValue={(e: React.SetStateAction<string | undefined>) => {
                            setaddress(e?.toString());
                        }}
                        placeholder='47 W 13th St, New York, NY'

                    />
                </div>
                {/* {!isMobile && <div style={{ padding: 15 }}></div>}
                <div style={{ width: '100%', position: 'relative' }}>
                    <h4>Phone Number</h4>
                    <BFInput type={BFInputType.Text} setValue={phoneNumber} isDisabled />



                    <h4>Telegram Id</h4>
                    <BFInput type={BFInputType.Text}  setValue={telegramId}
                    />
                </div> */}
            </div>
            <div style={{ margin: 20 }}></div>
            <BFGradientButton buttonType={BFGradientButtonType.GreenBorder}
                isDisabled={
                    viewState === KYCState.RestrictedCountry ||
                    !address ||
                    !city ||
                    !country ||
                    !firstName ||
                    !lastName
                }
                isLoading={isLoading}
                width={'100%'} text='Save & Continue' onPress={SubmitForm}></BFGradientButton>
        </>
    }

    const RestrictedCountryView = () => {
        return <>
            <div style={{ padding: 10, textAlign: 'center' }}>
                <img src={cross} width={'40%'} alt='Restricted' />
            </div>
            <h3 style={{ textAlign: 'center' }}>{country} is in list of Restricted Regions.</h3>
            <h4 style={{ textAlign: 'center' }}>We&apos;re sorry for any inconvenience.</h4>
        </>
    }

    const SubmittedView = () => {
        return <>
            <div style={{ padding: 10, paddingTop: '10%', textAlign: 'center' }}>

                <LoadingComponent />
            </div>
            <h3 style={{ textAlign: 'center' }}>Let us check your documents.</h3>
        </>
    }

    const AcceptedView = () => {
        return <>
            <div style={{ padding: 10, paddingTop: '10%', textAlign: 'center' }}>
                <img src={check} width={'30%'} alt='Accepted' />
            </div>
            <h2 style={{ textAlign: 'center' }}>KYC Passed!</h2>
            <h3 style={{ textAlign: 'center' }}>Now you are able to use all features of BCFLEX</h3>
        </>
    }

    const ViewManager = (): JSX.Element => {
        switch (viewState) {
            case KYCState.ResidenceRegion: return ResidenceRegionView();
            case KYCState.RestrictedCountry: return RestrictedCountryView();
            case KYCState.Submitted: return SubmittedView();
            case KYCState.Accepted: return AcceptedView();
        }
        return ResidenceRegionView();
    }

    return (
        <StaticPagesLayout isDashboard={true} isLoading={isPageLoading}
        >
            <>
                <div className={'bf-dash-header'}>
                    <h1 className={'bf-dashboard-title'}>Account Verification (KYC)</h1>
                </div>
                <div style={{ height: '100%' }}>
                    <div style={{ padding: isMobile ? 15 : '2vw', paddingTop: 10 }}>
                        {ViewManager()}

                    </div>
                </div>
            </>
        </StaticPagesLayout >
    );
}



const styles: StylesDictionary = {
    passport: {
        padding: 15,
        backgroundColor: Colors.bitFlexBackground, borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto',
        textAlign: 'center', height: 320, position: 'relative'
    },
    idanddriving: {
        padding: 15,
        backgroundColor: Colors.bitFlexBackground, borderRadius: 5,
        borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.BITFLEXBorder,
        marginLeft: 'auto', marginRight: 'auto',
        textAlign: 'center', height: 139
    }
}
