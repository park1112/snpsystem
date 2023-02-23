import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/const/colors.dart';
import 'package:gopark_app/common/provider/model_place_provider.dart';
import 'package:gopark_app/common/view/association_screen.dart';
import 'package:gopark_app/common/view/root_tab.dart';
import 'package:gopark_app/gopark/provider/place_provider.dart';
import 'package:gopark_app/gopark/provider/today_sale_provider.dart';
import 'package:gopark_app/gopark/provider/user_profile_provider.dart';
import 'package:gopark_app/gopark/view/event_screen.dart';
import 'package:gopark_app/gopark/view/place_details_screen.dart';
import 'package:gopark_app/gopark/widgets/show_dialog.dart';
import 'package:gopark_app/user/view/login_screen.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

class GoparkScreen extends ConsumerWidget {
  const GoparkScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {

    // final userProfile = ref.watch(UserProfileProvider);


    return ListView(
      physics: const BouncingScrollPhysics(),
      children: [
        _Coupon(),
        SizedBox(
          height: 20,
        ),
        _User(),
        SizedBox(
          height: 20,
        ),
        InkWell(
            child: _Qrcode(),
            onTap: () {
              showDialog(
                context: context,
                barrierDismissible: true, //바깥 영역 터치시 닫을지 여부 결정
                builder: ((context) {
                  return ShowDialog(noTap: (){
                    Navigator.pop(context);
                  }
                  ,
                  yesTap: (){context.pushNamed(AssociationSelectScreen.routeName);}
                  );
                }),
              );
            }),

        SizedBox(
          height: 20,
        ),
        Divider(thickness: 8, color: DIVIDER_COLOR),
        SizedBox(
          height: 20,
        ),
        //추천골프장
        RecommendedPlaces(),
        SizedBox(
          height: 20,
        ),
        Divider(thickness: 8, color: DIVIDER_COLOR),
        SizedBox(
          height: 20,
        ),
        //투데이할인
        TodaySale(),
        SizedBox(
          height: 20,
        ),
        Divider(thickness: 8, color: DIVIDER_COLOR),
        SizedBox(
          height: 20,
        ),
        //이벤트
        Evnet(),
        SizedBox(
          height: 20,
        ),
        Divider(thickness: 8, color: DIVIDER_COLOR),
        SizedBox(
          height: 20,
        ),
        BottomAd(),
      ],
    );
  }
}

class _Coupon extends StatelessWidget {
  const _Coupon({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: MediaQuery.of(context).size.width,
        height: 70,
        child: Image.asset('asset/img/coupon.jpg', fit: BoxFit.cover));
  }
}

class _User extends StatefulWidget {
  const _User({Key? key}) : super(key: key);

  @override
  State<_User> createState() => _UserState();
}

class _UserState extends State<_User> {

  String nickname = ""; //user의 정보를 저장하기 위한 변수
  String url = ""; //user의 정보를 저장하기 위한 변수
  static final storage = new FlutterSecureStorage(); //flutter_secure_storage 사용을 위한 초기화 작업

  @override

  void initState() {
    super.initState();

    //비동기로 flutter secure storage 정보를 불러오는 작업.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _asyncMethod();
    });
  }

  _asyncMethod() async {

//토큰 삭제
    // final prefs = await SharedPreferences.getInstance();
    // prefs.remove('counter');
//토큰 삭제

    //read 함수를 통하여 key값에 맞는 정보를 불러오게 됩니다. 이때 불러오는 결과의 타입은 String 타입임을 기억해야 합니다.
    //(데이터가 없을때는 null을 반환을 합니다.)
    String? nickname = await storage.read(key: 'nickname');
    String? url = await storage.read(key: "profileUrl");
    print(nickname);
    print(url);

    // //user의 정보가 있다면 바로 로그아웃 페이지로 넝어가게 합니다.
    // if (userInfo != null) {
    //   Navigator.pushReplacement(
    //       context,
    //       CupertinoPageRoute(
    //           builder: (context) => LogOutPage(
    //             id: userInfo.split(" ")[1],
    //             pass: userInfo.split(" ")[3],
    //           )));
    // }
  }

  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 37,
            // backgroundImage: AssetImage('asset/img/elon.jpg'),
            backgroundImage : NetworkImage('https://p.kakaocdn.net/th/talkp/wl3KTNRZ6g/hoks2IsbrgGku6t2C1T8Hk/6fmj8k_640x640_s.jpg'),
            // backgroundImage : Image.network(url!),
          ),
          const SizedBox(
            width: 20,
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    '건강한 박현재',
                    style:
                        TextStyle(fontSize: 16.0, fontWeight: FontWeight.w700),
                  ),
                  Text(
                    '님',
                    style: TextStyle(fontSize: 16.0),
                  )
                ],
              ),
              const Text(
                '오늘도 좋은 하루 보내세요!',
                style: TextStyle(fontSize: 16.0),
              ),
            ],
          )
        ],
      ),
    );
  }
}

