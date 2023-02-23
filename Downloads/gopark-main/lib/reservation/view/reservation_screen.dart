import 'package:flutter/material.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/layout/default_layout.dart';

// class ReservationScreen extends StatelessWidget {
//   static String get routeName => 'reservation';
//   const ReservationScreen({required this.name,
//     required this.city,
//     required this.address,
//
//      Key? key}) : super(key: key);
//
//   final String city;
//   final String name;
//   final String address;
//
//   @override
//   Widget build(BuildContext context) {
//     return DefaultLayout(
//         title: '예약 접수',
//         child: Column(
//
//           children: [
//             Divider(),
//             _Top(address: address, name: name, city: city),
//
//             Padding(
//               padding: const EdgeInsets.symmetric(vertical: 18.0),
//               child: Divider(thickness: 8, color: DIVIDER_COLOR),
//             ),
//
//
//           ],
//         )
//
//
//     );
//   }
// }
//
//
//
// class _Top extends StatelessWidget {
//   const _Top({
//     required this.address, required this.name , required this.city ,Key? key}) : super(key: key);
//
//   final name;
//   final city;
//   final address;
//   @override
//   Widget build(BuildContext context) {
//     return SizedBox(
//       width: MediaQuery.of(context).size.width,
//       child: Column(
//         crossAxisAlignment: CrossAxisAlignment.start,
//         children: [
//           Text('$name $city', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),),
//           SizedBox(height: 6,),
//           Text(address, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w400),),
//
//         ],
//       ),
//     );
//   }
// }
// class _User extends StatelessWidget {
//   const _User({Key? key}) : super(key: key);
//
//   @override
//   Widget build(BuildContext context) {
//     return Container();
//   }
// }


class ReservationScreen extends StatefulWidget {
  ReservationScreen({
    Key? key,
    required this.city,
    required this.name,
    required this.address,
    required this.phone,
    required this.hole,
    required this.available,
    required this.imgUrl,
    required this.ticket,
    required this.bookingCount,
    required this.reservationDate,
    required this.checkCount,
    required this.oneTimeStart,
    required this.value,
  }) : super(
    key: key,
  );
  final String city;
  final String name;
  final String address;
  final String phone;
  final String hole;
  final String available;
  final String imgUrl;
  final String ticket;
  final String bookingCount;
  final String reservationDate;
  final int checkCount;
  final String oneTimeStart;
  final int value;

  @override
  State<ReservationScreen> createState() => _ReservationScreenState();
}

class _ReservationScreenState extends State<ReservationScreen> {
  final TextStyle kResultTextStyle = TextStyle(fontSize: 16.0);

