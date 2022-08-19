const crypto = require('crypto')

class AuthService {

    // challengePair: { verifier: string, challenge: string }
    // state: string
    // config: AuthServiceConfig

    constructor(config) {
        this.config = config
    }

    requestAuthCode() {
        this.challengePair = AuthService.getPKCEChallengePair()
        this.state = AuthService.getState()
        return this.getAuthoriseUrl(this.challengePair, this.state)
    }

    requestAccessCode(callbackUrl) {

        return new Promise((resolve, reject) => {

            if (this.isValidAccessCodeCallBackUrl(callbackUrl)) {

                let authCode = AuthService.getParameterByName('code', callbackUrl)

                if (authCode != null) {

                    let verifier = this.challengePair.verifier
                    let options = this.getTokenPostRequest(authCode, verifier)
                    // TODO: we will need figure out something to do with this
                    return options

                    // return rp(options)
                    //     .then(function (response) {
                    //         //TODO: return / store access code,
                    //         //remove console.log, meant for demonstration purposes only
                    //         console.log('access token.response: ' + JSON.stringify(response));
                    //     })
                    //     .catch(function (err) {
                    //         if (err) throw new Error(err);
                    //     });
                } else {
                    reject('Could not parse the authorization code')
                }

            } else {
                reject('Access code callback url not expected.')
            }
        })
    }

    getAuthoriseUrl() {
        const challengePair = AuthService.getPKCEChallengePair()
        const state = AuthService.getState()
        console.log(challengePair, state)
        return `${this.config.authorizeEndpoint}?scope=${this.config.scope}&state=${state}&client_id=${this.config.clientId}&code_challenge=${challengePair.challenge}&redirect_uri=${this.config.redirectUri}`
    }

    //TODO: Use node sdk here to obtain the token
    getTokenPostRequest(authCode, verifier) {
        return {
            method: 'POST',
            url: this.config.tokenEndpoint,
            headers: { 'content-type': 'application/json' },
            body: `{"grant_type":"authorization_code",
              "client_id": "${this.config.clientId}",
              "code_verifier": "${verifier}",
              "code": "${authCode}",
              "redirect_uri":"${this.config.redirectUri}"
            }`
        };
    }

    isValidAccessCodeCallBackUrl(callbackUrl) {
        return callbackUrl.indexOf(this.config.redirectUri) > -1
    }

    static getPKCEChallengePair() {
        let verifier = AuthService.base64URLEncode(crypto.randomBytes(32));
        let challenge = AuthService.base64URLEncode(AuthService.sha256(verifier));
        return { verifier, challenge };
    }

    static getState() {
        return AuthService.base64URLEncode(crypto.randomBytes(12))
    }

    static getParameterByName(name, url) {

        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    static base64URLEncode(buff) {

        return buff.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    static sha256(val) {
        return crypto.createHash('sha256').update(val).digest();
    }
}

module.exports = {
    AuthService
}
