import 'package:gopark_app/user/component/social_login.dart';
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';

class KakaoModel {
  final SocialLogin _socialLogin;
  bool isLogined =false;
  User? user;


  KakaoModel(this._socialLogin);
  Future login() async {
    isLogined =await _socialLogin.login();
    if(isLogined) {
      user = await UserApi.instance.me();
    }
  }
  Future logout() async {
    await _socialLogin.logout();
    isLogined = false;
    user = null;
  }
}