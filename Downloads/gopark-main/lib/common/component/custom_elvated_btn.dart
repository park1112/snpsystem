import 'package:flutter/material.dart';
import 'package:gopark_app/common/const/colors.dart';

class CustomElvatedBtn extends StatelessWidget {
  final String btnName;
  final Color? color;
  final Color? tcolor;
  final double? textsize;
  final Icon? icon;
  final bool? gradient;

  const CustomElvatedBtn(
      {this.gradient,
      this.icon,
      this.color,
      this.textsize,
      this.tcolor,
      required this.btnName,
      Key? key})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: color != null ? color : Colors.grey[200],
          borderRadius: BorderRadius.circular(6.0),
          gradient: gradient != null ? LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: GRADIENT) : null,
      ),
      child: Center(
          child: Text(btnName,
              style: TextStyle(
                  fontSize: textsize != null ? textsize : 12,
                  fontWeight: FontWeight.w700,
                  color: tcolor != null ? tcolor : Colors.black))),
    );
  }
}
