import 'package:flutter/material.dart';
import 'package:gopark_app/common/layout/default_layout.dart';

class EventDetailScreen extends StatelessWidget {
  static String get routeName => 'eventDetail';

  const EventDetailScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultLayout(
      child: SizedBox(
          width: MediaQuery.of(context).size.width,
          child: Image.asset('asset/img/event/event.png', fit: BoxFit.cover,)),
    );
  }
}
