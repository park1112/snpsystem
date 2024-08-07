// components
import SvgIconStyle from '../../../components/SvgIconStyle';



// ----------------------------------------------------------------------

const getIcon = (name) => {
  const iconPath = `/icons/${name}.svg`;
  console.log(`Icon Path: ${iconPath}`); // 콘솔에 경로 출력
  return <SvgIconStyle src={iconPath} sx={{ width: 1, height: 1 }} />;
};

const ICONS = {
  user: getIcon('ic_user'),
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
};

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'snpsystem v2.6.14',
    items: [
      // { title: '맵', path: '/map', icon: ICONS.ecommerce },
      { title: '에스엔피 오픈마켓집계', path: '/dashboard/snp', icon: ICONS.ecommerce },
      { title: '아르고 오픈마켓집계', path: '/dashboard/argo', icon: ICONS.ecommerce },
      { title: '플러스 오픈마켓집계', path: '/dashboard/one', icon: ICONS.ecommerce },

      { title: '오픈마켓현황', path: '/dashboard/two', icon: ICONS.dashboard },
      { title: '온라인_등록페이지', path: '/dashboard/ProductForm', icon: ICONS.analytics },
      { title: '에스엔피_마켓집계', path: '/dashboard/three', icon: ICONS.analytics },
    ],
  },
  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: '조회',
    items: [
      {
        title: '창고별_생산재고_warehouse',
        path: '/inventory/warehouse',
        icon: ICONS.user,
      },
      {
        title: '생산재고_수정삭제_inventory',
        path: '/inventory',
        icon: ICONS.user,
      },
      {
        title: '출고등록_거래처검색',
        path: '/shipping',
        icon: ICONS.user,
      },
      {
        title: '출고조회_리스트',
        path: '/shipping/list',
        icon: ICONS.user,
      },
      {
        title: '캘린더_일정관리',
        path: '/calendar',
        icon: ICONS.user,
      },
    ],
  },
  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: '전메뉴_조회',
    items: [
      {
        title: '상품_PRODUCTS',
        path: '/products',
        icon: ICONS.user,
      },
      {
        title: '작업팀_teams',
        path: '/teams',
        icon: ICONS.user,
      },
      {
        title: '창고_warehouses',
        path: '/warehouses',
        icon: ICONS.user,
      },
      {
        title: '거래처_partners',
        path: '/partners',
        icon: ICONS.user,
      },
      {
        title: '운송사_transports',
        path: '/transports',
        icon: ICONS.user,
      },
      {
        title: '물류기기_logistics',
        path: '/logistics',
        icon: ICONS.user,
      },
      {
        title: '물류기기_이동조회',
        path: '/logistics-management',
        icon: ICONS.user,
      },
    ],
  },


  // // warehouses
  // // ----------------------------------------------------------------------
  // {
  //   subheader: '창고_warehouses',
  //   items: [
  //     {
  //       title: '창고_warehouses',
  //       path: '/warehouses',
  //       icon: ICONS.user,
  //       children: [
  //         { title: '창고목록', path: '/warehouses' },
  //         { title: '창고추가', path: '/warehouses/add' },
  //         // { title: '', path: '/dashboard/user/six' },

  //       ],
  //     },
  //   ],

  // },
  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      {
        title: 'user',
        path: '/dashboard/user',
        icon: ICONS.user,
        children: [
          { title: '제품등록', path: '/dashboard/user/four' },
          { title: '제품단가입력', path: '/dashboard/user/five' },
          { title: '결제목록', path: '/dashboard/user/six' },
        ],
      },
    ],
  },
];

export default sidebarConfig;
//변경해야될것 , 전체 확인물량 코드 추가

