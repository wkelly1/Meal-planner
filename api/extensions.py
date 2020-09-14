import os

from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

from app.database.databaseConnect import DatabaseConnection

db = SQLAlchemy()
api = Api()
cors = CORS()
jwt = JWTManager()
database = DatabaseConnection('127.0.0.1', 'root', os.environ.get("SQL_PASS"), "mealsv2")
mail = Mail()