import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:gopark_app/gopark/view/event_screen.dart';
import 'package:gopark_app/mypage/view/company_info_screen.dart';
import 'package:gopark_app/mypage/view/notice_screen.dart';
import 'package:gopark_app/mypage/view/version_screen.dart';

class MyPageScreen extends StatelessWidget {
  static String get routeName => 'mypage';

  const MyPageScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultLayout(
        child: SizedBox(
      width: MediaQuery.of(context).size.width,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: const [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 18.0, vertical: 10.0),
            child: _Profile(),
          ),
          Divider(),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 18.0, vertical: 10.0),
            child: _Cash(),
          ),
          Divider(thickness: 8, color: DIVIDER_COLOR),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 18.0, vertical: 10.0),
            child: _Notice(),
          ),
          Divider(thickness: 8, color: DIVIDER_COLOR),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 18.0, vertical: 10.0),
            child: _Version(),
          ),
        ],
      ),
    ));
  }
}

class _Version extends StatelessWidget {
  const _Version({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    String version = 'v1.1.4';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () {},
          child: Text(
            '약관 및 정책',
            style: TextStyle(color: Colors.grey),
          ),
        ),
        SizedBox(height: 15.0),
        InkWell(
          onTap: () {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => VersionScreen(
                      version: version,
                    )));
          },
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '버전 정보',
                style: TextStyle(color: Colors.grey),
              ),
              Text(
                '$version (최신)',
                style: TextStyle(color: Colors.grey),
              ),
            ],
          ),
        ),
        SizedBox(height: 15.0),
        InkWell(
          onTap: () {
            context.pushNamed(CompanyInfoScreen.routeName);
          },
          child: Text(
            '사업자 정보',
            style: TextStyle(color: Colors.grey),
          ),
        ),
      ],
    );
  }
}

class _Notice extends StatelessWidget {
  const _Notice({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: MediaQuery.of(context).size.width,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
              onTap: () {
                context.pushNamed(NoticeScreen.routeName);
              },
              child: Text(
                '공지 사항',
                style: TextStyle(color: Colors.grey),
              )),
          SizedBox(height: 15.0),
          InkWell(
              onTap: () {
                context.goNamed(EventScrenn.routeName);
              },
              child: Text(
                '이벤트',
                style: TextStyle(color: Colors.grey),
              )),
          SizedBox(height: 15.0),
          InkWell(
              onTap: () {},
              child: Text(
                '고객센터',
                style: TextStyle(color: Colors.grey),
              )),
          SizedBox(height: 15.0),
          InkWell(
              onTap: () {},
              child: Text(
                '서비스 설정',
                style: TextStyle(color: Colors.grey),
              )),
        ],
      ),
    );
  }
}

// class _Notice extends StatelessWidget {
//   const _Notice({Key? key}) : super(key: key);
//
//   @override
//   Widget build(BuildContext context) {
//     List data = [
//       '공지사항',
//       '이벤트',
//       '고객센터',
//       '서비스 설정',
//     ];
//     return SizedBox(
//       width: MediaQuery.of(context).size.width,
//       child: Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children:  [
//           SizedBox(
//             height: 130,
//             child: ListView.builder(
//                 itemCount: data.length,
//                 itemBuilder: (context, index){
//               return  Padding(
//                 padding: const EdgeInsets.only(bottom: 15.0),
//                 child: Text(data[index], style: TextStyle(color: Colors.grey),),
//               );
//             }),
//           )
//         ],
//       ),
//     );
//   }
// }

class _Cash extends StatelessWidget {
  const _Cash({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        renderCash('쿠폰', '0'),
        renderCash('캐시', '2,000원'),
        renderCash('쿠폰', '0'),
      ],
    );
  }

  Widget renderCash(
    text,
    i,
  ) {
    return Column(
      children: [
        Text(text),
        Text(
          i,
          style: TextStyle(
            fontWeight: FontWeight.w500,
            color: PRIMARY_COLOR,
          ),
        ),
      ],
    );
  }
}

class _Profile extends StatelessWidget {
  const _Profile({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const CircleAvatar(
          radius: 25,
          // backgroundImage: AssetImage('asset/img/elon.jpg'),
          backgroundImage : NetworkImage('https://p.kakaocdn.net/th/talkp/wl3KTNRZ6g/hoks2IsbrgGku6t2C1T8Hk/6fmj8k_640x640_s.jpg'),
        ),
        const SizedBox(
          width: 10,
        ),
        Expanded(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '박현재',
                    style:
                        TextStyle(fontSize: 16.0, fontWeight: FontWeight.w700),
                  ),
                  const Text(
                    '010-5334-4722',
                    style: TextStyle(fontSize: 12.0),
                  ),
                ],
              ),
              Icon(
                Icons.arrow_forward_ios_outlined,
                size: 15,
                color: Colors.grey,
              ),
            ],
          ),
        )
      ],
    );
  }
}
