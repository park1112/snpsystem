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
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import PaymentsIcon from '@mui/icons-material/Payments';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import UpdateIcon from '@mui/icons-material/Update';
import BarChartIcon from '@mui/icons-material/BarChart';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CategoryIcon from '@mui/icons-material/Category';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../utils/firebase'; // Firebase 설정에 맞게 경로 조정

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
  chat: <ChatIcon sx={{ width: 1, height: 1 }} />,
  workLog: <AssignmentIcon sx={{ width: 1, height: 1 }} />,
  todo: <WorkIcon sx={{ width: 1, height: 1 }} />,
  payments: <PaymentsIcon sx={{ width: 1, height: 1 }} />,
  products: <LocalMallIcon sx={{ width: 1, height: 1 }} />,
  version: <UpdateIcon sx={{ width: 1, height: 1 }} />,
  chart: <BarChartIcon sx={{ width: 1, height: 1 }} />,
  car: <DirectionsCarIcon sx={{ width: 1, height: 1 }} />,
  return: <LocalShippingOutlinedIcon sx={{ width: 1, height: 1 }} />,
  checklist: <ListAltIcon sx={{ width: 1, height: 1 }} />,
  checklistResult: <AssignmentIcon sx={{ width: 1, height: 1 }} />,
  checklistAdd: <AddBoxIcon sx={{ width: 1, height: 1 }} />,
  checklistCategory: <CategoryIcon sx={{ width: 1, height: 1 }} />,
};

const useSidebarConfig = () => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    const fetchLatestVersion = async () => {
      const q = query(collection(db, 'versions'), orderBy('timestamp', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const latestVersion = querySnapshot.docs[0].data().version;
        setVersion(latestVersion);
      }
    };

    fetchLatestVersion();
  }, []);

  const sidebarConfig = [
    {
      subheader: `snpsystem ${version}`,
      // items: [{ title: '버전관리', path: '/version', icon: ICONS.version }],
    },
    {
      subheader: '오픈마켓',
      items: [
        { title: '일자별 레포트', path: '/market/market-report', icon: ICONS.chart },
        { title: '택배정리 파일생성', path: '/market', icon: ICONS.ecommerce },
        { title: '출고상품 목록', path: '/market/day-list', icon: ICONS.list },
        { title: '상품 관리', path: '/market/list', icon: ICONS.storage },
        { title: '상품 생성', path: '/market/market-product-create', icon: ICONS.addBox },
        { title: '상품 대량등록', path: '/market/bulk-create', icon: ICONS.addBox },
        { title: '마켓거래처 추가', path: '/market/market-create', icon: ICONS.business },
        { title: '오픈마켓 추가', path: '/market/open-market-create', icon: ICONS.store },
        { title: '결산 레포트', path: '/market/daily-report', icon: ICONS.analytics },
        { title: '반품 관리', path: '/market/return', icon: ICONS.return },
      ],
    },
    {
      subheader: '출고관리',
      items: [
        {
          title: '1톤차량 출고',
          path: '/warehouse-export',
          icon: ICONS.car,
        },

      ],
    },
    {
      subheader: '체크리스트',
      items: [
        {
          title: '체크리스트',
          path: '/check-list',
          icon: ICONS.checklist,
        },
        {
          title: '체크리스트 결과 목록',
          path: '/check-list/list',
          icon: ICONS.checklistResult,
        },
        {
          title: '체크리스트 추가 삭제',
          path: '/check-list/add',
          icon: ICONS.checklistAdd,
        },
        {
          title: '체크리스트 카테고리',
          path: '/check-list/category',
          icon: ICONS.checklistCategory,
        },
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
          title: '1톤차량 입고 추가 & 관리',
          path: '/warehouse-inventory',
          icon: ICONS.car,
        },
        {
          title: '5톤차량 입고 추가 & 관리',
          path: '/warehouse-inventory',
          icon: ICONS.shipping,
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
          title: '업무일지',
          path: '/todo',
          icon: ICONS.workLog,
        },
        {
          title: '채팅',
          path: '/chat',
          icon: ICONS.chat,
        },
      ],
    },
    {
      subheader: '상권분석',
      items: [
        {
          title: '상권등록',
          path: '/stores',
          icon: ICONS.calendar,
        },
        {
          title: '체크리스트 묶음보기',
          path: '/reports',
          icon: ICONS.workLog,
        },
        {
          title: '보고서 조회',
          path: '/reports/report-list-page',
          icon: ICONS.workLog,
        },
        {
          title: '보고서 작성하기',
          path: '/reports/create-report-page',
          icon: ICONS.workLog,
        },
        {
          title: '프롬포트 생성',
          path: '/reports/report-page',
          icon: ICONS.workLog,
        },
      ],
    },

    {
      subheader: '창고관련',
      items: [
        {
          title: '상품_PRODUCTS',
          path: '/products',
          icon: ICONS.products,
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
      subheader: '전메뉴_관리',
      items: [
        {
          title: '컬렉션별_대량등록',
          path: '/bulk',
          icon: ICONS.addBox,
        },
        {
          title: '창고_warehouses',
          path: '/warehouses',
          icon: ICONS.storage,
        },
        {
          title: '상품_PRODUCTS',
          path: '/products',
          icon: ICONS.products,
        },
        {
          title: '작업팀_teams',
          path: '/teams',
          icon: ICONS.group,
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
            { title: '결제목록', path: '/dashboard/user/six', icon: ICONS.payments },
          ],
        },
      ],
    },
    {
      subheader: 'management',
      items: [
        {
          title: 'admin',
          path: '/admin',
          icon: ICONS.account,
          children: [
            { title: '유저관리', path: '/admin' },
            { title: '일정확인', path: '/admin/todo' },
            { title: '일과 보고서', path: '/admin/todo/daily' },
          ],
        },
      ],
    },
    {
      subheader: `snpsystem ${version}`,
      items: [{ title: '버전관리', path: '/version', icon: ICONS.version }],
    },
  ];

  return sidebarConfig;
};

export default useSidebarConfig;
