import datetime
import re
import secrets

from flask import jsonify, make_response, render_template, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, reqparse
from werkzeug.security import generate_password_hash

import app
from app.database.models import User, db, People
from app.resources._helpers import get_user, generateConfrimationToken, sendEmail, confirm_token


class UserApi(Resource):
    """
    /api/user
    """

    @jwt_required
    def get(self):
        print(get_jwt_identity())
        user = get_user(get_jwt_identity())
        print(user)

        def mapFunc(value):
            return {
                "first_name": value.first_name,
                "last_name": value.last_name,
                "people_id": value.public_people_id
            }

        people = People.query.filter_by(user_user_id=user.user_id).all()

        print(people)
        return {"username": get_jwt_identity(), "firstName": user.first_name, "lastName": user.last_name,
                "people": list(map(mapFunc, people))}


class ResetPasswordEmailApi(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('email',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",
                            )
        data = parser.parse_args()
        token = generateConfrimationToken(data["email"])
        body = render_template("email_templates/reset_password.html", topic="account", title="Reset your password",
                               domain=app.app.config["FRONTEND_DOMAIN"],
                               dateTime=datetime.datetime.now().strftime('%H:%M:%S on the %d/%m/%Y'),
                               ip=request.remote_addr, platform=request.user_agent.platform,
                               browser=request.user_agent.browser,
                               link=app.app.config["FRONTEND_DOMAIN"] + "/login/" + token)
        sendEmail("Meals password reset", body, [data["email"]])
        return {
            "message": "Reset email sent"
        }


class ResetPasswordApi(Resource):
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('password',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",
                            )
        parser.add_argument('token',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",
                            )
        data = parser.parse_args()
        confirm, email = confirm_token(data["token"])

        if not confirm:
            return make_response(jsonify({
                "msg": {
                    "token": "Invalid token"
                }
            }), 400)

        reg = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{6,20}$"

        # compiling regex
        pat = re.compile(reg)

        # searching regex
        mat = re.search(pat, data["password"])

        # validating conditions
        if not mat:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "Password must be between 6 and 20 characters, have one number, an uppercase and a lowercase letter and at least one symbol"
                },
                "msg": {
                    "password": "Password must be between 6 and 20 characters, have one number, an uppercase and a lowercase letter and at least one symbol"
                }
            }), 400)

        user = User.query.filter_by(email=email).first()
        if not user:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That email address is not associated with an account"
                },
                "msg": {
                    "token": "Invalid token"
                }
            }), 400)
        user.password = generate_password_hash(data["password"], method='sha256')
        db.session.flush()
        db.session.commit()

        return {
            "user_msg": {
                "type": "success",
                "msg": "Your password has been updated"
            },
            "message": "Password updated"
        }


class PeopleApi(Resource):
    @jwt_required
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('first_name',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",

                            )
        parser.add_argument('last_name',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",

                            )

        data = parser.parse_args()
        user = get_user(get_jwt_identity())

        person = People(first_name=data["first_name"], last_name=data["last_name"], user_user_id=user.user_id)
        db.session.add(person)
        # db.session.flush()
        # db.session.refresh(person)
        # user_perople = User_people(user_user_id=user.user_id, people_people_id=person.people_id)
        # db.session.add(user_perople)
        db.session.commit()

        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "{0} {1] has been added".format(data["first_name"], data["last_name"])
            },
            "msg": "user added",
            "person": {
                "first_name": data["first_name"],
                "last_name": data["last_name"],
                "people_id": person.public_people_id
            }
        })

    @jwt_required
    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('people_id',
                            type=str,
                            required=True,
                            help="This field cannot be blank.",
                            location="args"
                            )

        data = parser.parse_args()
        user = get_user(get_jwt_identity())
        person = People.query.filter_by(public_people_id=data["people_id"]).first()
        if not person:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That person does not exist on your account"
                },
                "msg": {
                    "people_id": "Invalid people id"
                }
            }), 400)

        if person.user_user_id != user.user_id:
            return make_response(jsonify({
                "user_msg": {
                    "type": "error",
                    "msg": "That person does not exist on your account"
                },
                "msg": {

                    "people_id": "You dont have access to that"
                }
            }), 400)

        People.query.filter_by(public_people_id=data["people_id"]).delete()
        db.session.commit()
        return jsonify({
            "user_msg": {
                "type": "success",
                "msg": "{0} {1} has been deleted".format(person.first_name, person.last_name)
            },
            "msg": "Person deleted"
        })