class _Qrcode extends StatelessWidget {
  const _Qrcode({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Flexible(
            flex: 1,
            child: Container(
              height: 120,
              width: 120,
              decoration: PRIMARY_GRADIENT_H.copyWith(
                  borderRadius: BorderRadius.circular(10)),
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Container(
                  color: Colors.white,
                  child: (Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: PRIMARY_COLOR,
                        child: Icon(
                          Icons.manage_accounts_outlined,
                          size: 22,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        '모바일 QR',
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w700),
                      ),
                      Text(
                        '입장 및 협회인증',
                        style: TextStyle(
                            fontSize: 13, fontWeight: FontWeight.w400),
                      ),
                    ],
                  )),
                ),
              ),
            ),
          ),
          SizedBox(
            width: 18,
          ),
          Flexible(
              flex: 2,
              child: Container(
                height: 120,
                decoration: PRIMARY_GRADIENT_H.copyWith(
                    borderRadius: BorderRadius.circular(10)),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: const [
                    Icon(
                      Icons.room_outlined,
                      size: 60,
                      color: Colors.white,
                    ),
                    Text(
                      '내 주변 \n파크골프존 찾기',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w700),
                    ),
                    Icon(
                      Icons.arrow_forward_ios_outlined,
                      size: 35,
                      color: Colors.white,
                    ),
                  ],
                ),
              ))
        ],
      ),
    );
  }
}

