import 'package:cloud_firestore/cloud_firestore.dart';

class TodaySale {
  late String id;
  late String city;
  late String name;
  late String date;
  late String sale;
  late String available;
  late String imgUrl;



  TodaySale({
    required this.id,
    required this.city,
    required this.name,
    required this.date,
    required this.sale,
    required this.available,
    required this.imgUrl,

  });

  TodaySale.fromSnapshot(DocumentSnapshot snapshot) {
    Map<String, dynamic> data = snapshot.data() as Map<String, dynamic>;
    id = snapshot.id;
    city = data['city'];
    name = data['name'];
    date = data['date'];
    sale = data['sale'];
    available = data['available'];
    imgUrl = data['imgUrl'];
  }
}