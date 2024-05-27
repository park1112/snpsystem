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
    subheader: 'snpsystem v2.3.9',
    items: [
      // { title: '맵', path: '/map', icon: ICONS.ecommerce },
      { title: '에스엔피 오픈마켓집계', path: '/dashboard/snp', icon: ICONS.ecommerce },
      { title: '아르고 오픈마켓집계', path: '/dashboard/argo', icon: ICONS.ecommerce },
      { title: '플러스 오픈마켓집계', path: '/dashboard/one', icon: ICONS.ecommerce },
      { title: '오픈마켓현황', path: '/dashboard/two', icon: ICONS.dashboard },
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