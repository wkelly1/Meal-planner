import authHeader from "./auth-header.js";
import { catchError401 } from "./auth.service";
import CheckError from "./checkerror.js";

class UserService {

    async getUser() {
        const headers = await authHeader();

        return fetch("/api/user", {
            headers: headers,
        })
            .then(CheckError)
    }

    async getMeal(meal_id) {
        const headers = await authHeader();

        return fetch(`/api/meals?meal_id=${meal_id}`, {
            headers: headers,
        })
            .then(CheckError)
    }
    /*eslint no-dupe-class-members: 0*/
    async getMealsWithQuery(offset, limit, query) {
        console.log("DOING THIS");
        const headers = await authHeader();
        return fetch(`/api/meals?limit=${limit}&offset=${offset}&query=${query}`, {
            headers: headers,
        })
            .then(CheckError)
    }

    async getMeals(offset, limit) {
        const headers = await authHeader();
        return fetch(`/api/meals?limit=${limit}&offset=${offset}`, {
            headers: headers,
        })
            .then(CheckError)
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
        .then(CheckError)
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
            .then(CheckError)
    }

    async getIngredients(offset, limit) {
        const headers = await authHeader();
        return fetch(`/api/ingredients?limit=${limit}&offset=${offset}`, {
            headers: headers,
        })
            .then(CheckError)
    }

    async getIngredientsWithQuery(offset, limit, query) {
        const headers = await authHeader();
        return fetch(`/api/ingredients?limit=${limit}&offset=${offset}&query=${query}`, {
            headers: headers,
        })
            .then(CheckError)
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
            .then(CheckError)
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
            .then(CheckError)
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
            .then(CheckError)
    }

    async getCalendar(week, year) {
        const headers = await authHeader();

        return fetch(`/api/calendar?week=${week}&year=${year}`, {
            headers: headers,
        })
            .then(CheckError)
    }

    async deleteCalendar(calendar_id) {
        const headers = await authHeader();

        return fetch(`/api/calendar?calendar_id=${calendar_id}`, {
            method: "DELETE",
            headers: headers,
        })
            .then(CheckError)
    }

    async getShoppingList(year, week) {
        const headers = await authHeader();

        return fetch(`/api/list?year=${year}&week=${week}`, {
            headers: headers,
        })
            .then(CheckError)
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
            .then(CheckError)
    }

    async deletePeople(people_id) {
        const headers = await authHeader();
        return fetch(`/api/people?people_id=${people_id}`, {
            method: "DELETE",
            headers: headers
        })
            .then(CheckError)
    }
}

export default new UserService();