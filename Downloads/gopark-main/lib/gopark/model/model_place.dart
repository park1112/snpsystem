import 'package:cloud_firestore/cloud_firestore.dart';

class Place {
  late String id;
  late String city;
  late String name;
  late String address;
  late String phone;
  late String hole;
  late String available;
  late List<String> imgUrl;
  late int ticket;
  late int bookingCount;


  Place({
    required this.id,
    required this.city,
    required this.name,
    required this.address,
    required this.phone,
    required this.hole,
    required this.available,
    required this.imgUrl,
    required this.ticket,
    required this.bookingCount,
  });

  Place.fromSnapshot(DocumentSnapshot snapshot) {
    Map<String, dynamic> data = snapshot.data() as Map<String, dynamic>;
    id = snapshot.id;
    city = data['city'];
    name = data['name'];
    address = data['address'];
    phone = data['phone'];
    hole = data['hole'];
    available = data['available'];
    imgUrl = List<String>.from(data['imgUrl']);
    ticket = data['ticket'];
    bookingCount = data['bookingCount'];
  }
}


