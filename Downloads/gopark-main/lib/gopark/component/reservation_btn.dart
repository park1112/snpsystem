import 'package:flutter/material.dart';
import 'package:gopark_app/common/const/colors.dart';

class ReservationBtn extends StatelessWidget {

  const ReservationBtn({ this.click ,required this.time ,required this.count, Key? key}) : super(key: key);


  final String time;
  final int count;
  final bool? click;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          border: Border.all(width: 1, color: click == null ? Color(0xFFdddddd) : PRIMARY_COLOR),
          borderRadius: const BorderRadius.all(Radius.circular(10))),
      child: InkWell(
        onTap: (){},
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              time,
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: TEXT_GRAY_COLOR),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                Text(
                  '명',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

