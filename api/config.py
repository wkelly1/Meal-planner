import datetime
import os



class Config(object):
    pwd = os.environ.get("SQL_PASS")
    SQLALCHEMY_DATABASE_URI = 'mysql://root:' + pwd + '@localhost/mealsv2'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_TOKEN_LOCATION = ('headers',)
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'
    JWT_ACCESS_TOKEN_EXPIRES = datetime.timedelta(seconds=15)
    SECRET_KEY = os.environ.get("SECRET_KEY")
    FRONTEND_DOMAIN = "127.0.0.1:3000"
    SECURITY_PASSWORD_SALT = os.environ.get("SECURITY_PASSWORD_SALT")


    # EMAIL SETTINGS
    MAIL_SERVER = 'smtp.zoho.eu'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD")
    MAIL_SUPPRESS_SEND = False
    MAIL_ENABLE_WHITELIST = True
    MAIL_WHITELIST = os.environ.get("EMAIL_WHITELIST").split(",")  # Set this to emails that you own to stop emails from being sent to random accounts


class Development(Config):
    DEBUG = True
    TEMPLATES_AUTO_RELOAD = True