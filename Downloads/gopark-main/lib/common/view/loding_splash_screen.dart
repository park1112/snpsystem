import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/const/data.dart';
import 'package:gopark_app/common/view/root_tab.dart';
import 'package:gopark_app/common/view/splash_screen.dart';
import 'package:gopark_app/user/view/login_screen.dart';
import 'package:go_router/go_router.dart';

class LodingSplashScreen extends StatefulWidget {
  static String get routeName => 'loding';
  const LodingSplashScreen({Key? key}) : super(key: key);

  @override
  State<LodingSplashScreen> createState() => _LodingSplashScreenState();
}

class _LodingSplashScreenState extends State<LodingSplashScreen> {

  final storage = FlutterSecureStorage();

  void initState() {
    super.initState();
    checkToken();
  }

  void checkToken() async {
    final accessToken = await storage.read(key: ACCESS_TOKEN_KEY);

    if (accessToken == null) {
      print('토큰없음');
      context.goNamed(LoginScreen.routeName);


    } else {
      print('토큰 있음');

          context.goNamed(RootTab.routeName);
    }
  }

  @override
  Widget build(BuildContext context ) {
    return Container(
      color: PRIMARY_COLOR,
      child: Container(
        decoration: PRIMARY_GRADIENT,
        width: MediaQuery.of(context).size.width,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'asset/img/logo/gopark_logo.png',
              width: MediaQuery.of(context).size.width / 3,
            ),
            const SizedBox(height: 16.0),
            CircularProgressIndicator(
              color: Colors.white,
            ),
          ],
        ),
      ),
    );
  }
}