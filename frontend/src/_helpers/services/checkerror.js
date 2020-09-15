import { catchError401 } from "./auth.service";

export default async function CheckError(response) {
    const data = await response.json();
    if (!response.ok) {
        
        let error;
        if (data && data.user_msg) {
            error = {
                response: true,
                data: data.user_msg
            }
        } else {
            error = {
                response: false,
                data: response.statusText
            }

        }

        return Promise.reject(error);
    }

    catchError401(response.status);
    return data;
}