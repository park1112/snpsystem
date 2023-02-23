import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gopark_app/common/component/custom_elvated_btn.dart';
import 'package:gopark_app/common/const/colors.dart';

class ShowDialog extends StatelessWidget {
  const ShowDialog({required this.yesTap, required this.noTap, Key? key}) : super(key: key);

  final yesTap;
  final noTap;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            height: 20,
          ),
          Text(
            '협회 회원이신가요?',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(
            height: 25,
          ),
          Container(
            height: 120,
            width: 120,
            decoration: PRIMARY_GRADIENT_H.copyWith(
                borderRadius: BorderRadius.circular(10)),
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Container(
                color: Colors.white,
                child: (Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 27,
                      backgroundColor: PRIMARY_COLOR,
                      child: SvgPicture.asset(
                        'asset/svg/icon/Vector.svg',
                        color: Colors.white,
                        width: 30,
                        height: 30,
                      ),
                    ),
                  ],
                )),
              ),
            ),
          ),
          const SizedBox(
            height: 25,
          ),
          Text(
            '모바일 QR 발급하고 \n빠르고 쉽게 파크골프 입장해보세요!',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w400,
            ),
          ),
          const SizedBox(
            height: 25,
          ),
          Container(
            height: 50,
            child: GestureDetector(
              onTap: yesTap,
              child: CustomElvatedBtn(
                gradient: true,
                btnName: '회원 인증하러 가기',
                tcolor: WHITE_BG_COLOR,
                textsize: 18,
              ),
            ),
          ),
          const SizedBox(
            height: 15,
          ),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: Container(
              decoration: PRIMARY_GRADIENT_H,
              child: ElevatedButton(
                onPressed: noTap,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.black),
                child: Text(
                  '아니오 비회원 입니다.',
                  style: TextStyle(
                    fontSize: 18.0,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