// 2.0.1 에스엔피 5키로 양파 추가
// 2.0.2 아르고 깐양파 추가
// 2.0.3 에스엔피 5키로 옵션id 수정, 10키로 중 추가
// 2.0.4 아르고 네이버 깐마늘 1kg , 10kg 추가
// 2.0.5 아르고 지마켓 번호 추가
// 2.0.6 에스엔피 감자(중),당근,무,고구마 추가  240110
// 2.0.7 에러수정  240110
// 2.0.8 에러수정  240110
// 2.0.9 에러수정  240110
// 2.1.0 snp쿠팡, 콜라비, 양배추 추가  240111
// 2.1.1 snp네이버, 콜라비, 양배추 등 추가  240112
// 2.1.2 snp쿠팡 , 20키로15키로10키로양파, 마늘10kg 추가   240117
// 2.1.3 에스엔피, 아르고, 더블체크 코드와 등록안된 아이템 있을경우 alert창으로 경고메시치 출력 240118
// 2.1.4 오류 수정 240118
// 2.1.5 snp 깐양파 스트리폼 추가 , 일반 깐양파에 box라 표기 추가 그것만 일반 박스 나머지는 스티로폼 !!  240122
// 2.1.6 적양파 추가!! 240123
// 2.1.7 아르고 토스 추가 !!
// 2.1.8 에러수정 !!
// 2.1.9 에스엔피 5kg 다시 수정
// 2.2.0 에러수정
// 2.2.1 에러수정
// 2.2.2 아르고 네이버양파 소 추가 , 에스엔피 적양파 추가 , 플러스 추가
// 2.2.3 에러수정
// 2.2.4 판매자 전용 추가
// 2.2.5 플러스 수정
// 2.2.6 에스엔피 파지감자 5,10kg 추가
// 2.2.7 잘못표기된 장아찌용 수정완료 (아르고)
// 2.2.8 에러 수정 및 에스엔피 손질 적양파 추가 !!
// 2.2.9 베트남 당근 추가 !!
// 2.3.0 cj대한통운 택배로 운송료 변경
// 2.3.1 쌍구 및 에스엔피 새로운 양파 추가
// 2.3.2 적양파 3kg 네이버 추가 수정
// 2.3.3 버그 fix
// 2.3.4 버그 fix
// 2.3.5 버그 fix 적양파 대중소 수정
// 2.3.6 에스엔피 베트남당근, 감자 + 비품파지 네이버 추가
// 2.3.7 깐적양파 - 추가 (옵션정보확인 잘해야될듯)
// 2.3.8 깐마늘 5키로 추가 !!
// 2.3.9 적양파 3키로 장아찌 추가 !!
// 2.4.0 무 ,  햇마늘, 통마늘 추가 !!
// 2.4.2 아르고 변경
// 2.4.4 에러제거 및 아르고수정완료
// 2.4.5 여러가지 많은것 추가함 (이때부터 아르고 에스엔피 합쳐짐 )
// 2.5.2 상품 추가,조회,삭제 , 창고 추가,조회,삭제, 수정완료, SortableTableHeader를 통해 클릭시 정렬가능,
// 2.5.3 페이지 추가 (운송사, 파트너, 작업팀, 물류기기, crud 완성)
// 2.5.4 창고별 생산재고 추가 완료 (inventory_addInventory, inventory_select , )
// 2.5.6 창고별 생산재고 완료  _ 생산재고추가되면, 선택된 창고 상품필드에도 업로드 , 수정, 삭제 가능
// 2.5.8 거래처 등록완료 _ 출고정보입력후 수정,삭제, 창고정보 변경, 완료 , 수정 후 상품 되돌리기 기능 아직 미완료
// 2.6.0 물류기기 관련 수정,생성,삭제 모두 해결 , 상품,거래처,물류기기,시간 모델 완성, 모델로 생성 및 수정해야됨
// 2.6.1 기타수정완료
// 2.6.12 캘린더 추가, 인벤토리에 작업팀 추가, 각종 버그제거 
// 2.6.13 logistics_movements 추가 DataGrid 사용으로 디자인 개선 , 로그인, 로그아웃, 유저 정보(전역에서사용), admin페이지 생성, 유저관리가능, 유저등급추가,
// 2.6.14 updateWarehouseInventory(창고재고추가), updateOrDeleteMovement(창고재고삭제) updateMovement(물류기기입출고(수정)) , 








// 내일 할것










// 수정해야할것 , 
// 캘린더에서 출고등록시 , 창고별 필터를 통해서 창고별재고상품 순으로 나타내야함. 맨위에 출고창고 선택하는칸 만들기
// 창고별재고상품 창고별로 나눌수 있도록해야함.(맨위에 필터버튼을 전체, 각창고1 각창고2 로 필터버튼생성하면됨)




// 물류기기 이동하는것 만들면 , 물류기기 입고, 페이지 만들것 , <완성>
// 앞으로 해야될것, 인벤토리 생성시 물류기기 이동할수 있도록 물류기기컬렉션 만들어서 추가하는방법 생각할것 , 두개의 종류일때를 대처해야함
// 출고될때 물류기기 이동할수있도록 만들것, 쇼핑컬렉션 다시 손봐야할듯 





// 만들것 
// 정산 페이지 (정산일정입력,정산예정,정산완료,)
// 기능 : 정산일이 -1일 되면 알림으로 알리기, 당일되었을경우 알리기, 정산일다가오는순으로 목록정리하기, 




// 쇼핑에서 모든 정보 가져와서 정산예정, 정산 2둘하나로 선택해서 넘겨 금액입력 및 정산날짜 입력
// 쇼핑에 마지막 운송료 주체에 거래처컬렉션 정보 가져오기
// 정산관리 만드는데 쇼핑컬렉션에 추가할것
// 총액. - 정산총액 - 수수료 - 송장확인 - 운임주체 
// 추후 각 바렛트별로 단가 입력할수 있도록 추가해야됨 



// 입고, 생성, 출고 페이지 만들기 
// 주요 기능 : 입고 페이지( 기존 재고 페이지와 비슷하게 만들면 될듯) 
// 생성은 양파를 사용해서 사용량을 나타낼수 있다 , 그러면 하루 생산량 비품비율, 로스율까지 나타낼수 있다
// 출고 : 상품을 1톤차량이나, 거래처에 판매한다. (금액, 로스, 물류기기, 추가) , 출고시 상품선택할수 있도록 하여, 여러 물건을 입고출고하게 한다.





// 창고별 물류기기 내역페이지만들것, 
// 창고별 입고내역 페이지
// 창고별 재고내역 페이지
// 창고별 출고내역 페이지 

// 물류기기 이동시




// 추가할기능 
// 물류기기 최소알림단위 추가하여, 최소 알림단위보다 밑으로 재고 내려가면, 알림

//
// 1.인벤토리 리스트 페이지 컴포넌트화 해서 여러 페이지 가능하게 만들기 검색기능 필터기능 똑같이 구현 

// 쇼핑에 물류기기수량과 상품수량 안맞는 버그 



// 인벤토리에 무게 타입 물류기기 아무것도 저장 안된는거 버그










