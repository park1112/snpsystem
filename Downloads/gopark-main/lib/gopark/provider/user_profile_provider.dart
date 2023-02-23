import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:gopark_app/gopark/model/model_user_kakao.dart';

// final UserProfileProvider = StateNotifierProvider<UserProfileNotifier, <List<UserKakoModel>>((ref) => UserProfileNotifier(),);
//
// class UserProfileNotifier extends StateNotifier<List<UserKakoModel>>{
//   UserProfileNotifier():
//       super([
//         UserKakoModel(
//        nickname : '감나무',
//           profileUrl: 'https://firebasestorage.googleapis.com/v0/b/snp-system.appspot.com/o/elon.jpg?alt=media&token=4a3aca7a-0c15-4126-a0c7-38e3332fa63d'
//         )
//       ]);
//   void getStorageUser()async{
//     final storage = FlutterSecureStorage();
//     var name = await storage.read(key: "nickname");
//     var url = await storage.read(key: "profileUrl");
//     UserKakoModel(
//         nickname :  name.toString(),
//       profileUrl: url.toString()
//     );
//   }
// }

final UserProfileProvider = StateProvider((ref){


      final storage = FlutterSecureStorage();
    var name = storage.read(key: "nickname");
    var url = storage.read(key: "profileUrl");
    return {
      name : name,
      url: url,
    };

});