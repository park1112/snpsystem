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
    subheader: 'snpsystem v2.6.12',
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

// 내일 할것

// 상품추가에 작업단가, 물류기기, 물류기기 기본수량, 적재된 기본수량, 추가버튼으로 다른물류기기 선택할수 있도록 변경, ex:망,망수량 1개, 아주바렛트, 바렛트수량1개,

// 내일 할것 물류기기 모든 자료 가져와서
// 입고자료로 만든다 .
// 입고자료 밑에 창고추가도 추가한다.
// 창고를 입고한다.

// 0804 할것 ,

// 쇼핑에서 모든 정보 가져와서 정산예정, 정산 2둘하나로 선택해서 넘겨 금액입력 및 정산날짜 입력
// 쇼핑에 마지막 운송료 주체에 거래처컬렉션 정보 가져오기
// 캘린더 출고등록관리할수있도록 하기


// 수정해야할것 , 
// 캘린더에서 출고등록시 , 창고별 필터를 통해서 창고별재고상품순으로 나타내야함. 
// 창고별재고상품 창고별로 나눌수 있도록해야함. 