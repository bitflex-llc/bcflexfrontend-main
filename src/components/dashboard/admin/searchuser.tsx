import { AdminApi, Configuration } from '../../../api-wrapper';
import React, { useState } from 'react';

import { NavLink } from 'react-router-dom';
import { ProfileLayout } from '../../ProfileLayout';
import { authToken } from '../../../_helpers/auth-header';

export default function SearchUser() {

    const [userSearchResult, setuserSearchResult] = useState<Array<string>>([]);

    function onChangeEmail(e) {

        var config = new Configuration({ apiKey: "Bearer " + authToken() })
        var apiInstance = new AdminApi(config, process.env.NODE_ENV === "production" ? "https://api.bcflex.com" : "http://127.0.0.1:5000");


        apiInstance.apiVversionAdminSearchuserGet("1.0", e.target.value).then(result => {
            setuserSearchResult(result.data)
        })
    }

    return (
        <ProfileLayout>
            <h1 style={{ textAlign: 'center' }}>Search for User</h1>
            <div className="row">
                <div className="col-lg-12">
                    <div className="form-body">
                        <div className="col-lg-12">
                            <div className="form-group">
                                <label className="control-label">Start Typing User Email</label>
                                <input className='input-form' type="text" placeholder="User email..." onChange={onChangeEmail} />

{/* 
                                {userSearchResult.length > 0 &&
                                    <>
                                        <h3>Top 10 results:</h3>
                                        {userSearchResult.map(email => {
                                            var linkToUser = '/admin/edituser/' + email;
                                            return <div>
                                                <NavLink to={linkToUser} activeClassName="active">
                                                    {email}
                                                </NavLink>

                                            </div>
                                        })}
                                    </>
                                } */}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProfileLayout>
    )
}