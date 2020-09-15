from flask import jsonify, request, make_response
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, reqparse, inputs

from app.database.models import Meal, Meal_ingredient, Ingredient, Calendar_people, People
from app.database.models import Calendar as Cal
from app.resources._helpers import get_user
from extensions import db, database
from sqlalchemy import extract


class Meals(Resource):
    @jwt_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('limit',
                            type=int,
                            required=False,
                            help="This field cannot be blank.",
                            location="args"
                            )
        parser.add_argument('offset',
                            type=int,
                            required=False,
                            help="This field cannot be blank.",
                            location="args"
                            )
        parser.add_argument('query',
                            type=str,
                            required=False,
                            help="This field cannot be blank.",
                            location="args"
                            )
        parser.add_argument('meal_id',
                            type=str,
                            required=False,
                            help="This field cannot be blank.",
                            location="args"
                            )
        data = parser.parse_args()

        user = get_user(get_jwt_identity())
        if data["meal_id"]:
            meals = Meal.query.filter_by(public_meal_id=data["meal_id"]).first()
        else:

            if not (data["limit"] is not None and data["offset"] is not None):
                return {
                    "user_msg": {
                        "type": "error",
                        "msg": "Something went wrong"
                    },
                    "message": {
                        "limit": "This field cannot be blank",
                        "offset": "This field cannot be blank"
                    }
                }
            if data["query"]:
                meals = Meal.query.outerjoin(Cal, Cal.meal_meal_id==Meal.meal_id).add_columns(db.func.count(Cal.calendar_id)).filter(Meal.user_user_id==user.user_id).filter(
                    Meal.title.like('%' + data["query"] + '%')).group_by(Cal.calendar_id).order_by(db.func.count(Cal.calendar_id)).limit(data["limit"]).offset(
                    data["offset"]).all()
            else:
                meals = Meal.query.outerjoin(Cal, Cal.meal_meal_id==Meal.meal_id).add_columns(db.func.count(Cal.calendar_id)).filter(Meal.user_user_id==user.user_id).group_by(Cal.calendar_id).order_by(db.func.count(Cal.calendar_id)).limit(
                    data["limit"]).offset(data["offset"]).all()
                print(Meal.query.outerjoin(Cal, Cal.meal_meal_id==Meal.meal_id).add_columns(db.func.count(Cal.calendar_id)).filter(Meal.user_user_id==user.user_id).group_by(Cal.calendar_id).order_by(db.func.count(Cal.calendar_id)).limit(
                    data["limit"]).offset(data["offset"]))
            print(meals)


        def ingredientMapFunc(value):
            return {
                "name": value[1],
                "quantity": value[0].quantity,
                "unit": value[0].unit
            }

        def mealMapFunc(value):
            ingredient = Meal_ingredient.query.join(Ingredient).add_columns(Ingredient.name).filter(
                Meal_ingredient.meal_meal_id == value[0].meal_id).all()
            print(ingredient)
            return {
                "title": value[0].title,
                "meal_id": value[0].public_meal_id,
                "ingredients": list(map(ingredientMapFunc, ingredient)),
                "usages": value[1]
            }

        print(meals)
        if data["meal_id"]:
            ingredient = Meal_ingredient.query.join(Ingredient).add_columns(Ingredient.name).filter(
                Meal_ingredient.meal_meal_id == meals.meal_id).all()
            return {
                "user_msg": {
                    "type": "success",
                    "msg": ""
                },
                "title": meals.title,
                "meal_id": meals.public_meal_id,
                "ingredients": list(map(ingredientMapFunc, ingredient))
            }

        return {
            "user_msg": {
                "type": "success",
                "msg": ""
            },
            "meals": list(map(mealMapFunc, meals))
        }, 200

    @jwt_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('title',
                            type=str,
                            required=True,
                            help="This field cannot be blank."
                            )
        parser.add_argument('ingredients', action='append')
        data = parser.parse_args()
        ingredients = request.get_json().get("ingredients")
        user = get_user(get_jwt_identity())

        meal = Meal(title=data["title"], user_user_id=user.user_id)
        db.session.add(meal)
        db.session.flush()
        db.session.refresh(meal)
        ingredients_final = []
        if len(ingredients) == 0:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "A meal must have at least one ingredient"
                },
                "msg": {
                    "ingredient": "A meal must have at least one ingredient"
                }
            }), 400)

        if len(data["title"]) == 0:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "Meals need to have a title"
                },
                "msg": {
                    "title": "A title is required for the meal"
                }
            }), 400)
        for i in ingredients:
            ingredient = Ingredient.query.filter_by(public_ingredient_id=i["ingredient_id"]).first()
            print(type(i["quantity"]))
            if not ingredient or ingredient.user_user_id != user.user_id or not i["quantity"] or type(
                    i["quantity"]) != int:
                print("here")
                return make_response(jsonify({
                    "user_msg": {
                        "type": "error",
                        "msg": "Ingredients must have a quantity and must be on your account"
                    },
                    "msg": {
                        "ingredient": "One or more of your ingredients has a problem"
                    }
                }), 400)
            ingredients_final.append(
                Meal_ingredient(meal_meal_id=meal.meal_id, ingredient_ingredient_id=ingredient.ingredient_id,
                                quantity=i["quantity"], unit=i["unit"]))

        db.session.add_all(ingredients_final)
        db.session.commit()

        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "Your meal has been added"
            },
            "msg": "meal added"
        })

    @jwt_required
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('meal_id',
                            type=str,
                            required=True,
                            help="This field cannot be blank."
                            )

        data = parser.parse_args()
        user = get_user(get_jwt_identity())
        meal = Meal.query.filter_by(public_meal_id=data["meal_id"]).first()
        if not meal:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That meal does not exist"
                },
                "msg": {
                    "meal_id": "Invalid meal id"
                }
            }), 400)

        if meal.user_user_id != user.user_id:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That meal does not exist"
                },
                "msg": {
                    "meal_id": "Invalid meal id"
                }
            }), 400)

        Meal.query.filter_by(public_meal_id=data["meal_id"]).delete()
        db.session.commit()
        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "Meal has been deleted"
            },
            "msg": "Meal deleted"
        })


