import history from "../../history";

export const getJwt = () => {
    return localStorage.getItem("x-access-token")

};

const getRefresh = () => {
    return localStorage.getItem("refresh-token");

};

export function setJwt(access_token, refresh_token, expiry) {
    localStorage.setItem("x-access-token", access_token);
    localStorage.setItem("refresh-token", refresh_token);
    localStorage.setItem("x-access-token-expiration", Date.now() + expiry);
}

/*function setJwtWithoutRefresh(access_token, expiry) {
    localStorage.setItem("x-access-token", access_token);
    localStorage.setItem("x-access-token-expiration", Date.now() + expiry);
    window.location.reload(false);
}*/

export function removeJwt() {
    localStorage.removeItem("x-access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("x-access-token-expiration");
}

export function isAuthenticated() {
    //console.log(Date.now(),localStorage.getItem("x-access-token-expiration"), Date.now()>localStorage.getItem("x-access-token-expiration"));
    return (!!localStorage.getItem("x-access-token") && !(Date.now() > localStorage.getItem("x-access-token-expiration")));
}

export function updateToken() {
    const jwt = getRefresh();
    if (!jwt) {
        removeJwt();
        history.push("/login");
    }
    //console.log("Refresh token:", jwt);
    return fetch("/api/auth/refresh", {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
        },
    })
        .then((response) => {
            if (response.status === 400) {
                throw new Error("Error 400");
            }

            return response.json();
        })
        .then((value) => {
            //console.log(value.access_token, value.refresh_token, value.expiry_time);
            setJwt(value.access_token, value.refresh_token, value.expiry_time);

            return true;
        })
        .catch((error) => {
            //console.error(error);

            removeJwt();
            history.push("/login");
            return false;
        });


}

export async function catchError401(status) {
    if (status === 401) {
        await updateToken();
        //history.go(0);
    }

}

export function logout() {
    removeJwt();
    history.push("/Login");
}

class AuthService {
    async login(username, password) {
        return fetch(`/api/auth/login`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async sendPasswordResetEmail(email) {
        return fetch("/api/user/password/reset/get", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email
            })
        })
            .then((response) => {

                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async resetPassword(password, token) {
        console.log("HERE");
        return fetch("/api/user/password/reset", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password: password,
                token: token
            })
        })
            .then((response) => {

                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })

    }
}

export default new AuthService();