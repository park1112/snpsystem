import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:gopark_app/common/provider/model_place_provider.dart';
import 'package:gopark_app/common/view/association_screen.dart';
import 'package:gopark_app/common/view/loding_splash_screen.dart';
import 'package:gopark_app/common/view/root_tab.dart';
import 'package:gopark_app/common/view/splash_screen.dart';
import 'package:gopark_app/gopark/provider/reservation_time_provider.dart';
import 'package:gopark_app/gopark/view/event_detail_screen.dart';
import 'package:gopark_app/gopark/view/event_screen.dart';
import 'package:gopark_app/map/view/google_map_screen.dart';
import 'package:gopark_app/mypage/view/company_info_screen.dart';
import 'package:gopark_app/mypage/view/my_page_screen.dart';
import 'package:gopark_app/mypage/view/notice_screen.dart';
import 'package:gopark_app/mypage/view/version_screen.dart';
import 'package:gopark_app/reservation/view/reservation_screen.dart';
import 'package:gopark_app/user/provider/management_provider.dart';
import 'package:gopark_app/user/view/admin_date_add_screen.dart';
import 'package:gopark_app/user/view/firebase_phone_screen.dart';
import 'package:gopark_app/user/view/firebase_singup_scrren.dart';
import 'package:gopark_app/user/view/login_screen.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:kakao_flutter_sdk/kakao_flutter_sdk.dart';
import 'package:provider/provider.dart' as providerP;
import 'firebase_options.dart';

void main() async {
  KakaoSdk.init(
      nativeAppKey: '63f2465c7e4f89aca64864c407dac9c4',
      javaScriptAppKey: '8d7a001c47e1c3db5f8d46513bb2be9d');
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  await initializeDateFormatting();
  runApp(ProviderScope(
      child: providerP.MultiProvider(providers: [
    providerP.ChangeNotifierProvider(create: (_) => DetailManageMentProvider()),
    providerP.ChangeNotifierProvider(create: (_) => PlaceProvider()),
    providerP.ChangeNotifierProvider(create: (_) => ManageMentProvider()),
  ], child: _App())));
}

class _App extends ConsumerWidget {
  _App({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      theme: ThemeData(
        fontFamily: 'NotoSans',
      ),
      debugShowCheckedModeBanner: false,
      routeInformationProvider: _router.routeInformationProvider,
      routeInformationParser: _router.routeInformationParser,
      routerDelegate: _router.routerDelegate,
    );
  }

  final _router = GoRouter(
    routes: [
      GoRoute(
        path: '/',
        name: SplashScreen.routeName,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
          path: '/home',
          name: RootTab.routeName,
          builder: (context, state) => const RootTab(),
          routes: [
            GoRoute(
                path: 'event',
                name: EventScrenn.routeName,
                builder: (context, state) => const EventScrenn(),
                ),
            GoRoute(
              path: 'eventDetail',
              name: EventDetailScreen.routeName,
              builder: (context, state) => const EventDetailScreen(),
            ),
          ]),
      GoRoute(
        path: '/loding',
        name: LodingSplashScreen.routeName,
        builder: (context, state) => const LodingSplashScreen(),
      ),
      GoRoute(
        path: '/association',
        name: AssociationSelectScreen.routeName,
        builder: (context, state) => const AssociationSelectScreen(),
      ),
      GoRoute(
          path: '/login',
          name: LoginScreen.routeName,
          builder: (context, state) => const LoginScreen(),
          routes: [
            GoRoute(
              path: 'phone',
              name: FirebasePhoneScreen.routeName,
              builder: (context, state) => const FirebasePhoneScreen(),
            ),
            GoRoute(
              path: 'singup',
              name: FirebaseSignUpScreen.routeName,
              builder: (context, state) => FirebaseSignUpScreen(
                  verificationId: state.params['verificationId']!),
            ),
          ]),
      GoRoute(
        path: '/map',
        name: GoogleMapScreen.routeName,
        builder: (context, state) => const GoogleMapScreen(),
      ),
      GoRoute(
        path: '/admin',
        name: AdminDateAddScreen.routeName,
        builder: (context, state) => const AdminDateAddScreen(),
      ),
      GoRoute(
        path: '/mypage',
        name: MyPageScreen.routeName,
        builder: (context, state) => const MyPageScreen(),
        routes: [
          GoRoute(
            path: 'version',
            name: VersionScreen.routeName,
            builder: (context, state) => VersionScreen(
                version: state.params['version']!),
          ),
          GoRoute(
            path: 'info',
            name: CompanyInfoScreen.routeName,
            builder: (context, state) => CompanyInfoScreen(),
          ),
          GoRoute(
            path: 'notice',
            name: NoticeScreen.routeName,
            builder: (context, state) => NoticeScreen(),
          ),

        ]
      ),
    ],
  );
}
