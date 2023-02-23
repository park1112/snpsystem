import 'package:calendar_date_picker2/calendar_date_picker2.dart';
import 'package:flutter/material.dart';
import 'package:gopark_app/user/provider/management_provider.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

class CalendarDatePickerModel extends StatefulWidget {
  const CalendarDatePickerModel({Key? key}) : super(key: key);

  @override
  State<CalendarDatePickerModel> createState() => _CalendarDatePickerModelState();
}

class _CalendarDatePickerModelState extends State<CalendarDatePickerModel> {

  @override
  Widget build(BuildContext context) {
    List<DateTime?> _initialValueData = [];

    final _getData = Provider.of<ManageMentProvider>(context,listen: true);

    return Column(children:[TextButton(
      onPressed: () async{
        _getData.dateFormattedResult.clear();
        var results = await showCalendarDatePicker2Dialog(
          context: context,
          dialogSize: const Size(400,500),
          initialValue: _initialValueData.toList(),
          borderRadius: BorderRadius.circular(15),
          config:CalendarDatePicker2WithActionButtonsConfig(
            okButton: Text("확인"),

            okButtonTextStyle: TextStyle(fontSize: 20,),
            cancelButton: Text("취소"),
            cancelButtonTextStyle: TextStyle(fontSize: 20),
            weekdayLabels: ['월','화','수','목','금','토','일'],
            calendarType: CalendarDatePicker2Type.range,
            todayTextStyle: TextStyle(color: Colors.deepPurple),
            selectedDayTextStyle: TextStyle(color: Colors.blue, fontWeight: FontWeight.w700),
            selectedDayHighlightColor: Colors.pink,
            dayTextStyle: const TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.bold,
            ),
            disabledDayTextStyle: const TextStyle(
              color: Colors.grey,
            ),
            selectableDayPredicate: (day) => !day
                .difference(DateTime.now().subtract(const Duration(days: 3)))
                .isNegative,
            dayBuilder: ({
              required date,
              textStyle,
              decoration,
              isSelected,
              isDisabled,
              isToday,
            }) {
              Widget? dayWidget;
              if (date.day % 3 == 0 && date.day % 9 != 0) {
                dayWidget = Container(
                  decoration: decoration,
                  child: Center(
                    child: Stack(
                      alignment: AlignmentDirectional.center,
                      children: [
                        Text(
                          MaterialLocalizations.of(context).formatDecimal(date.day),
                          style: textStyle,
                        ),
                        Padding(
                          padding: const EdgeInsets.only(top: 27.5),
                          child: Container(
                            height: 4,
                            width: 4,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(5),
                              color: isSelected == true
                                  ? Colors.white
                                  : Colors.grey[500],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );

              }
              return dayWidget;

            },
          ),
        );
        //_getData.initialValueData = results;
        var difference  = results![1]?.difference(results[0]!).inDays;
        for(var i = 0; i<=difference!; i++) {
          _initialValueData.add(results![0]?.add(Duration(days: i)));
          print(_initialValueData);
        }
        for(var date in _initialValueData) {
          String formattedDate = DateFormat('yyyy-MM-dd').format(date!);
          print(formattedDate);
          _getData.dateFormattedResult.add(formattedDate);
        }
      }, child: Text("달력"),
    ),
      Text(
          _getData.dateFormattedResult.toString()
      )
    ],
    );
  }
}
