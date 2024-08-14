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
    subheader: 'snpsystem v2.6.17',
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
      {
        title: '입고 리스트',
        path: '/warehouse-inventory',
        icon: ICONS.user,
      },
      {
        title: '창고 적재내용',
        path: '/warehouse-inventory/storage-index',
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