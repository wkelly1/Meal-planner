import authHeader from "./auth-header.js";
import { catchError401 } from "./auth.service";

class UserService {

    async getUser() {
        const headers = await authHeader();

        return fetch("/api/user", {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async getMeal(meal_id) {
        const headers = await authHeader();

        return fetch(`/api/meals?meal_id=${meal_id}`, {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async getMeals(offset, limit, query) {
        const headers = await authHeader();
        return fetch(`/api/meals?limit=${limit}&offset=${offset}&query=${query}`, {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async getMeals(offset, limit) {
        const headers = await authHeader();
        return fetch(`/api/meals?limit=${limit}&offset=${offset}`, {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async setMeal(title, ingredients) {
        const headers = await authHeader();
        return fetch("/api/meals", {
            method: "post",
            headers: headers,
            body: JSON.stringify({
                title: title,
                ingredients: ingredients,
            }),
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async deleteMeal(meal_id) {
        const headers = await authHeader();
        return fetch("/api/meals", {
            method: "DELETE",
            headers: headers,
            body: JSON.stringify({
                meal_id: meal_id
            }),
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async getIngredients(offset, limit) {
        const headers = await authHeader();
        return fetch(`/api/ingredients?limit=${limit}&offset=${offset}`, {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async getIngredients(offset, limit, query) {
        const headers = await authHeader();
        return fetch(`/api/ingredients?limit=${limit}&offset=${offset}&query=${query}`, {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async deleteIngredient(ingredient_id) {
        const headers = await authHeader();
        return fetch("/api/ingredients", {
            method: "DELETE",
            headers: headers,
            body: JSON.stringify({
                ingredient_id: ingredient_id,
            }),
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async setIngredient(name) {
        const headers = await authHeader();
        return fetch("/api/ingredients", {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                name: name,
            }),
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }



    async setCalendar(meal_id, meal_time, date, for_current_user, people) {
        const headers = await authHeader();

        return fetch(`/api/calendar`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                meal_id: meal_id,
                meal_time: meal_time,
                date: date,
                for_current_user: for_current_user,
                people: people
            })
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async getCalendar(week, year) {
        const headers = await authHeader();

        return fetch(`/api/calendar?week=${week}&year=${year}`, {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async deleteCalendar(calendar_id) {
        const headers = await authHeader();

        return fetch(`/api/calendar?calendar_id=${calendar_id}`, {
            method: "DELETE",
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async getShoppingList(year, week) {
        const headers = await authHeader();

        return fetch(`/api/list?year=${year}&week=${week}`, {
            headers: headers,
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async setPeople(first_name, last_name) {
        const headers = await authHeader();
        return fetch(`/api/people`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                first_name: first_name,
                last_name: last_name
            })
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }

    async deletePeople(people_id) {
        const headers = await authHeader();
        return fetch(`/api/people?people_id=${people_id}`, {
            method: "DELETE",
            headers: headers
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
    }
}

export default new UserService();