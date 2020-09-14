from functools import wraps

from flask import request
from flask_jwt_extended import jwt_refresh_token_required, get_jwt_identity, create_access_token, create_refresh_token
from flask_restful import Resource, reqparse
from werkzeug.security import generate_password_hash, check_password_hash

import app
from app.database.models import User, db


class SignupApi(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('username',
                        type=str,
                        required=True,
                        help="This field cannot be blank."
                        )
    parser.add_argument('email',
                        type=str,
                        required=True,
                        help="This field cannot be blank."
                        )
    parser.add_argument('first_name',
                        type=str,
                        required=True,
                        help="This field cannot be blank."
                        )
    parser.add_argument('last_name',
                        type=str,
                        required=True,
                        help="This field cannot be blank."
                        )
    parser.add_argument('password',
                        type=str,
                        required=True,
                        help="This field cannot be blank."
                        )

    def post(self):
        data = self.parser.parse_args()
        user = User.query.filter_by(
            email=data["email"]).first()  # if this returns a user, then the email already exists in database

        if user:
            return {'message': "Email already registered!"}, 401

        user = User(email=data["email"], username=data["username"],
                    password=generate_password_hash(data["password"], method='sha256'), first_name=data["first_name"],
                    last_name=
                    data["last_name"])
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=user.username, fresh=True)
        refresh_token = create_refresh_token(user.username)
        return {
                   'access_token': access_token,
                   'refresh_token': refresh_token
               }, 200


class LoginApi(Resource):
    parser = reqparse.RequestParser()
    parser.add_argument('username',
                        type=str,
                        required=True,
                        help="This field cannot be blank."
                        )
    parser.add_argument('password',
                        type=str,
                        required=True,
                        help="This field cannot be blank."
                        )

    def post(self):
        data = self.parser.parse_args()
        print(data['username'], data['password'])
        user = User.query.filter_by(username=data['username']).first()  # .find_by_username(data['username'])

        if user and check_password_hash(user.password, data['password']):
            access_token = create_access_token(identity=user.username, fresh=True)
            refresh_token = create_refresh_token(user.username)
            print(app.app.config["JWT_ACCESS_TOKEN_EXPIRES"])
            return {
                       'access_token': access_token,
                       'refresh_token': refresh_token,
                       'expiry_time': app.app.config["JWT_ACCESS_TOKEN_EXPIRES"].seconds * 1000
                   }, 200

        return {'message': "Invalid Credentials!"}, 401


class TokenRefresh(Resource):
    @jwt_refresh_token_required
    def post(self):
        # retrive the user's identity from the refresh token using a Flask-JWT-Extended built-in method
        current_user = get_jwt_identity()
        # return a non-fresh token for the user
        new_token = create_access_token(identity=current_user, fresh=False)
        new_refresh_token = create_refresh_token(current_user)
        print(request.headers.get('Authorization'))
        print({
            'access_token': new_token,
            'refresh_token': new_refresh_token,
            'expiry_time': app.app.config["JWT_ACCESS_TOKEN_EXPIRES"].seconds * 1000
        })
        return {
            'access_token': new_token,
            'refresh_token': new_refresh_token,
            'expiry_time': app.app.config["JWT_ACCESS_TOKEN_EXPIRES"].seconds * 1000
        }


def auth_token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)

    return decorated_function
