import { Crypt, RSA } from 'hybrid-crypto-js';
import { useEffect, useState } from 'react';

import { GlobalVars } from '../GlobalVars';
import SecureLS from 'secure-ls';
import forge from 'node-forge'

export const useCryptoKeys = (): { publicKey: string, LoadKeys: () => Promise<void>, Decrypt: Function } => {


    const [ls] = useState(new SecureLS({ encodingType: 'rc4', isCompression: false }));




    const LoadKeys = (): Promise<void> => new Promise<void>((resolve, reject) => {
        if (GlobalVars.IsKeyGenerated) return;
        try {
            GlobalVars.IsKeyGenerated = true;

            var privateKey = ls.get('privateKey') as string
            var publicKey = ls.get('publicKey') as string

            if (!privateKey || !publicKey) {

                new Promise((f, r): forge.pki.rsa.KeyPair => forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, pair) => err ? r(err) : f(pair)))
                    .then(keypair => {
                        var parsed = keypair as forge.pki.rsa.KeyPair;
                        const publicKeyPem = forge.pki.publicKeyToRSAPublicKeyPem(parsed.publicKey);
                        const privateKeyPem = forge.pki.privateKeyToPem(parsed.privateKey);
                        ls.set('publicKey', publicKeyPem)
                        ls.set('privateKey', privateKeyPem)

                        return keypair;
                    })
            }
            resolve()
        } catch (e) {
            console.warn("useCryptoKeys -> error", e)
            reject(e)
        }
    })

    const Decrypt = (payload: string): string => {
        try {


            var privateKey = ls.get('privateKey') as string
            var privateKeyPem = forge.pki.privateKeyFromPem(privateKey)


            var decoded = privateKeyPem.decrypt(forge.util.decode64(payload), 'RAW');

            return decoded;
        } catch {
            return payload;
        }

    }

    useEffect(() => {
        LoadKeys();
    }, [])

    return { publicKey: ls.get('publicKey'), LoadKeys: LoadKeys, Decrypt: Decrypt };
};