import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:time_range/time_range.dart';

class ManageMentProvider with ChangeNotifier {


  List<String> dateFormattedResult = [];

  bool isShow = false;

  void hideCallBack() {
    isShow = !isShow;
    notifyListeners();
  }
  TimeRangeResult? timeRange;
  List<String> timeStartAddResult = List.filled(4, "");
  List<TimeOfDay> currentStartTime = [];
  DateTime? endDateTime;
  List<String> timeEndAddResult = [];
  DateFormat timeFormat = DateFormat.Hm();

  void rangeDataSet(range) {
    timeRange = range;
    timeEndAddResult.clear();
    if(timeRange == null) {
      return;
    }

    for (var i = 0; i < 4; i++) {
      var startDateTime = DateTime(
          timeRange!.start.hour, timeRange!.start.minute);
      startDateTime = startDateTime.add((Duration(
        hours: (timeRange!.start.hour + (3 * i)),
        minutes: timeRange!.start.minute,)));
      var endDateTime = DateTime(timeRange!.end.hour, timeRange!.end.minute);
      endDateTime = endDateTime.add(
          Duration(hours: timeRange!.end.hour, minutes: timeRange!.end.minute));
      if (startDateTime.day == endDateTime.day) {
        var startTime = TimeOfDay.fromDateTime(startDateTime);
        var endTime = TimeOfDay.fromDateTime(endDateTime);
        if (startTime.hour > endTime.hour || (startTime.hour < endTime.hour &&
            startTime.minute > endTime.minute)) {
          continue;
        }
        timeStartAddResult[i] =timeFormat.format(startDateTime);
        timeEndAddResult.add(timeFormat.format(endDateTime));
        print(timeStartAddResult);
      }
    }
  }
}