class RecommendedPlaces extends ConsumerWidget {
  const RecommendedPlaces({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(placeProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '박현재님을 위한 추천 파크골프장',
                style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.w700),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text(
                    '전체보기 ',
                    style: TextStyle(fontSize: 12),
                  ),
                  Icon(
                    Icons.arrow_forward_ios_outlined,
                    size: 10,
                  )
                ],
              )
            ],
          ),
          const SizedBox(
            height: 12,
          ),
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            scrollDirection: Axis.horizontal,
            child: state.when(
              data: (data) {
                return SizedBox(
                  height: 200,
                  width: MediaQuery.of(context).size.width,
                  child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: data.length,
                      separatorBuilder: (context, index) {
                        return const SizedBox(width: 20);
                      },
                      itemBuilder: (context, index) {
                        return InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => PlaceDetailsScreen(
                                  city: data[index].city,
                                  name: data[index].name,
                                  address: data[index].address,
                                  phone: data[index].phone,
                                  hole: data[index].hole,
                                  available: data[index].available,
                                  imgUrl: data[index].imgUrl,
                                  ticket: data[index].ticket,
                                  bookingCount: data[index].bookingCount,
                                ),
                              ),
                            );
                          },
                          child: Container(
                            decoration: BoxDecoration(
                                border: Border.all(
                                    width: 1, color: Color(0xFFdddddd)),
                                borderRadius: const BorderRadius.all(
                                    Radius.circular(10))),
                            width: 180,
                            height: 180,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                SizedBox(
                                  width: 180,
                                  height: 120,
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.only(
                                        topRight: Radius.circular(10.0),
                                        topLeft: Radius.circular(10.0)),
                                    child: Image.network(
                                      data[index].imgUrl[0],
                                      fit: BoxFit.fill,
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  height: 58,
                                  width: 180,
                                  child: Padding(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10.0),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          data[index].name,
                                          style: const TextStyle(
                                              fontWeight: FontWeight.w500,
                                              fontSize: 15),
                                        ),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              data[index].city,
                                              style: const TextStyle(
                                                  color: Colors.black,
                                                  fontWeight: FontWeight.w300,
                                                  fontSize: 12),
                                            ),
                                            Row(
                                              children: const [
                                                Icon(
                                                  Icons.star,
                                                  size: 18,
                                                  color: Colors.amberAccent,
                                                ),
                                                Text(
                                                  '4.7',
                                                  style: TextStyle(
                                                      fontWeight:
                                                          FontWeight.w300,
                                                      fontSize: 12.0),
                                                )
                                              ],
                                            )
                                          ],
                                        )
                                      ],
                                    ),
                                  ),
                                )

                                // Row(
                                //   children: List<Icon>.generate(5, (index) {
                                //     return Icon(
                                //       index == 4
                                //           ? CupertinoIcons.star_lefthalf_fill
                                //           : CupertinoIcons.star_fill,
                                //       color: const Color(0xFFFAC921),
                                //       size: 14,
                                //     );
                                //   }),
                                // )
                              ],
                            ),
                          ),
                        );
                      }),
                );
              },
              error: (err, stack) => Text(err.toString()),
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class TodaySale extends ConsumerWidget {
  const TodaySale({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(todaySaleProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '투데이 할인 특가',
                style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.w700),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  InkWell(
                    onTap: () {
                      context.goNamed(EventScrenn.routeName);
                    },
                    child: const Text(
                      '전체보기 ',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                  Icon(
                    Icons.arrow_forward_ios_outlined,
                    size: 10,
                  )
                ],
              )
            ],
          ),
          const SizedBox(
            height: 12,
          ),
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            scrollDirection: Axis.horizontal,
            child: state.when(
              data: (data) {
                return SizedBox(
                  height: 150,
                  width: MediaQuery.of(context).size.width,
                  child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: data.length,
                      separatorBuilder: (context, index) {
                        return const SizedBox(width: 20);
                      },
                      itemBuilder: (context, index) {
                        return InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => LoginScreen(
                                    // city: data[index].city,
                                    // name: data[index].name,
                                    // address: data[index].address,
                                    // phone: data[index].phone,
                                    // hole: data[index].hole,
                                    // available: data[index].available,
                                    // imgUrl: data[index].imgUrl,
                                    // ticket: data[index].ticket,
                                    // bookingCount: data[index].bookingCount,
                                    ),
                              ),
                            );
                          },
                          child: Container(
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius:
                                    const BorderRadius.all(Radius.circular(10)),
                              ),
                              width: 270,
                              height: 150,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 18.0),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Container(
                                            decoration: const BoxDecoration(
                                                color: Colors.black,
                                                borderRadius:
                                                    BorderRadius.horizontal(
                                                        left:
                                                            Radius.circular(10),
                                                        right: Radius.circular(
                                                            10))),
                                            child: Padding(
                                              padding: EdgeInsets.symmetric(
                                                  horizontal: 8.0),
                                              child: Padding(
                                                padding: EdgeInsets.only(
                                                    bottom: 1.0),
                                                child: Text(
                                                  data[index].city,
                                                  style: TextStyle(
                                                      fontSize: 12.0,
                                                      color: Colors.white),
                                                ),
                                              ),
                                            )),
                                        Text(
                                          data[index].name,
                                          style: TextStyle(
                                              fontSize: 14.0,
                                              fontWeight: FontWeight.w500,
                                              color: Colors.white),
                                        ),
                                        Text(
                                          data[index].name,
                                          style: TextStyle(
                                              fontSize: 20.0,
                                              fontWeight: FontWeight.w700,
                                              color: Colors.white),
                                        ),
                                        SizedBox(
                                          height: 15,
                                        ),
                                        Text(
                                          '기간 : ${data[index].date} ',
                                          style: TextStyle(
                                              fontSize: 8.0,
                                              fontWeight: FontWeight.w400,
                                              color: Colors.white),
                                        ),
                                      ],
                                    ),
                                    CircleAvatar(
                                      radius: 52,
                                      backgroundImage: NetworkImage(
                                        data[index].imgUrl,
                                      ),
                                    )
                                  ],
                                ),
                              )),
                        );
                      }),
                );
              },
              error: (err, stack) => Text(err.toString()),
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class Evnet extends ConsumerWidget {
  const Evnet({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(todaySaleProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '지금 진행중인 이벤트',
                style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.w400),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Text(
                    '전체보기 ',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  Icon(
                    Icons.arrow_forward_ios_outlined,
                    size: 10,
                  )
                ],
              )
            ],
          ),
          const SizedBox(
            height: 12,
          ),
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            scrollDirection: Axis.horizontal,
            child: state.when(
              data: (data) {
                return SizedBox(
                  height: 320,
                  width: MediaQuery.of(context).size.width,
                  child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: data.length,
                      separatorBuilder: (context, index) {
                        return const SizedBox(width: 20);
                      },
                      itemBuilder: (context, index) {
                        return InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => EventScrenn(
                                    // city: data[index].city,
                                    // name: data[index].name,
                                    // address: data[index].address,
                                    // phone: data[index].phone,
                                    // hole: data[index].hole,
                                    // available: data[index].available,
                                    // imgUrl: data[index].imgUrl,
                                    // ticket: data[index].ticket,
                                    // bookingCount: data[index].bookingCount,
                                    ),
                              ),
                            );
                          },
                          child: SizedBox(
                            width: 340,
                            height: 320,
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(10.0),
                              child: Image.network(
                                data[index].imgUrl,
                                fit: BoxFit.fill,
                              ),
                            ),
                          ),
                        );
                      }),
                );
              },
              error: (err, stack) => Text(err.toString()),
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class BottomAd extends StatelessWidget {
  const BottomAd({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: MediaQuery.of(context).size.width,
        height: 120,
        child: Image.asset('asset/img/advertisement.png', fit: BoxFit.cover));
  }
}
