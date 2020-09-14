import { getJwt, isAuthenticated, updateToken } from "./auth.service";

export default async function authHeader() {
    if (!isAuthenticated()) {
        await updateToken();
    }

    const jwt = getJwt();

    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
    }
}