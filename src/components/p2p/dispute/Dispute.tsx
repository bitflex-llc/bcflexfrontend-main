

import React, { useState } from 'react';
import { Loading } from 'redoc';

import { Order } from '../../../api-wrapper';
// import DisputeForm from './DisputeForm';
import DisputeNotes from './DisputeNotes';
// import DisputeStatus from './DisputeStatus';
import { LoadingComponent } from '../../LoadingComponent';

interface DisputeParams {
    order: Order;
}

const Dispute = ({ order }: DisputeParams) => {

    const [resolved, setresolved] = useState(false);

    return (
        <div className="p-4 md:p-6 w-full m-auto mb-16">
            <div className="p-8 bg-white rounded-lg border border-slate-200 w-full flex flex-col md:flex-row md:gap-x-10">
                <div className="w-full md:w-1/2">

                    {/* <span>
                        {resolved ? (
                            <DisputeStatus />
                        ) : (
                            <DisputeForm />
                        )}
                    </span> */}
                </div>
                <DisputeNotes />
            </div>
        </div>
    );
};

export default Dispute;