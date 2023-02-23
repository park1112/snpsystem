import 'package:date_picker_timeline/date_picker_timeline.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_custom_carousel_slider/flutter_custom_carousel_slider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/layout/default_layout.dart';
import 'package:gopark_app/gopark/component/reservation_btn.dart';
import 'package:gopark_app/gopark/model/model_reservation.dart';
import 'package:gopark_app/gopark/provider/reservation_time_provider.dart';
import 'package:gopark_app/reservation/view/reservation_screen.dart';
import 'package:provider/provider.dart' as providerP;

class PlaceDetailsScreen extends StatelessWidget {
  const PlaceDetailsScreen({
    Key? key,
    required this.city,
    required this.name,
    required this.address,
    required this.phone,
    required this.hole,
    required this.available,
    required this.imgUrl,
    required this.bookingCount,
    required this.ticket,
  }) : super(key: key);
  final String city;
  final String name;
  final String address;
  final String phone;
  final String hole;
  final String available;
  final List<String> imgUrl;
  final num bookingCount;
  final num ticket;

  @override
  Widget build(BuildContext context) {
    return DefaultLayout(
      bottomNavigationBar: SafeArea(
        child: Container(
          decoration: PRIMARY_GRADIENT_H,
          child: InkWell(
            onTap: () {
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => ReservationScreen(
                          city: city,
                          name: name,
                          address: address,
                          phone: phone,
                          hole: hole,
                          available: available,
                          imgUrl: imgUrl[0],
                          ticket: ticket.toString(),
                          bookingCount: bookingCount.toString(),
                          reservationDate: '2023-02-24',
                          checkCount: 1,
                          oneTimeStart: "18",
                          value: 1)));
            },
            child: SizedBox(
              height: 60,
              width: MediaQuery.of(context).size.width,
              child: Center(
                child: Text(
                  '선택된시간 예약하기',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.white),
                ),
              ),
            ),
          ),
        ),
      ),
      child: SingleChildScrollView(
        child: Column(
          children: [
            _Images(
              imgUrl: imgUrl,
            ),
            SizedBox(
              height: 20,
            ),
            _Context(
              city: city,
              name: name,
              address: address,
              phone: phone,
              hole: hole,
              available: available,
              bookingCount: bookingCount,
              ticket: ticket,
            ),
            SizedBox(
              height: 20,
            ),
            Divider(thickness: 1, color: DIVIDER_COLOR),
            SizedBox(
              height: 20,
            ),
            _Icons(),
            SizedBox(
              height: 20,
            ),
            Divider(thickness: 8, color: DIVIDER_COLOR),
            SizedBox(
              height: 20,
            ),
            _DateTimeLine(
                city: city,
                name: name,
                address: address,
                phone: phone,
                hole: hole,
                available: available,
                ticket: ticket),
          ],
        ),
      ),
    );
  }
}

class _DateTimeLine extends StatefulWidget {
  const _DateTimeLine(
      {required this.city,
      required this.name,
      required this.address,
      required this.phone,
      required this.hole,
      required this.available,
      required this.ticket,
      Key? key})
      : super(key: key);
  final String city;
  final String name;
  final String address;
  final String phone;
  final String hole;
  final String available;
  final num ticket;

  @override
  State<_DateTimeLine> createState() => _DateTimeLineState();
}

class _DateTimeLineState extends State<_DateTimeLine> {
  DatePickerController _controller = DatePickerController();
  DateTime _selectedValue = DateTime.now();

  int selectedBtn = 0;

  void changeBtn(int num) {
    //components의 버튼에 함수를 넘겨 main에서 state를 변경
    setState(() {
      selectedBtn = num;
    });
  }

