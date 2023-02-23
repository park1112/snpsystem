import 'dart:ffi';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/layout/default_layout.dart';

class AdminDateAddScreen extends StatelessWidget {
  static String get routeName => 'admin';
  const AdminDateAddScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {


    TextEditingController nameController = TextEditingController();
    TextEditingController countController = TextEditingController();
    TextEditingController dateController = TextEditingController();
    String? name = "";
    int? count = 0;
    String? date = "";

    return DefaultLayout(
      child: Container(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.height,
        child: Form(
          key: this.key,
          child: Padding(
            padding: EdgeInsets.all(16),
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
                    hintText: '이름',
                    hintStyle: TextStyle(color: PRIMARY_COLOR),
                  ),
                  controller: nameController,
                  onChanged: (String value) {
                    name = value;
                  },
                ),
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
                    hintText: '날짜(2023-02-23)',
                    hintStyle: TextStyle(color: PRIMARY_COLOR),
                  ),
                  controller: dateController,
                  onChanged: (String value) {
                    date = value;
                  },
                ),
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
                    hintText: '수량',
                    hintStyle: TextStyle(color: PRIMARY_COLOR),
                  ),
                  controller: countController,
                  onChanged: (String value) {
                    count = int.parse(value);
                  },
                ),
                TextButton(
                    onPressed: () async {
                          await FirebaseFirestore.instance
                              .collection('reservation')
                              .doc()
                              .set(
                            {
                              'place': name,
                              'dateTime': date,
                              'oneTimeStart': '06:00',
                              'twoTimeStart': '9:00',
                              'threeTimeStart':'12:00',
                              'fourTimeStart': '15:00',
                              'oneTimeCount': count,
                              'twoTimeCount': count,
                              'threeTimeCount':count,
                              'fourTimeCount': count,
                            },
                          );
                        },
                    child: Text("확인")),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
