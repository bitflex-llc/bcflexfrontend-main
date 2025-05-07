import { AdminApi, CoinTokenAddRequest, Configuration, Type } from '../../../api-wrapper';
// import React, { useState } from 'react';

import { BitflexOpenApi } from '../../../_helpers/BitflexOpenApi';
import { ProfileLayout } from '../../ProfileLayout';
import { authToken } from '../../../_helpers/auth-header';
// import { useForm } from 'react-hook-form';

export function CoinTokenAdd() {

    // const { register, handleSubmit, } = useForm();

    // const [isSubmitting, setisSubmitting] = useState(false);

    // const [currencyType, setcurrencyType] = useState<string>('ERC20');

    // const onSubmit = data => {

    //     var addRequest: CoinTokenAddRequest = {
    //         cmcUrl: data.cmcUrl,
    //         currencyType: Type.Erc20,
    //         contractAddress: data.contractAddress,
    //         withdrawFee: data.fee,
    //         withdrawFeePercent: 0

    //     };


    //     BitflexOpenApi.AdminApi.apiVversionAdminAddcointokenPost("1.0", addRequest).then(data => {
    //         setisSubmitting(false);

    //         if (data.data)
    //             alert("Added new coin/token for BTC market")
    //         else
    //             alert("Something wrong")
    //     });
    // }

    return (
        <></>
        // <ProfileLayout>
        //     <h1 style={{ textAlign: 'center' }}>Coin/Token Adding</h1>
        //     <div className="row">
        //         <div className="col-lg-12">

        //             <div className="form-body">
        //                 <div className="col-lg-12">
        //                     <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        //                         <div className="form-group">
        //                             <label className="control-label">CoinMarketCap Url</label>
        //                             <input className='input-form' type="text" placeholder="1156" name="cmcUrl" ref={register({ required: true })} />
        //                         </div>
        //                         <div className="form-group" style={{ fontSize: '22px' }}>
        //                             <label className="control-label">Type</label>
        //                             <br />
        //                             <select
        //                                 name="currencyType"
        //                                 onChange={(e) => { setcurrencyType(e.target.value) }}
        //                                 value={currencyType}>
        //                                 <option value="ERC20" label="ETH ERC20 Token" />
        //                                 <option value="BtcBased" label="Bitcoin-Based" />

        //                             </select>
        //                         </div>

        //                         <div className="form-group" style={{ fontSize: '22px' }}>
        //                             <label className="control-label">Fee Amount Fixed</label>
        //                             <input className='input-form' type="text" name="fee" placeholder="fee" ref={register({ required: true })} />
        //                         </div>

        //                         {currencyType !== "BtcBased" ?
        //                             <div className="form-group" style={{ fontSize: '22px' }}>
        //                                 <label className="control-label">Contract Address</label>
        //                                 <input className='input-form' type="text" name="contractAddress" placeholder="contract Address" ref={register({ required: true })} />
        //                             </div>
        //                             :
        //                             <div>
        //                                 <div className="form-group">
        //                                     <label className="control-label">Decimals</label>
        //                                     <input className='input-form' type="text" placeholder="18" name="decimals" ref={register({ required: true })} />
        //                                 </div>
        //                                 <div className="form-group" style={{ fontSize: '22px' }}>
        //                                     <label className="control-label">Confirmation Count</label>
        //                                     <input className='input-form' type="text" name="confCount" placeholder="Confirmation Count" ref={register({ required: true })} />
        //                                 </div>
        //                                 <div className="form-group" style={{ fontSize: '22px' }}>
        //                                     <label className="control-label">ExplolerUrl</label>
        //                                     <input className='input-form' type="text" name="explolerUrl" placeholder="ExplolerUrl" ref={register({ required: true })} />
        //                                 </div>

        //                                 <div className="form-group" style={{ fontSize: '22px' }}>
        //                                     <label className="control-label">rpcIp</label>
        //                                     <input className='input-form' type="text" name="rpcIp" placeholder="rpcIp" ref={register({ required: true })} />

        //                                 </div>
        //                                 <div className="form-group" style={{ fontSize: '22px' }}>
        //                                     <label className="control-label">rpcPort</label>
        //                                     <input className='input-form' type="text" name="rpcPort" placeholder="rpcPort" ref={register({ required: true })} />

        //                                 </div>
        //                                 <div className="form-group" style={{ fontSize: '22px' }}>
        //                                     <label className="control-label">rpcUser</label>
        //                                     <input className='input-form' type="text" name="rpcUser" placeholder="rpcUser" ref={register({ required: true })} />
        //                                 </div>
        //                                 <div className="form-group" style={{ fontSize: '22px' }}>
        //                                     <label className="control-label">Rpc Password</label>
        //                                     <input className='input-form' type="text" name="rpcPassword" placeholder="rpcPassword" ref={register({ required: true })} />
        //                                 </div>
        //                             </div>
        //                         }
        //                         <div className="form-actions">
        //                             <input type="submit" className="btn btn-lg green-jungle btn-outline" value={!isSubmitting ? 'Add Coin Token' : 'Enabling...'} disabled={isSubmitting} />
        //                         </div>
        //                     </form>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </ProfileLayout>
    )
}