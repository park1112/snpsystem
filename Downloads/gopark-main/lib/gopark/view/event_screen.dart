import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:gopark_app/common/layout/gopark_layout.dart';
import 'package:gopark_app/gopark/view/event_detail_screen.dart';

class EventScrenn extends StatelessWidget {
  const EventScrenn({Key? key}) : super(key: key);

  static String get routeName => 'event';

  @override
  Widget build(BuildContext context) {
    List data = [
      'asset/img/event/img.png',
      'asset/img/event/img1.png',
      'asset/img/event/img2.png',
      'asset/img/event/img3.png',
    ];
    print(data.length);

    return DefaultLayout(
        title: '이벤트',
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child:
              Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
              SizedBox(
              height: MediaQuery.of(context).size.height,
              child: ListView.builder(
                itemCount: data.length,
                itemBuilder: (context, index) {
                  return _EventImages(
                    onTap: () {
                      context.goNamed(EventDetailScreen.routeName);
                    },
                    img: data[index],
                  );
                },
              ),
            ),
          ]),
        ));
  }
}

class _EventImages extends StatelessWidget {
  const _EventImages({required this.img, required this.onTap, Key? key})
      : super(key: key);
  final String img;

  final onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.only(top: 18, left: 18, right: 18),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(10.0),
          child: SizedBox(
            child: Image.asset(
              img,
              fit: BoxFit.fill,
            ),
          ),
        ),
      ),
    );
  }
}