class Ingredients(Resource):
    @jwt_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('limit',
                            type=int,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )
        parser.add_argument('offset',
                            type=int,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )
        parser.add_argument('query',
                            type=str,
                            location="args"
                            )
        data = parser.parse_args()

        user = get_user(get_jwt_identity())

        if data["query"]:
            ingredients = Ingredient.query.filter_by(user_user_id=user.user_id).filter(
                Ingredient.name.like('%' + data["query"] + '%')).order_by(Ingredient.name.asc()).limit(
                data["limit"]).offset(data["offset"]).all()
        else:
            ingredients = Ingredient.query.filter_by(user_user_id=user.user_id).order_by(Ingredient.name.asc()).limit(
                data["limit"]).offset(
                data["offset"]).all()

        def ingredientMapFunc(value):
            return {
                "name": value.name,
                "ingredient_id": value.public_ingredient_id
            }

        print({
            "ingredients": list(map(ingredientMapFunc, ingredients))
        })
        return {
            "user_msg": {
                "type": "success",
                "msg": ""
            },
            "ingredients": list(map(ingredientMapFunc, ingredients))
        }

    @jwt_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name',
                            type=str,
                            required=True,
                            help="This field cannot be blank."
                            )

        data = parser.parse_args()

        user = get_user(get_jwt_identity())

        ingredient = Ingredient(name=data["name"], user_user_id=user.user_id)
        db.session.add(ingredient)
        db.session.commit()

        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "{0} has been added".format(data["name"])
            },
            "msg": "ingredient added",
            "ingredient": {
                "name": ingredient.name,
                "ingredient_id": ingredient.public_ingredient_id
            }
        })

    @jwt_required
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('ingredient_id',
                            type=str,
                            required=True,
                            help="This field cannot be blank."
                            )

        data = parser.parse_args()
        user = get_user(get_jwt_identity())
        ingredient = Ingredient.query.filter_by(public_ingredient_id=data["ingredient_id"]).first()
        if not ingredient:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That ingredient does not exist"
                },
                "msg": {
                    "ingredient_id": "Invalid ingredient id"
                }
            }), 400)

        if ingredient.user_user_id != user.user_id:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That ingredient does not exist"
                },
                "msg": {
                    "ingredient_id": "Invalid ingredient id"
                }
            }), 400)

        Ingredient.query.filter_by(public_ingredient_id=data["ingredient_id"]).delete()
        db.session.commit()
        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "{0} has been deleted".format(ingredient.name)
            },
            "msg": "Ingredient deleted"
        })


