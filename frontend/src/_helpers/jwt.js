import history from "../history";

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


    //console.log(jwt);
    //console.log(mealsRefined.splice(mealTempIndex, 1))
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
            //catchError401(response.status);
            return response.json();
        })
        .then((value) => {
            //console.log(value);
            setJwt(value.access_token, value.refresh_token, value.expiry_time);

            return true;
        })
        .catch((error) => {
            console.error(error);

            removeJwt();
            history.push("/Login");
            return false;
        });


}

export async function catchError401(status) {
    if (status === 401) {
        await updateToken();
    }

}

export function logout() {
    removeJwt();
    history.push("/Login");
}
