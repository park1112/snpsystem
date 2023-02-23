import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:flutter/material.dart';
import 'package:gopark_app/common/layout/gopark_layout.dart';
import 'package:gopark_app/common/view/association_screen.dart';
import 'package:gopark_app/gopark/view/association_screen.dart';
import 'package:gopark_app/gopark/view/gopark_screen.dart';
import 'package:gopark_app/map/view/google_map_screen.dart';
import 'package:gopark_app/mypage/view/my_page_screen.dart';
import 'package:gopark_app/user/view/admin_date_add_screen.dart';
import 'package:gopark_app/user/view/admin_screen.dart';
import 'package:gopark_app/user/view/login_screen.dart';

class RootTab extends StatefulWidget {
  static String get routeName => 'home';

  const RootTab({Key? key}) : super(key: key);

  @override
  State<RootTab> createState() => _RootTabState();
}

class _RootTabState extends State<RootTab> with SingleTickerProviderStateMixin {
  late TabController controller;

  int index = 0;

  @override
  void initState() {
    super.initState();

    controller = TabController(length: 5, vsync: this);

    controller.addListener(tabListener);
  }

  @override
  void dispose() {
    controller.removeListener(tabListener);

    super.dispose();
  }

  void tabListener() {
    setState(() {
      index = controller.index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return DefaultLayout(
      title: '경남 합천군 합천읍',
      actions: [
        IconButton(
            icon: Icon(
              Icons.calendar_today_outlined,
              color: PRIMARY_COLOR,
            ),
            onPressed: (){
              context.pushNamed(AdminDateAddScreen.routeName);
            }),
        IconButton(
            icon:
                Icon(Icons.notifications_active_outlined, color: PRIMARY_COLOR),
            onPressed: null),
        IconButton(
            icon: SvgPicture.asset(
              'asset/svg/icon/my.svg',
              color: PRIMARY_COLOR,
              width: 40,
              height: 40,
            ),
            onPressed: null),
      ],
      child: TabBarView(
        physics: NeverScrollableScrollPhysics(),
        controller: controller,
        children: [
          GoparkScreen(),
          LoginScreen(),
          GoogleMapScreen(),
          AssociationSelectScreen(),
          MyPageScreen(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        selectedItemColor: PRIMARY_COLOR,
        unselectedItemColor: BODY_TEXT_COLOR,
        selectedFontSize: 10,
        unselectedFontSize: 10,
        type: BottomNavigationBarType.fixed,
        onTap: (int index) {
          controller.animateTo(index);
        },
        currentIndex: index,
        items: [
          BottomNavigationBarItem(
            label: '홈',
            icon: SvgPicture.asset(
              'asset/svg/icon/home.svg',
              color: index == 0 ? PRIMARY_COLOR : BODY_TEXT_COLOR,
              width: 25,
              height: 25,
            ),
          ),
          BottomNavigationBarItem(
            label: '파크톡톡',
            icon: SvgPicture.asset(
              'asset/svg/icon/talk.svg',
              color: index == 1 ? PRIMARY_COLOR : BODY_TEXT_COLOR,
              width: 25,
              height: 25,
            ),
          ),
          BottomNavigationBarItem(
            label: '내주변',
            icon: SvgPicture.asset(
              'asset/svg/icon/map.svg',
              color: index == 2 ? PRIMARY_COLOR : BODY_TEXT_COLOR,
              width: 25,
              height: 25,
            ),
          ),
          BottomNavigationBarItem(
            label: '스코어기록',
            icon: SvgPicture.asset(
              'asset/svg/icon/score.svg',
              color: index == 3 ? PRIMARY_COLOR : BODY_TEXT_COLOR,
              width: 25,
              height: 25,
            ),
          ),
          BottomNavigationBarItem(
            label: '내정보',
            icon: SvgPicture.asset(
              'asset/svg/icon/my.svg',
              color: index == 4 ? PRIMARY_COLOR : BODY_TEXT_COLOR,
              width: 40,
              height: 40,
            ),
          ),
        ],
      ),
    );
  }
}
