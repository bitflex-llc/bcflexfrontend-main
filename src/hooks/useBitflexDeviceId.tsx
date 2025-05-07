import { useEffect, useState } from 'react';

import SecureLS from 'secure-ls';
import { v4 as uuidv4 } from 'uuid';

export const useBitflexDeviceId = (): { bitflexDeviceId: string } => {
    const [ls] = useState(new SecureLS({ encodingType: 'rc4', isCompression: false }));

    useEffect(() => {
        if (!ls.get('bitflexDeviceId')) {
            ls.set('bitflexDeviceId', uuidv4())
        }
    }, []);

    return { bitflexDeviceId: ls.get('bitflexDeviceId') };
};