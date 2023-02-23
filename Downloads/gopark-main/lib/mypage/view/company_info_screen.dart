import 'package:flutter/material.dart';
import 'package:gopark_app/common/layout/default_layout.dart';

class CompanyInfoScreen extends StatelessWidget {
  static String get routeName => 'info';
  const CompanyInfoScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultLayout(
        title: '고파크 사업자 정보',
        child: Container(
      child: Text('사업자등록번호 : 123-456-11235\n\n대표이사 : 정용제 \n\n서울 서초구 나루터로75 금산빌딩 305호 \n\n 대표번포 1588-1234'),
    ));
  }
}
