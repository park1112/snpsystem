import 'package:flutter/material.dart';
import 'package:gopark_app/common/component/custom_elvated_btn.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';

class AssociationSelectScreen extends StatelessWidget {
  static String get routeName => 'select';

  const AssociationSelectScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final List data = [
      '서울',
      '경기',
      '부산',
      '대구',
      '인천',
      '광주',
      '경상도',
      '전라도',
      '충청도',
    ];
    final List clan = [
      '팔현',
      '파인',
      '골드',
      '굿데이'
          '스마일',
      '17그린',
      '늘푸른',
      '늘버디',
      '투게더',
      '범어',
      '럭키',
      '파사모',
      '아리수',
      '햇살',
      '굿맨',
      '맨드라미',
    ];
    return DefaultLayout(
        title: '회원 인증 받기',
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18.0),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height,
                  child: GridView.builder(
                      itemCount: data.length,
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2, //1 개의 행에 보여줄 item 개수
                        childAspectRatio: 2 / 1, //item 의 가로 1, 세로 2 의 비율
                        mainAxisSpacing: 10, //수평 Padding
                        crossAxisSpacing: 10, //수직 Padding
                      ),
                      itemBuilder: (context, index) {
                        return Container(
                            height: 50,
                            child: GestureDetector(
                              onTap: () {
                                showDialog(
                                    context: context,
                                    barrierDismissible: true,
                                    //바깥 영역 터치시 닫을지 여부 결정
                                    builder: ((context) {
                                      return _Alertdialog(
                                        clan: clan,
                                      );
                                    }));
                              },
                              child: CustomElvatedBtn(
                                gradient: true,
                                btnName: data[index],
                                tcolor: WHITE_BG_COLOR,
                                textsize: 16,
                              ),
                            ));
                      }),
                ),
              )
            ],
          ),
        ));
  }
}

class _Alertdialog extends StatefulWidget {
  const _Alertdialog({required this.clan, Key? key}) : super(key: key);

  final List clan;




  @override
  State<_Alertdialog> createState() => _AlertdialogState();
}

class _AlertdialogState extends State<_Alertdialog> {
  int selectedBtn = 0 ;


  void changeBtn(int num) {
    //components의 버튼에 함수를 넘겨 main에서 state를 변경
    setState(() {
      selectedBtn = num;
    });
  }


  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      // RoundedRectangleBorder - Dialog 화면 모서리 둥글게 조절
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
      //Dialog Main Title
      title: Column(
        children: <Widget>[
          Text("협회를 선택해주세요"),
        ],
      ),
      //
      content: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('박현재' ,style: TextStyle(fontSize: 14),),
                Text('010-5334-4722' ,style: TextStyle(fontSize: 14),),
              ],
            ),
            ElevatedButton(
              child: Text(
                '정보변경하기',
                style: TextStyle(
                  fontSize: 12,
                ),
              ),
              onPressed: () {},
            ),
            Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: List.generate( widget.clan.length, (i)
                     => Container(
                          height: 50,
                          width: MediaQuery.of(context).size.width,
                          padding: EdgeInsets.symmetric(vertical: 5),
                          child: SizedBox(
                              child: GestureDetector(
                            onTap: () {
                              changeBtn(i);
                              print(i);
                            },
                            child: CustomElvatedBtn(
                              gradient: (selectedBtn == i) ? true : null,
                              btnName: widget.clan[i],
                              tcolor: (selectedBtn == i) ?  WHITE_BG_COLOR : Colors.blueGrey,
                              textsize: 10,
                            ),
                          )),
                        ))
                    .toList()),
          ],
        ),
      ),
      actions: <Widget>[
        TextButton(
          child: Text("확인"),
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ],
    );
  }
}
