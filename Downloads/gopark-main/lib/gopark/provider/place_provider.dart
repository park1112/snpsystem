import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gopark_app/gopark/model/model_place.dart';


final placeProvider = FutureProvider<List<Place>>((ref) async {
  late CollectionReference itemsReference;
  itemsReference = FirebaseFirestore.instance.collection('place');
  List<Place> places = [];

  places = await itemsReference.get().then((QuerySnapshot results) {
    return results.docs.map((DocumentSnapshot document) {
      return Place.fromSnapshot(document);
    }).toList();
  });

  return places;
});


// final reservationProvider = FutureProvider<List<ReservationModel>>((ref) async {
//   late CollectionReference itemsReference;
//   itemsReference = FirebaseFirestore.instance.collection('place');
//   List<ReservationModel> reservations = [];
//
//   reservations = await itemsReference.get().then((QuerySnapshot results) {
//     return results.docs.map((DocumentSnapshot document) {
//       return ReservationModel.fromSnapshot(document);
//     }).toList();
//   });
//
//   return reservations;
// });

// class Database {
//   FirebaseFirestore _firestore = FirebaseFirestore.instance; // Create an instance of Firebase Firestore.
//   // CollectionReference _places; // this holds a refernece to the Movie collection in our firestore.
//
//   Stream get allMovies => _firestore.collection("place").snapshots(); // a stream that is continuously listening for changes happening in the database

  // Add a Movie
  // A method that will add a new Movie m to our Movies collection and return true if its successful.

  // Future<bool> addNewMovie(Place m) async {
  //   _movies = _firestore.collection('movies'); // referencing the movie collection .
  //   try {
  //     await _movies.add(
  //         {'name': m.movieName, 'poster': m.posterURL, 'length': m.length}); // Adding a new document to our movies collection
  //     return true; // finally return true
  //   } catch (e) {
  //     return Future.error(e); // return error
  //   }
  // }

  // Remove a Movie

  // Future<bool> removeMovie(String movieId) async {
  //   _places = _firestore.collection('movies');
  //   try {
  //     await _places.doc(movieId).delete(); // deletes the document with id of movieId from our movies collection
  //     return true; // return true after successful deletion .
  //   } catch (e) {
  //     print(e);
  //     return Future.error(e); // return error
  //   }
  // }
// Edit a Movie
//   Future<bool> editMovie(Place m, String movieId) async {
//     _movies = _firestore.collection('movies');
//     try {
//       await _movies.doc(movieId).update(             // updates the movie document having id of moviedId
//           {'name': m.movieName, 'poster': m.posterURL, 'length': m.length});
//       return true; //// return true after successful updation .
//     } catch (e) {
//       print(e.message);
//       return Future.error(e); //return error
//     }
//   }
// }

// final placeProvider = Provider((ref) => Database());