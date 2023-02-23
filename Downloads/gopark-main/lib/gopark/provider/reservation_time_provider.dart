import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:gopark_app/gopark/model/model_reservation.dart';
import 'package:intl/intl.dart';

class DetailManageMentProvider extends ChangeNotifier{
  List<ScheduleModel> scheduleData = [];
  int dataLength = 0;
  bool isScheduleDataLoaded = false;
  final StreamController<List<ScheduleModel>> _controller = StreamController.broadcast();
  Stream<List<ScheduleModel>> get scheduleDataStream => _controller.stream;



  void getScheduleData() async {
    CollectionReference<Map<String, dynamic>> collectionReference = FirebaseFirestore.instance.collection("reservation");
    QuerySnapshot<Map<String, dynamic>> querySnapshot = await collectionReference.get();
    dataLength = scheduleData.length;
    if(scheduleData.isEmpty) {
      for (var element in querySnapshot.docs) {
        scheduleData.add(ScheduleModel.fromJson(element.data()));
      }
      isScheduleDataLoaded = true;
      _controller.sink.add(scheduleData);
    }else{
      scheduleData.clear();
      for (var element in querySnapshot.docs) {
        scheduleData.add(ScheduleModel.fromJson(element.data()));
      }
      isScheduleDataLoaded = true;
      _controller.sink.add(scheduleData);
    }

  }


  DateTime setDate= DateTime.now();
  String formatData = '';
  void calendarSelectedFunction(dateTime) {
    setDate = dateTime;
    formatData = DateFormat('yyyy-MM-dd').format(setDate).toString();
    getScheduleData();
  }

  @override
  void dispose() {
    _controller.close(); // 스트림 컨트롤러 닫기
    super.dispose();
  }

}
