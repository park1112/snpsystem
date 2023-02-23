import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/component/custom_elvated_btn.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/const/text.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:gopark_app/common/view/root_tab.dart';
import 'package:gopark_app/gopark/view/gopark_screen.dart';
import 'package:gopark_app/user/component/social_login.dart';
import 'package:gopark_app/user/model/kakao_model.dart';
import 'package:gopark_app/user/view/firebase_phone_screen.dart';
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';

class LoginScreen extends StatefulWidget {
  static String get routeName => 'login';
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  void userCheck() async {
    OAuthToken? token = await TokenManagerProvider.instance.manager.getToken();
    print(token);
    if (token != null) {
      try {
        print('토큰생성 성공 성공');
        context.goNamed(FirebasePhoneScreen.routeName);
      } catch (e) {
        print('실패');
        context.goNamed(LoginScreen.routeName);
      }
    } else {
      print('ㅇㅇㅇ');
      context.goNamed(LoginScreen.routeName);
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultLayout(
      backgroundColor: WHITE_BG_COLOR,
      child: SizedBox(
        width: MediaQuery
            .of(context)
            .size
            .width,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Flexible(
              flex: 2,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Image.asset(
                    'asset/img/logo/gopark_logo_green.png',
                    width: MediaQuery
                        .of(context)
                        .size
                        .width / 4,
                  ),
                  SizedBox(
                    height: (MediaQuery.of(context).size.height < 840 ) ? 25 : 0
                  ) ,
                  SizedBox(
                    child: Column(
                      children: [
                        Text(
                          '간편하게 로그인하고',
                          style: TextStyle(
                              fontSize: 20.0,
                              color: Colors.black,
                              fontWeight: FontWeight.w400),
                        ),
                        SizedBox(
                          height: 8,
                        ),
                        Text(
                          '다양한 서비스를 이용하세요.',
                          style: TextStyle(
                              fontSize: 24.0,
                              color: Colors.black,
                              fontWeight: FontWeight.w700),
                        ),
                        SizedBox(
                            height: (MediaQuery.of(context).size.height < 840 ) ? 40 : 10
                        ) ,
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 30, vertical: 10),
                          child: GestureDetector(
                            onTap: () async {
                              final viewModel = KakaoModel(KakaoLogin());
                              await viewModel.login();
                              userCheck();
                            },
                            child: Container(
                                height: 50,
                                child: CustomElvatedBtn(
                                  color: KAKAO_COLOR,
                                  btnName: '카카오톡 로그인',
                                  tcolor: WHITE_BG_COLOR,
                                  textsize: 16,
                                )),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 30, vertical: 10),
                          child: Container(
                              height: 50,
                              child: GestureDetector(
                                onTap: () {
                                  context.goNamed(FirebasePhoneScreen.routeName);
                                },
                                child: CustomElvatedBtn(
                                  gradient: true,
                                  btnName: '전화번호로 로그인',
                                  tcolor: WHITE_BG_COLOR,
                                  textsize: 16,
                                ),
                              )),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16.0),
            Flexible(
                flex: 1,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Center(
                      child: Text(
                        LOGINT_NOTICE,
                        textAlign: TextAlign.center,
                        style: TextStyle(color: BODY_TEXT_COLOR, fontSize: 12),
                      ),
                    ),
                    SizedBox(
                      height: 70,
                    )
                  ],
                ))
          ],
        ),
      ),
    );
  }
}
