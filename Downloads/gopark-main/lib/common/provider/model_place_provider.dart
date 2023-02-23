import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:gopark_app/gopark/model/model_place.dart';
import 'package:provider/provider.dart';

class PlaceProvider with ChangeNotifier {
  late CollectionReference itemsReference;
  List<Place> places = [];
  Set<String> placeNameSave =<String>{};
  int dataLength = 0;
  String dropDownValue='';


  PlaceProvider({reference}) {
    itemsReference = reference ?? FirebaseFirestore.instance.collection('place');
  }

  Future<void> fetchItems() async {
    places = await itemsReference.get().then( (QuerySnapshot results) {
      return results.docs.map( (DocumentSnapshot document) {
        return Place.fromSnapshot(document);
      }).toList();
    });
    dataLength = places.length;
    notifyListeners();
  }

  indexCallBack(){
    for(int index = 0;index<dataLength;index++){
      placeNameSave.add(places[index].name);
    }
    dropDownValue = placeNameSave.first;
    return dropDownValue;
  }
  int placeHoleCount = 0;
  dropDownChange(String value){
    dropDownValue = value;
    if(dropDownValue == places[0].name) {
      placeHoleCount = places[0].bookingCount;
    } else if(dropDownValue == places[1].name) {
      placeHoleCount = places[1].bookingCount;
    }else if(dropDownValue == places[2].name) {
      placeHoleCount = places[2].bookingCount;
    }

    notifyListeners();
    return value;
  }
}