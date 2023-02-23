import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:gopark_app/common/provider/model_place_provider.dart';
import 'package:gopark_app/common/view/root_tab.dart';
import 'package:gopark_app/user/provider/management_provider.dart';
import 'package:gopark_app/user/widgets/calender_date_picker_model.dart';
import 'package:gopark_app/user/widgets/drop_down_button.dart';
import 'package:gopark_app/user/widgets/time_range_widget.dart';
import 'package:provider/provider.dart';

class ManageMentScreen extends StatefulWidget {
  const ManageMentScreen({Key? key}) : super(key: key);

  @override
  State<ManageMentScreen> createState() => _ManageMentScreenState();
}

class _ManageMentScreenState extends State<ManageMentScreen> {
  @override
  Widget build(BuildContext context) {
    final getData = Provider.of<PlaceProvider>(context, listen: true);
    final timeData = Provider.of<ManageMentProvider>(context);

    return  Center(
      child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Center(
            child: Column(
              children: [
                DropDownButtonWidget(
                  onChanged: (value) => getData.dropDownChange(value!),
                ),
                CalendarDatePickerModel(),
                TimeRangeWidget(),
                TextButton(
                    onPressed: () async {
                      for (int i = 0;
                      i < timeData.dateFormattedResult.length;
                      i++) {
                        if (i <= timeData.timeStartAddResult.length ||
                            timeData.timeStartAddResult[i] == "") {
                          String docSet = getData.dropDownValue +
                              timeData.dateFormattedResult[i] +
                              timeData.timeStartAddResult[0];
                          await FirebaseFirestore.instance
                              .collection('reservation')
                              .doc(docSet)
                              .set(
                            {
                              'oneTimeStart': timeData.timeStartAddResult[0],
                              'twoTimeStart': timeData.timeStartAddResult[1],
                              'threeTimeStart': timeData.timeStartAddResult[2],
                              'fourTimeStart': timeData.timeStartAddResult[3],
                              'dateTime': timeData.dateFormattedResult[i],
                              'item': getData.dropDownValue,
                              'oneTimeCount': getData.placeHoleCount,
                              'twoTimeCount': getData.placeHoleCount,
                              'threeTimeCount': getData.placeHoleCount,
                              'fourTimeCount': getData.placeHoleCount,
                            },
                          );
                        }

                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const RootTab()));
                      }
                    },
                    child: Text("확인")),
              ],
            ),
          ),
        ),
    )
    ;
  }
}