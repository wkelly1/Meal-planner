from flask import Flask
from flask_jwt_extended import JWTManager
from flask_restful import Api
from flask_cors import CORS

from app.resources.routes import initialize_routes
from config import Development
from extensions import db, api, cors, jwt, mail


def create_app(config_object=Development):
    app = Flask(__name__)
    app.config.from_object('config.Development')
    register_extensions(app)

    return app


def register_extensions(app):
    initialize_routes(api)
    db.init_app(app)
    api.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    jwt.init_app(app)
    mail.init_app(app)

app = create_app()