  @override
  Widget build(BuildContext context) {
    final data = [
      '06:00',
      '09:00',
      '12:00',
      '15:00',
    ];
    final getData =
        providerP.Provider.of<DetailManageMentProvider>(context, listen: false);
    SystemChrome.setSystemUIOverlayStyle(
        const SystemUiOverlayStyle(statusBarColor: Colors.transparent));

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 10.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          // Text(_selectedValue.toString()),
          Container(
            child: DatePicker(
              DateTime.now(),
              locale: 'ko',
              width: 60,
              height: 90,
              controller: _controller,
              initialSelectedDate: DateTime.now(),
              selectionColor: PRIMARY_COLOR,
              selectedTextColor: Colors.white,
              inactiveDates: [
                // DateTime.now().add(Duration(days: 3)),
                // DateTime.now().add(Duration(days: 4)),
                // DateTime.now().add(Duration(days: 7))
              ],
              onDateChange: (date) {
                // New date selected
                setState(() {
                  _selectedValue = date;
                  getData.calendarSelectedFunction(date);
                  // calendarSelectedFunction(date);
                });
              },
            ),
          ),
          SizedBox(
            height: 20,
          ),

          Container(
            height: 300,
            child: GridView.builder(
              itemCount: data.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4, //1 개의 행에 보여줄 item 개수
                childAspectRatio: 1 / 1, //item 의 가로 1, 세로 2 의 비율
                mainAxisSpacing: 10, //수평 Padding
                crossAxisSpacing: 10, //수직 Padding
              ),
              itemBuilder: (context, index) {
                if (data[index] == null) {
                  return Text('예약가능한 시간이 없습니다.');
                } else {
                  return GestureDetector(
                    onTap: () {
                      changeBtn(index);
                      print(index);
                    },
                    child: ReservationBtn(
                      click: selectedBtn == index ? true : null,
                      time: data[index],
                      count: 18,
                    ),
                  );
                }
              },
            ),
          ),

          // state.when(
          //   data: (data) {
          //     return SizedBox(
          //       height: 50,
          //       child: GridView.builder(
          //         itemCount: data.length,
          //         gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          //           crossAxisCount: 4, //1 개의 행에 보여줄 item 개수
          //           childAspectRatio: 2 / 1, //item 의 가로 1, 세로 2 의 비율
          //           mainAxisSpacing: 10, //수평 Padding
          //           crossAxisSpacing: 10, //수직 Padding
          //         ),
          //         itemBuilder: (context, index) {
          //           if(data[index] == null){
          //             return Text('예약가능한 시간이 없습니다.');
          //           } else {
          //             return InkWell(
          //               onTap: () {},
          //               child: ReservationBtn(
          //                 time: data[index].time! ,
          //                 count:  data[index].count!,
          //               ),
          //             );
          //           }
          //         },
          //       ),
          //     );
          //   },
          //   error: (err, stack) => Text(err.toString()),
          //   loading: () => const Center(
          //     child: CircularProgressIndicator(),
          //   ),
          // ),

          // StreamBuilder<List<ScheduleModel>>(
          //     stream: getData.scheduleDataStream,
          //     builder: (context, snapshot) {
          //       // getData.calendarSelectedFunction(_selectedValue);
          //
          //       if (snapshot.hasError) {
          //         return const Text("snapshot.error");
          //       } else if (snapshot.hasData) {
          //         final scheduleData = snapshot.data;
          //         // print(scheduleData);
          //         getData.calendarSelectedFunction(getData.setDate);
          //         return Row(
          //           mainAxisAlignment: MainAxisAlignment.spaceBetween,
          //           children: [Text('df')],
          //         );
          //         //     GridView.builder(itemCount: getData.dataLength,
          //         //         gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          //         //           crossAxisCount: 4, //1 개의 행에 보여줄 item 개수
          //         //           childAspectRatio: 2 / 1, //item 의 가로 1, 세로 2 의 비율
          //         //           mainAxisSpacing: 10, //수평 Padding
          //         //           crossAxisSpacing: 10, //수직 Padding
          //         //         ), itemBuilder: (context, index) {
          //         //
          //         //
          //         //
          //         // );
          //       }
          //       return CircularProgressIndicator();
          //     }),
          SizedBox(
            height: 200,
          ),
        ],
      ),
    );
  }
}

