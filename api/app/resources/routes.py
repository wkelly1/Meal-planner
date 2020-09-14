from .auth import SignupApi, LoginApi, TokenRefresh
from .meals import Meals, Ingredients, Calendar, ShoppingListApi
from .user import UserApi, PeopleApi, ResetPasswordEmailApi, ResetPasswordApi


def initialize_routes(api):
    api.add_resource(SignupApi, '/api/auth/signup')
    api.add_resource(LoginApi, '/api/auth/login')
    api.add_resource(TokenRefresh, '/api/auth/refresh')
    api.add_resource(UserApi, '/api/user')
    api.add_resource(ResetPasswordEmailApi, '/api/user/password/reset/get')
    api.add_resource(ResetPasswordApi, '/api/user/password/reset')
    api.add_resource(Meals, '/api/meals')
    api.add_resource(Ingredients, '/api/ingredients')
    api.add_resource(Calendar, '/api/calendar')
    api.add_resource(ShoppingListApi, '/api/list')
    api.add_resource(PeopleApi, '/api/people')


