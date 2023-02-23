import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:gopark_app/common/layout/default_layout.dart';

class GoogleMapScreen extends StatefulWidget {
  static String get routeName => 'map';

  const GoogleMapScreen({Key? key}) : super(key: key);

  @override
  State<GoogleMapScreen> createState() => _GoogleMapScreenState();
}

class _GoogleMapScreenState extends State<GoogleMapScreen> {
  // Latitude - 위도  , longitude - 경도
  static final LatLng companyLatLng = LatLng(37.5233273, 126.921252);
  static final CameraPosition initialPosition = CameraPosition(
    target: companyLatLng,
    zoom: 15,
  );

  static final Marker marker = Marker(
    markerId: MarkerId('marker'),
    position: companyLatLng,
    infoWindow: InfoWindow(
      title: '수성파크골프',
    ),
  );

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: checkPermission(),
        builder: (BuildContext context, AsyncSnapshot snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(
              child: CircularProgressIndicator(),
            );
          }

          if (snapshot.data == '위치 권한이 허가되었습니다.') {
            return Container(
              child: GoogleMap(
                mapType: MapType.normal,
                initialCameraPosition: initialPosition,
                myLocationEnabled: true,
                markers: Set.from([marker]),
              ),
            );
          }

          return Center(
            child: Text(snapshot.data),
          );
        });
  }

  Future<String> checkPermission() async {
    final isLocationEnabled = await Geolocator.isLocationServiceEnabled();

    if (!isLocationEnabled) {
      return '위치 서비스를 활성화 해주세요.';
    }
    LocationPermission checkedPermission = await Geolocator.checkPermission();

    //사용할수는 없지만 요청할수 있다 .
    if (checkedPermission == LocationPermission.denied) {
      //요청하는 다이얼로그를 뛰운다 .
      checkedPermission = await Geolocator.requestPermission();

      if (checkedPermission == LocationPermission.denied) {
        return '위치 권한을 허가해주세요.';
      }
    }

    if (checkedPermission == LocationPermission.deniedForever) {
      return '설정에서 앱의 위치 권한을 허용해 주세요.';
    }

    return '위치 권한이 허가되었습니다.';
  }
}
