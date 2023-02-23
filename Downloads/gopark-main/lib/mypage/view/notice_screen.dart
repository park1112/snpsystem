import 'package:flutter/material.dart';
import 'package:gopark_app/common/layout/default_layout.dart';

class NoticeScreen extends StatelessWidget {
  static String get routeName => 'notice';

  const NoticeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    List notice = [
      ['[점검]고파크 시스템 점검안내', '2023.02.10'],
      ['[공지]고파크 공지사항 안내', '2023.02.22'],
      ['[점검]고파크 시스템 점검안내', '2023.02.23']
    ];

    return DefaultLayout(
      title: '공지사항',
      child: SizedBox(
        width: MediaQuery.of(context).size.width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 400,
              child: ListView.builder(
                  itemCount: notice.length,
                  itemBuilder: (context, index) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 18.0 , vertical: 7),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                notice[index][0],
                                style: TextStyle(fontSize: 14),
                              ),
                              Text(
                                notice[index][1],
                                style: TextStyle(color: Colors.grey, fontSize: 12),
                              ),

                            ],
                          ),
                        ),
                        Divider(),
                      ],
                    );
                  }),
            )
          ],
        ),
      ),
    );
  }
}
