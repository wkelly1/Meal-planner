import datetime
import uuid

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID

from extensions import db

from sqlalchemy.dialects.mysql import SET

class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True)
    username = db.Column(db.String(20), unique=True)
    password = db.Column(db.String(300))
    first_name = db.Column(db.String(20))
    last_name = db.Column(db.String(20))

    def get_id(self):
        return self.user_id

class Meal(db.Model):
    __tablename__ = 'meal'
    meal_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    public_meal_id = db.Column(db.String(255), default=uuid.uuid4, unique=True, nullable=False)
    user_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))

class Meal_ingredient(db.Model):
    __tablename__ = 'meal_ingredient'
    meal_meal_id = db.Column(db.Integer, db.ForeignKey('meal.meal_id'), primary_key=True)
    ingredient_ingredient_id = db.Column(db.Integer, db.ForeignKey('ingredient.ingredient_id'), primary_key=True)
    quantity = db.Column(db.Integer)
    unit = db.Column(db.String(10))

class Ingredient(db.Model):
    __tablename__ = 'ingredient'
    ingredient_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    public_ingredient_id = db.Column(db.String(255), default=uuid.uuid4, unique=True, nullable=False)
    user_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))


class Calendar(db.Model):
    __tablename__ = 'calendar'
    calendar_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    meal_time = db.Column(SET('breakfast', 'lunch', 'dinner', 'supper'))
    public_calendar_id = db.Column(db.String(255), default=uuid.uuid4, unique=True, nullable=False)
    user_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    meal_meal_id = db.Column(db.Integer, db.ForeignKey('meal.meal_id'))
    for_current_user = db.Column(db.Boolean, nullable=False)

    def __hash__(self):
        return id(self)

class User_people(db.Model):
    __tablename__ = 'user_people'
    user_user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), primary_key=True)
    people_people_id = db.Column(db.Integer, db.ForeignKey('people.people_id'), primary_key=True)


class Calendar_people(db.Model):
    __tablename__ = 'calendar_people'
    calendar_calendar_id = db.Column(db.Integer, db.ForeignKey('calendar.calendar_id'), primary_key=True)
    people_people_id = db.Column(db.Integer, db.ForeignKey('people.people_id'), primary_key=True)


class People(db.Model):
    people_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(20))
    last_name = db.Column(db.String(20))
    public_people_id = db.Column(db.String(255), default=uuid.uuid4, unique=True, nullable=False)