  final TextStyle tResultTextStyle = TextStyle(fontSize: 20.0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        title: Text('결제하기'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Column(
            children: [
              Container(
                width: MediaQuery.of(context).size.width,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 10.0),
                        child: Text(
                          '상품 정보',
                          style: tResultTextStyle.copyWith(
                              fontWeight: FontWeight.w300),
                        ),
                      ),
                      SizedBox(
                        height: 16,
                      ),
                      Container(
                        height: 100,
                        child: Row(
                          children: [
                            ClipRRect(
                              borderRadius: BorderRadius.circular(8),
                              child: Container(
                                width: 100,
                                child: Image.network(
                                  widget.imgUrl,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                  height: 100,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                child: Padding(
                                  padding: const EdgeInsets.only(
                                    left: 10,
                                  ),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                    children: [
                                      renderTitle(widget.name),
                                      renderRow("예약일시", widget.reservationDate),
                                      renderRow("협회명", "골프협회"),
                                      renderRow("홀정보", "18홀"),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 20,
                      ),
                      Container(
                        height: 50,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text("취소가능기한", style: kResultTextStyle),
                                Text("2023.2.9(목) 09:00",
                                    style: kResultTextStyle.copyWith(
                                        color: PRIMARY_COLOR)),
                              ],
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text("예약 금액", style: kResultTextStyle),
                                Text('${widget.ticket}원',
                                    style: kResultTextStyle.copyWith(
                                        fontWeight: FontWeight.bold)),
                              ],
                            )
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
              SizedBox(
                height: 10,
              ),
              Container(
                width: MediaQuery.of(context).size.width,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 10.0),
                        child: Text(
                          '본인 정보',
                          style: tResultTextStyle.copyWith(
                              fontWeight: FontWeight.w300),
                        ),
                      ),
                      renderUserRow("이름", "박현재"),
                      renderUserRow("연락처", "010-5334-4722"),
                      Row(
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8.0),
                            child: Container(
                                width: 80,
                                child: Text(
                                  "가입협회",
                                  style: kResultTextStyle,
                                )),
                          ),
                          Text("수성구협회", style: kResultTextStyle),
                          Expanded(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton(onPressed: (){}, child: Text("정보 변경", style: kResultTextStyle.copyWith(color: Colors.grey[600]),))
                              ],
                            ),
                          )
                        ],
                      )
                    ],
                  ),
                ),
              ),
              SizedBox(
                height: 10,
              ),
              Container(
                width: MediaQuery.of(context).size.width,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(left: 10.0),
                        child: Text(
                          '최종 결제정보',
                          style: tResultTextStyle.copyWith(
                              fontWeight: FontWeight.w300),
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 10.0),
                            child: Text(
                              "총 상품금액",
                              style: kResultTextStyle.copyWith(color: Colors.grey[600]),
                            ),
                          ),
                          renderTitle('${widget.ticket}원')
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Divider(height: 1, color: Colors.grey,),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [

                            renderTitle("최종 결제금액"),

                            Text(
                              '${widget.ticket}원',
                              style: tResultTextStyle.copyWith(color: PRIMARY_COLOR, fontWeight: FontWeight.bold),
                            )
                          ],
                        ),
                      ),

                    ],
                  ),
                ),
              ),
              SizedBox(height: 10,),
              Container(
                width: MediaQuery.of(context).size.width,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                          padding: const EdgeInsets.only(left: 10.0),
                          child : renderTitle("회원님들께 알립니다!!")),
                      Container(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text("■ 협회회원이 아니면 예약이 불가능합니다.", style: kResultTextStyle.copyWith(color: Colors.red),),
                              Text("(회원승인이 완료 후 예약이 가능해집니다.)", style: kResultTextStyle),
                              SizedBox(height: 10,),
                              Text("■ 이벤트 상품 이용안내", style: kResultTextStyle.copyWith(color: Colors.red),),
                              Text("(회원가입시 5,000 포인트를 지급해 드리고 있습니다. 많은 이용 바랍니다.", style: kResultTextStyle),
                            ],
                          ),
                        ),
                      ),

                    ],
                  ),
                ),
              ),
              SizedBox(height: 10,),
              Container(
                width: MediaQuery.of(context).size.width,
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            renderTitle("최종 결제금액"),
                            Text(
                              '${widget.ticket}원',
                              style: tResultTextStyle.copyWith(color: PRIMARY_COLOR, fontWeight: FontWeight.bold),
                            )
                          ],
                        ),
                      ),
                      SizedBox(height: 20,),
                      Center(
                        child: Container(
                          child: Padding(
                            padding: const EdgeInsets.all(10.0),
                            child: Text("본인은 골프장 별 취소/약관 규정, 개인정보 수입 및 이용, 개인정보 제 3자 제공 내용을 확인하였으며, 결제 진행에 동의합니다.", style: kResultTextStyle,),
                          ),
                        ),
                      ),
                      SizedBox(height: 20,),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8.0),
                        child: Container(
                          height: 50,
                          color: Colors.amberAccent,
                          child: Center(
                            child: Padding(
                                padding: const EdgeInsets.all(10.0),
                                child: TextButton(
                                  onPressed: () {

                                  },

                                  child: Text("동의하고 예약하기", style: kResultTextStyle,),

                                )

                            ),
                          ),
                        ),
                      )

                    ],
                  ),
                ),
              ),

            ],
          ),
        ),
      ),
    );
  }

  renderTitle(name) {
    return Text(
      name,
      style: tResultTextStyle.copyWith(color: PRIMARY_COLOR),
    );
  }

  renderUserRow(name, date) {
    return Row(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8.0),
          child: Container(
              width: 80,
              child: Text(
                name,
                style: kResultTextStyle,
              )),
        ),
        Text(date, style: kResultTextStyle)
      ],
    );
  }

  renderRow(name, date) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          name,
          style: kResultTextStyle,
        ),
        Text(date,
            style: kResultTextStyle.copyWith(fontWeight: FontWeight.w600))
      ],
    );
  }
}



