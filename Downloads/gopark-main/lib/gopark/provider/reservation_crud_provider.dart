import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:gopark_app/gopark/model/model_reservation_crud.dart';

class Database {
  FirebaseFirestore _firestore =
      FirebaseFirestore.instance; // Create an instance of Firebase Firestore.
  late CollectionReference
      _reservation; // this holds a refernece to the Movie collection in our firestore.

  Stream get allMovies => _firestore
      .collection("reservation")
      .snapshots(); // a stream that is continuously listening for changes happening in the database

  // Add a Movie
  // A method that will add a new Movie m to our Movies collection and return true if its successful.
  Future<bool> addNewMovie(ReservationCRUDModel m) async {
    _reservation = _firestore
        .collection('reservation'); // referencing the movie collection .
    try {
      await _reservation.add({
        'place': m.placeName,
        'dateTime': m.dateTime,
        'oneTimeStart': '06:00',
        'twoTimeStart': '9:00',
        'threeTimeStart': '12:00',
        'fourTimeStart': '15:00',
        'oneTimeCount': m.count,
        'twoTimeCount': m.count,
        'threeTimeCount': m.count,
        'fourTimeCount': m.count,
      }); // Adding a new document to our movies collection
      return true; // finally return true
    } catch (e) {
      return Future.error(e); // return error
    }
  }

  // Remove a Movie
  Future<bool> removeMovie(String movieId) async {
    _reservation = _firestore.collection('reservation');
    try {
      await _reservation
          .doc(movieId)
          .delete(); // deletes the document with id of movieId from our movies collection
      return true; // return true after successful deletion .
    } catch (e) {
      print(e);
      return Future.error(e); // return error
    }
  }

// Edit a Movie
  Future<bool> editMovie(ReservationCRUDModel m, String movieId) async {
    _reservation = _firestore.collection('reservation');
    try {
      await _reservation
          .doc(movieId)
          .update(// updates the movie document having id of moviedId
              {
        'place': m.placeName,
        'dateTime': m.dateTime,
        'oneTimeCount': m.count,
        'twoTimeCount': m.count,
        'threeTimeCount': m.count,
        'fourTimeCount': m.count,
      });
      return true; //// return true after successful updation .
    } catch (e) {
      print(e);
      return Future.error(e); //return error
    }
  }
}

// Creating a simple Riverpod provider that provides an instance of our Database class so that it can be used from our UI(by calling Database class methods)
final databaseProvider = Provider((ref) => Database());
