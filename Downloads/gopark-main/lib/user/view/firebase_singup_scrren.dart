import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/component/custom_elvated_btn.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/const/data.dart';
import 'package:gopark_app/common/const/text.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:gopark_app/common/view/root_tab.dart';
import 'package:gopark_app/user/model/number_formatter.dart';
import 'package:gopark_app/user/view/login_screen.dart';
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart' as kakaouser;
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';

class FirebaseSignUpScreen extends StatelessWidget {
  static String get routeName => 'singup';
  final String verificationId;

  FirebaseSignUpScreen({required this.verificationId, Key? key})
      : super(key: key);

  final storage = FlutterSecureStorage();
  final FirebaseAuth auth = FirebaseAuth.instance;
  FirebaseFirestore firestore = FirebaseFirestore.instance;
  bool onClick = false;

  @override
  Widget build(BuildContext context) {
    String userName = "";
    // TextEditingController userNameInput = TextEditingController();
    TextEditingController phoneVerifyCode = TextEditingController();
    const baseBorder = OutlineInputBorder(
      borderSide: BorderSide(
        color: Colors.black,
        width: 1.0,
      ),
    );
    return DefaultLayout(
      backgroundColor: WHITE_BG_COLOR,
      title: '인증 코드 입력하기 ',
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 50, horizontal: 30),
        child: Column(
          children: [
            TextFormField(
              style: TextStyle(color: PRIMARY_COLOR, fontSize: 22),
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: PRIMARY_COLOR),
                ),
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(color: PRIMARY_COLOR),
                ),
                prefixIcon: Icon(
                  Icons.message,
                  color: PRIMARY_COLOR,
                ),
                hintText: '인증번호 6자리',
                hintStyle: TextStyle(color: PRIMARY_COLOR),
              ),
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly, //숫자만!
                LengthLimitingTextInputFormatter(6) //13자리만 입력받도록 하이픈 2개+숫자 11개
              ],
              controller: phoneVerifyCode,
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40.0),
              child: Text(
                AYTH_NOTICE,
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 10.0,
                    fontWeight: FontWeight.w400,
                    color: BODY_TEXT_COLOR),
              ),
            ),
            GestureDetector(
              onTap: () async {
                onClick = true;
                final credential = PhoneAuthProvider.credential(
                    verificationId: verificationId.toString(),
                    smsCode: phoneVerifyCode.text.toString());
                try {
                  // 카카오아이디 추가
                  // kakaouser.User? kuser;
                  // kuser = await UserApi.instance.me();
                  final token = await auth.signInWithCredential(credential);
                  await storage.write(
                      key: FIREBASE_TOKEN_KEY, value: token.user?.uid);
                  await FirebaseFirestore.instance.collection('user').doc().set(
                    {
                      'uid': token.user?.uid,
                      "userPhone": token.user?.phoneNumber,
                      // 'userId': kuser.kakaoAccount?.profile?.nickname,
                      // 'userName': userName,
                      // 'userEmail' :  kuser.kakaoAccount?.email,
                    },
                  );
                  context.goNamed(RootTab.routeName);
                } catch (e) {
                  //context.read<IsLoginedController>().loadingAction();

                }
              },
              child: Container(
                  height: 50,
                  child: CustomElvatedBtn(
                    gradient: true,
                    btnName: '계속하기',
                    tcolor: WHITE_BG_COLOR,
                    textsize: 16,
                  )),
            ),
          ],
        ),
      ),
    );
  }
}
