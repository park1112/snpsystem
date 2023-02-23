import 'package:flutter/material.dart';

//공통 레이아웃에 기능을 적용하고 싶을때 사용한다!

class GoparkLayout extends StatelessWidget {
  final Color? backgroundColor;
  final Widget child;

  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;

  const GoparkLayout({
    required this.child,
    this.backgroundColor,

    this.bottomNavigationBar,
    this.floatingActionButton,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor ?? Colors.white,
      appBar: renderAppBar(),
      body: SafeArea(child: child),
      bottomNavigationBar: bottomNavigationBar,
      floatingActionButton: floatingActionButton,
    );
  }

  AppBar renderAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0,
      foregroundColor: Colors.black,
    );
  }
}
