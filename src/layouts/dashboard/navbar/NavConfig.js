// components
import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;

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
    subheader: 'snpsystem v2.1.1',
    items: [
      // { title: '맵', path: '/map', icon: ICONS.ecommerce },
      { title: '에스엔피 오픈마켓집계', path: '/dashboard/snp', icon: ICONS.ecommerce },
      { title: '아르고 오픈마켓집계', path: '/dashboard/argo', icon: ICONS.ecommerce },
      { title: 'One', path: '/dashboard/one', icon: ICONS.dashboard },
      { title: '오픈마켓현황', path: '/dashboard/two', icon: ICONS.ecommerce },
      { title: 'Three', path: '/dashboard/three', icon: ICONS.analytics },
    ],
  },

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
          { title: 'Four', path: '/dashboard/user/four' },
          { title: 'Five', path: '/dashboard/user/five' },
          { title: 'Six', path: '/dashboard/user/six' },
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