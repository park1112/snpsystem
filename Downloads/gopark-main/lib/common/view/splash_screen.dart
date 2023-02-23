import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/component/custom_elvated_btn.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:gopark_app/common/view/loding_splash_screen.dart';
import 'package:gopark_app/user/view/login_screen.dart';

class SplashScreen extends StatelessWidget {
  static String get routeName => 'splash';
  const SplashScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: PRIMARY_GRADIENT,
        width: MediaQuery.of(context).size.width,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Flexible(
              flex: 3,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  SizedBox(
                    height: 100,
                    child: Column(
                      children: [
                        Text(
                          'GOPARK에서',
                          style: TextStyle(
                              fontSize: 20.0,
                              color: Colors.white,
                              fontWeight: FontWeight.w400),
                        ),
                        SizedBox(
                          height: 8,
                        ),
                        Text(
                          '골프예약과 장비 구매까지!!',
                          style: TextStyle(
                              fontSize: 24.0,
                              color: Colors.white,
                              fontWeight: FontWeight.w700),
                        ),
                        SizedBox(
                          height: 20.0,
                        ),
                      ],
                    ),
                  ),
                  Image.asset(
                    'asset/img/logo/gopark_logo.png',
                    width: MediaQuery.of(context).size.width / 3,
                  )
                ],
              ),
            ),
            const SizedBox(height: 16.0),
            Flexible(
              flex: 2,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 30, vertical: 50),
                width: MediaQuery.of(context).size.width,
                child: Container(
                    height: 50,
                    child: GestureDetector(
                      onTap: () {
                       // Navigator.push(context, MaterialPageRoute(builder: (_) => LoginScreen()),);
                        context.goNamed(LodingSplashScreen.routeName);
                      },
                      child: CustomElvatedBtn(
                        color: Colors.white,
                        btnName: '시작하기',
                        tcolor: PRIMARY_COLOR,
                        textsize: 18,
                      ),
                    )),
              ),
            )
          ],
        ),
      ),
    );
  }
}
