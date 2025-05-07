import { AdminApi, Configuration, UserAdminCommand } from '../../../api-wrapper';
import React, { useEffect, useState } from 'react';

import { ProfileLayout } from '../../ProfileLayout';
import { authToken } from '../../../_helpers/auth-header';
import { useParams } from 'react-router-dom';

interface IApplicationUser {
    isGoogleAuthenticatorEnabled: boolean;
    googleAuthenticatorSecretKey?: any;
    pinCode: string;
    lastIPAccess?: any;
    lastDateAccess?: any;
    registrationDateTime: number;
    email: string;
    emailConfirmed: boolean;
    lockoutEnabled: boolean;
}

export default function EditUser() {

    // let { email } = useParams();

    const [email, setemail] = useState();

    const [userData, setuserData] = useState<IApplicationUser>();

    useEffect(() => {

        LoadUser();
    }, [email]);

    function LoadUser() {
        var config = new Configuration({ apiKey: "Bearer " + authToken() })
        var apiInstance = new AdminApi(config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000");

        // apiInstance.apiAdminGetuserdataPost(email).then(result => {
        //     setuserData(result.data as IApplicationUser)

        // });
    }

    function DoUserCommand(command: UserAdminCommand) {
        var config = new Configuration({ apiKey: "Bearer " + authToken() })
        var apiInstance = new AdminApi(config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000");

        // apiInstance.apiAdminUsercommandPost(email, command).then(result => {
        //     if (result.data)
        //         alert("Success command execution");
        //     else
        //         alert("Command Execute fail")

        //     LoadUser();
        // })

    }



    if (!userData)
        return (<ProfileLayout><div></div></ProfileLayout>)


    console.log(userData.emailConfirmed);

    return (
        <ProfileLayout>
            <h1 style={{ textAlign: 'center' }}>User Information [{email}]</h1>
            <div className="row">
                <div className="col-lg-12">
                    <div className="form-body">
                        <div className="col-lg-12">
                            <div className="form-group">
                                <h3>User Email: {userData.email} Confirmed: {userData.emailConfirmed ? "Yes" : "No"} </h3>
                                <button onClick={() => DoUserCommand(UserAdminCommand.VerifyEmail)} value="Confirm Email" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    )
}