class _Icons extends StatelessWidget {
  const _Icons({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Container(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.phone_in_talk_sharp,
                  size: 30,
                ),
                Text(
                  '전화',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          ),
          Container(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.place_sharp,
                  size: 30,
                ),
                Text(
                  '길안내',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          ),
          Container(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.favorite_border,
                  size: 30,
                ),
                Text(
                  '좋아요',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          ),
          Container(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.share,
                  size: 30,
                ),
                Text(
                  '공유',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _Context extends StatelessWidget {
  const _Context(
      {required this.city,
      required this.name,
      required this.address,
      required this.phone,
      required this.hole,
      required this.available,
      required this.bookingCount,
      required this.ticket,
      Key? key})
      : super(key: key);
  final String city;
  final String name;
  final String address;
  final String phone;
  final String hole;
  final String available;
  final num bookingCount;
  final num ticket;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width,
      padding: EdgeInsets.symmetric(horizontal: 18.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            city,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
          ),
          SizedBox(
            height: 5,
          ),
          Text(
            name,
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
          ),
          SizedBox(
            height: 5,
          ),
          Row(
            children: [
              SizedBox(
                width: 40,
                child: Text(
                  '위치',
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w400,
                      color: TEXT_GRAY_COLOR),
                ),
              ),
              Text(
                address,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
              ),
              SizedBox(
                width: 10,
              ),
              Row(
                children: [
                  Text(
                    '지도보기',
                    style: TextStyle(
                        color: PRIMARY_COLOR,
                        fontSize: 12,
                        fontWeight: FontWeight.w700),
                  ),
                  Icon(
                    Icons.arrow_forward_ios_outlined,
                    color: PRIMARY_COLOR,
                    size: 10,
                  )
                ],
              ),
            ],
          ),
          SizedBox(
            height: 5,
          ),
          Row(
            children: [
              SizedBox(
                width: 40,
                child: Text(
                  '홀',
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w400,
                      color: TEXT_GRAY_COLOR),
                ),
              ),
              Text(
                hole,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
              ),
            ],
          ),
          SizedBox(
            height: 5,
          ),
          Row(
            children: [
              SizedBox(
                width: 40,
                child: Text(
                  '예약여부',
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w400,
                      color: TEXT_GRAY_COLOR),
                ),
              ),
              Text(
                available,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w400),
              ),
            ],
          ),
          SizedBox(
            height: 20,
          ),
          SizedBox(
            width: MediaQuery.of(context).size.width,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 100,
                  height: 60,
                  decoration: BoxDecoration(
                      border: Border.all(width: 1, color: Color(0xFFdddddd)),
                      borderRadius:
                          const BorderRadius.all(Radius.circular(10))),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '예약가능 인원',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: TEXT_GRAY_COLOR),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            bookingCount.toString(),
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
                Container(
                  width: 100,
                  height: 60,
                  decoration: BoxDecoration(
                      border: Border.all(width: 1, color: Color(0xFFdddddd)),
                      borderRadius:
                          const BorderRadius.all(Radius.circular(10))),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '연 회원 비용',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: TEXT_GRAY_COLOR),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            ticket.toString(),
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                          Text(
                            '원',
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
                Container(
                  width: 100,
                  height: 60,
                  decoration: BoxDecoration(
                      border: Border.all(width: 1, color: Color(0xFFdddddd)),
                      borderRadius:
                          const BorderRadius.all(Radius.circular(10))),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '평점 및 리뷰',
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: TEXT_GRAY_COLOR),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.star,
                            size: 18,
                            color: Colors.amberAccent,
                          ),
                          Text(
                            '4.7',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            '(453)',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _Images extends StatefulWidget {
  const _Images({
    Key? key,
    required this.imgUrl,
  }) : super(key: key);
  final List<String> imgUrl;

  @override
  State<_Images> createState() => _ImagesState();
}

class _ImagesState extends State<_Images> {
  @override
  Widget build(BuildContext context) {
    List<CarouselItem> itemList = [
      CarouselItem(image: NetworkImage(widget.imgUrl[0])),
      CarouselItem(image: NetworkImage(widget.imgUrl[0])),
      CarouselItem(image: NetworkImage(widget.imgUrl[0])),
    ];

    return SingleChildScrollView(
      child: Center(
        child: Column(
          children: [
            Column(
              children: [
                CustomCarouselSlider(
                  items: itemList,
                  height: 220,
                  subHeight: 50,
                  width: MediaQuery.of(context).size.width,
                  autoplay: true,
                  showSubBackground: false,
                  showText: false,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
