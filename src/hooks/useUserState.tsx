import { BitflexOpenApi } from '../_helpers/BitflexOpenApi';

function setSignIn(token, expiresAt) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('access_token_expiration', expiresAt);

}

function setSignOut() {
    BitflexOpenApi.SignApi.apiVversionSignSignoutDelete("1.0",)
        .finally(() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("access_token_expiration");

            window.location.href = "/terminal"
        })
}

function isSignedIn() {
    const accessToken = localStorage.getItem("access_token");
    const accessTokenExpiry = localStorage.getItem("access_token_expiration");

    if (accessToken === null || accessTokenExpiry === null) return false;

    const currentUnixDatetime = Math.floor(Date.now() / 1000);
    const expirationDataTime = parseInt(accessTokenExpiry);

    if (currentUnixDatetime > expirationDataTime) {
        setSignOut();
        return false;
    }

    return true;
}

export default function useUserState() {
    return { isSignedIn: isSignedIn(), setSignIn: setSignIn, setSignOut: setSignOut };
}