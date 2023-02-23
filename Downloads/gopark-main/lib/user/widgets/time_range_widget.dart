import 'package:flutter/material.dart';
import 'package:gopark_app/user/provider/management_provider.dart';
import 'package:provider/provider.dart';
import 'package:time_range/time_range.dart';

class TimeRangeWidget extends StatelessWidget {
  TimeRangeWidget({ Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context,) {
    final timeProvider = context.read<ManageMentProvider>();
    return Column(
      children: [
        Visibility(
          visible: timeProvider.isShow,
          child: Column(children: [
            TimeRange(
              fromTitle: Text(
                '시작 시간',
                style: TextStyle(fontSize: 18, color: Colors.black),
              ),
              toTitle: Text(
                '끝나는 시간',
                style: TextStyle(fontSize: 18, color: Colors.black),
              ),
              timeBlock: 30,
              initialRange:timeProvider.timeRange,
              onRangeCompleted: (range) =>timeProvider.rangeDataSet(range),
              firstTime: TimeOfDay(hour: 08, minute: 00),
              lastTime: TimeOfDay(hour: 24, minute: 00),
            ),
          ],),),
        TextButton(
          onPressed: () {
            timeProvider.hideCallBack();
          },
          child: Text(timeProvider.isShow ? '확인' : '시간 설정하기'),
        ),
        if (timeProvider.timeRange != null)
          Padding(
            padding: const EdgeInsets.only(
              top: 8.0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text('선택된 시간: ${timeProvider.timeRange?.start.format(context)} - ${timeProvider.timeRange?.end.format(context)}'
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
      ],
    );
  }
}

