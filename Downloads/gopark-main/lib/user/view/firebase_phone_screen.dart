import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/services.dart';
import 'package:gopark_app/common/component/custom_elvated_btn.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/const/text.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:gopark_app/user/model/number_formatter.dart';
import 'package:gopark_app/user/view/firebase_singup_scrren.dart';

class FirebasePhoneScreen extends StatelessWidget {
  static String get routeName => 'phone';
  const FirebasePhoneScreen({Key? key}) : super(key: key);



  @override
  Widget build(BuildContext context) {
    FirebaseAuth _auth = FirebaseAuth.instance;

    TextEditingController phoneController = TextEditingController();
    String? phoneText = "";
    const baseBorder = OutlineInputBorder(
      borderSide: BorderSide(
        color: Colors.black,
        width: 1.0,
      ),
    );
    return DefaultLayout(
      backgroundColor: WHITE_BG_COLOR,
      title: '휴대전화 번호 입력하기 ',
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
                  Icons.phone,
                  color: PRIMARY_COLOR,
                ),
                hintText: '전화번호',
                hintStyle: TextStyle(color: PRIMARY_COLOR),
              ),
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly, //숫자만!
                NumberFormatter(), // 자동하이픈
                LengthLimitingTextInputFormatter(13) //13자리만 입력받도록 하이픈 2개+숫자 11개
              ],
              controller: phoneController,
              onChanged: (String value) {
                phoneText = value;
              },
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40.0),
              child: const Text(
                PHONE_NOTICE,
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontSize: 10.0,
                    fontWeight: FontWeight.w400,
                    color: BODY_TEXT_COLOR),
              ),
            ),
            GestureDetector(
              onTap: () async {
                await _auth.verifyPhoneNumber(
                  timeout: const Duration(seconds: 60),
                  phoneNumber: '+82$phoneText',
                  verificationCompleted: (_) {
                    print("success");
                    //context.read<IsLoginedController>().loadingAction();
                  },
                  verificationFailed: (e) {
                    print(e);
                    //context.read<IsLoginedController>().loadingAction();
                  },
                  codeSent: (String verificationId, int? token) {
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => FirebaseSignUpScreen(
                                  verificationId: verificationId,
                                )));
                    print(verificationId);
                    print(token);
                  },
                  codeAutoRetrievalTimeout: (String verificationId) {},
                );
              },
              child: Container(
                  height: 50,
                  child: CustomElvatedBtn(
                    gradient: true,
                    btnName: '계속',
                    tcolor: WHITE_BG_COLOR,
                    textsize: 16,
                  ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
