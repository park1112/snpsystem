import { useRouter } from 'next/router';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AddBoxIcon from '@mui/icons-material/AddBox';
import StorageIcon from '@mui/icons-material/Storage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import StoreIcon from '@mui/icons-material/Store';
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DevicesIcon from '@mui/icons-material/Devices';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import FactoryIcon from '@mui/icons-material/Factory';

const ICONS = {
  home: <HomeIcon sx={{ width: 1, height: 1 }} />,
  user: <PersonIcon sx={{ width: 1, height: 1 }} />,
  ecommerce: <ShoppingCartIcon sx={{ width: 1, height: 1 }} />,
  analytics: <AssessmentIcon sx={{ width: 1, height: 1 }} />,
  list: <ListAltIcon sx={{ width: 1, height: 1 }} />,
  addBox: <AddBoxIcon sx={{ width: 1, height: 1 }} />,
  storage: <StorageIcon sx={{ width: 1, height: 1 }} />,
  shipping: <LocalShippingIcon sx={{ width: 1, height: 1 }} />,
  calendar: <CalendarTodayIcon sx={{ width: 1, height: 1 }} />,
  inventory: <InventoryIcon sx={{ width: 1, height: 1 }} />,
  store: <StoreIcon sx={{ width: 1, height: 1 }} />,
  group: <GroupIcon sx={{ width: 1, height: 1 }} />,
  business: <BusinessIcon sx={{ width: 1, height: 1 }} />,
  logistics: <DevicesIcon sx={{ width: 1, height: 1 }} />,
  transport: <LocalShippingOutlinedIcon sx={{ width: 1, height: 1 }} />,
  account: <AccountCircleIcon sx={{ width: 1, height: 1 }} />,
  factory: <FactoryIcon sx={{ width: 1, height: 1 }} />,
};

const sidebarConfig = [
  {
    subheader: 'snpsystem v2.6.23',
    items: [],
  },
  {
    subheader: '오픈마켓',
    items: [
      { title: '택배정리 파일생성', path: '/market', icon: ICONS.ecommerce },
      { title: '출고상품 목록', path: '/market/day-list', icon: ICONS.list },
      { title: '상품 관리', path: '/market/list', icon: ICONS.storage },
      { title: '상품 생성', path: '/market/market-product-create', icon: ICONS.addBox },
      { title: '상품 대량등록', path: '/market/bulk-create', icon: ICONS.addBox },
      { title: '마켓거래처 추가', path: '/market/market-create', icon: ICONS.business },
      { title: '오픈마켓 추가', path: '/market/open-market-create', icon: ICONS.store },
    ],
  },
  {
    subheader: '태국_ประเทศไทย',
    items: [


      {
        title: '창고선택_투입_ล้อมรอบ',
        path: '/warehouse-inventory-select',
        icon: ICONS.factory,
      },
      {
        title: '창고재고_รายการสิ่งของ',
        path: '/inventory/warehouse',
        icon: ICONS.storage,
      },
    ],
  },
  {
    subheader: '입고관리',
    items: [
      {
        title: '입고 추가 & 관리',
        path: '/warehouse-inventory',
        icon: ICONS.inventory,
      },
      {
        title: '창고별 입고-선별대기 변경',
        path: '/warehouse-inventory-input',
        icon: ICONS.storage,
      },

    ],
  },




  {
    subheader: '조회',
    items: [
      {
        title: '생산재고_수정삭제_inventory',
        path: '/inventory',
        icon: ICONS.inventory,
      },
      {
        title: '출고등록_거래처검색',
        path: '/shipping',
        icon: ICONS.shipping,
      },
      {
        title: '출고조회_리스트',
        path: '/shipping/list',
        icon: ICONS.list,
      },


      {
        title: '창고 적재내용',
        path: '/warehouse-inventory/storage-list',
        icon: ICONS.storage,
      },
    ],
  },
  {
    subheader: '일정관리',
    items: [

      {
        title: '캘린더_일정관리',
        path: '/calendar',
        icon: ICONS.calendar,
      },
      {
        title: '업무일지-투두',
        path: '/todo',
        icon: ICONS.calendar,
      },
      {
        title: '업무일지_메인',
        path: '/work-log',
        icon: ICONS.calendar,
      },


    ],
  },
  {
    subheader: '전메뉴_조회',
    items: [
      {
        title: '상품_PRODUCTS',
        path: '/products',
        icon: ICONS.ecommerce,
      },
      {
        title: '작업팀_teams',
        path: '/teams',
        icon: ICONS.group,
      },
      {
        title: '창고_warehouses',
        path: '/warehouses',
        icon: ICONS.storage,
      },
      {
        title: '거래처_partners',
        path: '/partners',
        icon: ICONS.business,
      },
      {
        title: '운송사_transports',
        path: '/transports',
        icon: ICONS.transport,
      },
      {
        title: '물류기기_logistics',
        path: '/logistics',
        icon: ICONS.logistics,
      },
      {
        title: '물류기기_이동조회',
        path: '/logistics-management',
        icon: ICONS.logistics,
      },
    ],
  },
  {
    subheader: 'management',
    items: [
      {
        title: 'user',
        path: '/dashboard/user',
        icon: ICONS.account,
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

