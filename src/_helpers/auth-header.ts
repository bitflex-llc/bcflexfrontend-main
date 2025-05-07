export function authHeader(fullHeader = true) {
    // return authorization header with jwt token

    const accessToken = localStorage.getItem('access_token');

    if (fullHeader) {

        if (accessToken) {
            return { Authorization: `Bearer ${accessToken}` };
        } else {
            return {};
        }
    }
    else {
        if (accessToken) {
            return accessToken;
        } else {
            return {};
        }
    }
}

export function authToken() {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken)
        return accessToken;
    else return '';
}