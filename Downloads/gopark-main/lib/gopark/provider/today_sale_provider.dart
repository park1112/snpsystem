import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gopark_app/gopark/model/model_place.dart';
import 'package:gopark_app/gopark/model/model_today_sale.dart';

final todaySaleProvider = FutureProvider<List<TodaySale>>((ref) async {
  late CollectionReference itemsReference;
  itemsReference = FirebaseFirestore.instance.collection('todaySale');
  List<TodaySale> todaySale = [];

  todaySale = await itemsReference.get().then((QuerySnapshot results) {
    return results.docs.map((DocumentSnapshot document) {
      return TodaySale.fromSnapshot(document);
    }).toList();
  });

  return todaySale;
});