def CalendarMealTimeOptions(value):
    if value not in ["breakfast", "lunch", "dinner"]:
        raise ValueError("Value needs to be breakfast lunch or dinner")

    return value


class Calendar(Resource):
    @jwt_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('week',
                            type=int,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )
        parser.add_argument('year',
                            type=int,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )

        data = parser.parse_args()
        user = get_user(get_jwt_identity())

        calendar = Cal.query.outerjoin(Calendar_people).join(Meal).outerjoin(People).add_columns(Meal.title,
                                                                                                 People.first_name,
                                                                                                 People.last_name,
                                                                                                 People.public_people_id,Meal.public_meal_id).filter(
            extract('year', Cal.date) == data["year"]).filter(db.func.week(Cal.date, 7) == data["week"]).filter(
            Cal.user_user_id == user.user_id).order_by(Cal.date.asc()).all()
        print(calendar)
        tempDict = {}
        for i in calendar:
            if i[0].calendar_id not in tempDict.keys():
                if not (i[2] and i[3] and i[4]):
                    people = []
                else:
                    people = [{
                        "first_name": i[2],
                        "last_name": i[3]
                    }]

                tempDict[i[0].calendar_id] = {
                    "date": str(i[0].date),
                    "meal_time": str(list(i[0].meal_time)[0]),
                    "meal_id": i[5],
                    "meal_title": i[1],
                    "for_current_user": i[0].for_current_user,
                    "people": people,
                    "calendar_id": i[0].public_calendar_id
                }
            else:
                if i[2] and i[3] and i[4]:
                    tempDict[i[0].calendar_id]["people"].append(
                        {
                            "first_name": i[2],
                            "last_name": i[3]
                        }
                    )

        return {
            "user_msg": {
                "type": "success",
                "msg": ""
            },
            "calendar": list(tempDict.values())
        }

    @jwt_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('date',
                            type=inputs.date,
                            required=True,
                            help="This field cannot be blank.",

                            )
        parser.add_argument('meal_time',
                            type=CalendarMealTimeOptions,
                            required=True,
                            help="This field cannot be blank.",

                            )
        parser.add_argument('meal_id',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",
                            )
        parser.add_argument('people',
                            type=str,
                            required=False,
                            action='append',
                            help="This field cannot be blank.",
                            )
        parser.add_argument('for_current_user',
                            type=bool,
                            required=True,
                            help="This field cannot be blank.",
                            )
        data = parser.parse_args()
        print(data["for_current_user"])
        meal_id = Meal.query.filter_by(public_meal_id=data["meal_id"]).first()
        if not meal_id:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That meal does not exist"
                },
                "msg": {
                    "meal_id": "Invalid meal id"
                }
            }), 400)

        user = get_user(get_jwt_identity())

        database.connect()
        database.execute("SELECT meal_time, people.public_people_id, for_current_user "
                         "FROM calendar "
                         "LEFT JOIN calendar_people c on c.calendar_calendar_id = calendar.calendar_id "
                         "LEFT JOIN people on people.people_id = c.people_people_id "
                         "WHERE calendar.date = %s "
                         "AND calendar.user_user_id = %s "
                         "AND meal_time = %s",
                         (data["date"], user.user_id, data["meal_time"]))

        # calendarCheck = db.session.query(Calendar_people, Cal).join(Cal, Cal.calendar_id==Calendar_people.calendar_calendar_id).join(People).join(User_people).add_columns(People.public_people_id).filter(User_people.user_user_id==user.user_id).filter(Cal.date==data["date"]).all()
        calendarCheck = database.getAll()
        if len(calendarCheck) > 0:
            if data["people"]:
                def getPeopleMapFunc(value):
                    return value[1]

                people = map(getPeopleMapFunc, calendarCheck)
                if len(set(data["people"]).intersection(set(people))) > 0:
                    return make_response(jsonify({
                        "user_msg": {
                            "type": "error",
                            "msg": "You have already planned a meal for one of those people at that time"
                        },
                        "msg": {
                            "meal_time": "You have already planned a meal for one of those people at that time"
                        }
                    }), 400)

        if data["for_current_user"]:
            if any(value[2] for value in calendarCheck):
                return make_response(jsonify({
                    "user_msg": {
                        "type": "error",
                        "msg": "You have already planned a meal for yourself at that time"
                    },
                    "msg": {
                        "meal_time": "You have already planned a meal for the current user at that time"
                    }
                }), 400)

        calendar = Cal(date=data["date"], meal_time=data["meal_time"], meal_meal_id=meal_id.meal_id,
                       user_user_id=user.user_id, for_current_user=data["for_current_user"])
        db.session.add(calendar)
        db.session.flush()
        db.session.refresh(calendar)
        people = []
        if data["people"]:
            for i in data["people"]:
                person = People.query.filter_by(public_people_id=i).first()
                if not person:
                    return make_response(jsonify({
                        "user_msg": {
                            "type": "error",
                            "msg": "That person does not exist"
                        },
                        "msg": {
                            "people_id": "Invalid people_id"
                        }
                    }), 400)
                people.append({"first_name": person.first_name, "last_name": person.last_name})
                calendar_people = Calendar_people(people_people_id=person.people_id,
                                                  calendar_calendar_id=calendar.calendar_id)
                db.session.add(calendar_people)

        db.session.commit()
        print({
            "date": str(calendar.date),
            "meal_time": str(calendar.meal_time),
            "meal_id": calendar.public_calendar_id,
            "meal_title": meal_id.title
        })

        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "Meal added to your calendar"
            },
            "msg": "Calendar added",
            "data": {
                "date": str(calendar.date),
                "meal_time": str(list(calendar.meal_time)[0]),
                "meal_id": meal_id.public_meal_id,
                "meal_title": meal_id.title,
                "for_current_user": data["for_current_user"],
                "people": people,
                    "calendar_id": calendar.public_calendar_id
            }
        })

    @jwt_required
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('calendar_id',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )

        data = parser.parse_args()
        user = get_user(get_jwt_identity())
        calendar = Cal.query.filter_by(public_calendar_id=data["calendar_id"]).first()
        if not calendar:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That calendar item does not exist"
                },
                "msg": {
                    "calendar_id": "Invalid calendar id"
                }
            }), 400)

        if calendar.user_user_id != user.user_id:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That calendar item does not exist"
                },
                "msg": {
                    "calendar_id": "You dont have access to that"
                }
            }), 400)

        Cal.query.filter_by(public_calendar_id=data["calendar_id"]).delete()
        db.session.commit()
        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "That calendar item has been deleted"
            },
            "msg": "Calendar deleted"
        })


class ShoppingListApi(Resource):
    @jwt_required
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('week',
                            type=int,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )
        parser.add_argument('year',
                            type=int,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )

        data = parser.parse_args()
        user = get_user(get_jwt_identity())

        database.connect(dictionary=True)
        database.execute("SELECT name, sum(quantity) as quantity, unit "
                         "FROM calendar "
                         "INNER JOIN meal on calendar.meal_meal_id = meal.meal_id "
                         "INNER JOIN meal_ingredient on meal.meal_id = meal_ingredient.meal_meal_id "
                         "INNER JOIN ingredient on meal_ingredient.ingredient_ingredient_id = ingredient.ingredient_id "
                         "WHERE calendar.user_user_id = %s "
                         "AND YEAR(date) = %s "
                         "AND WEEK(date, 7) = %s "
                         "GROUP BY name ",
                         (user.user_id, data["year"], data["week"]))
        data = database.getAll()
        def mapFunc(value):
            return {
                "name": value["name"],
                "quantity": int(value["quantity"]),
                "unit": value["unit"]
            }
        return {
            "user_msg": {
                "type": "success",
                "msg": ""
            },
            "shopping_list": list(map(mapFunc, data))
        }

