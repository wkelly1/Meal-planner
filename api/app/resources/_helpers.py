from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer

from app.database.models import User
from threading import Thread
import app
from extensions import mail


def get_user(username):
    user = User.query.filter_by(
        username=username).first()  # if this returns a user, then the email already exists in database

    if not user:
        return {'message': "User does not exist"}, 401

    return user



def async_send_mail(app, msg):
    with app.app.app_context():
        mail.send(msg)

def sendEmail(subject, htmlBody, recipients):
    """
    Method sends an email but first checks whether emails are enabled in the configuration
    :param subject: Emails subject
    :param htmlBody: Emails body written with HTML
    :param recipients: Array of the emails to send too
    :return: True if no errors and false if error
    """
    if not app.app.config["MAIL_SUPPRESS_SEND"]:


        finalRecipients = []
        if app.app.config["MAIL_ENABLE_WHITELIST"]:


            # Adds only the emails that are in the whitelist to the final recipients array
            for i in recipients:
                if i in app.app.config["MAIL_WHITELIST"]:
                    finalRecipients.append(i)
        else:
            finalRecipients = recipients

        try:
            msg = Message(subject,
                          sender=app.app.config["MAIL_USERNAME"],
                          recipients=finalRecipients)
            msg.html = htmlBody
            mail.send(msg)  # Send mail

            thr = Thread(target=async_send_mail, args=[app, msg])
            thr.start()
            return thr
        except Exception as e:
            print(str(e))
            return False
    else:
        return True


def generateConfrimationToken(email):
    serializer = URLSafeTimedSerializer(app.app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.app.config['SECURITY_PASSWORD_SALT'])

def confirm_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(app.app.config['SECRET_KEY'])
    try:
        if expiration:
            email = serializer.loads(
                token,
                salt=app.app.config['SECURITY_PASSWORD_SALT'],
                max_age=expiration
            )
        else:
            email = serializer.loads(
                token,
                salt=app.app.config['SECURITY_PASSWORD_SALT']
            )
    except:
        return False, token
    return True, email

