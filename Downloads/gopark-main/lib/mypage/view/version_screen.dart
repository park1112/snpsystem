import 'package:flutter/material.dart';
import 'package:gopark_app/common/layout/default_layout.dart';

class VersionScreen extends StatelessWidget {
  static String get routeName => 'version';
  final String version;

  const VersionScreen({required this.version , Key? key}) : super(key: key);


  @override
  Widget build(BuildContext context) {
    return DefaultLayout(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset('asset/img/logo/applogo.png', width: 100,),
            Text('최신 버전을 사용중입니다.'),
            SizedBox(height: 10,),
            Text('현재 버전 $version', style: TextStyle(fontSize: 13),),
            SizedBox(height: 50,)
          ],
        ),
      )
    );
  }
}
