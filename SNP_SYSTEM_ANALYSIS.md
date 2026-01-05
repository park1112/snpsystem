# SNP System 종합 분석 문서

## 1. 시스템 개요

### 1.1 시스템 정의
**SNP System**은 농산물 유통 및 창고 관리를 위한 종합 ERP 시스템입니다. 주로 양파, 마늘 등 농산물의 입고, 생산, 출고, 정산까지 전 과정을 관리합니다.

### 1.2 기술 스택

| 구분 | 기술 |
|------|------|
| **프론트엔드** | Next.js (React), Material-UI (MUI) |
| **백엔드** | Firebase (Firestore, Auth, Storage, Realtime Database) |
| **상태관리** | React Context API |
| **차트/시각화** | Recharts |
| **날짜처리** | Day.js |
| **알림** | Notistack |
| **파일처리** | XLSX (엑셀) |

### 1.3 프로젝트 구조

```
src/
├── _mock/              # 목업 데이터
├── assets/             # 이미지, 아이콘 등 정적 자원
├── components/         # 재사용 가능한 컴포넌트 (70+ 파일)
├── contexts/           # React Context (전역 상태)
├── guards/             # 인증 가드
├── hooks/              # 커스텀 훅 (13개)
├── layouts/            # 레이아웃 컴포넌트
├── models/             # 데이터 모델 클래스
├── pages/              # Next.js 페이지 라우트 (130+ 파일)
├── routes/             # 라우팅 설정
├── sections/           # 페이지 섹션 컴포넌트
├── services/           # 비즈니스 로직 서비스
├── theme/              # MUI 테마 설정
└── utils/              # 유틸리티 함수
```

---

## 2. 핵심 기능 모듈

### 2.1 오픈마켓 관리 (Market)

**경로**: `/market/*`

**목적**: 쿠팡, 네이버, 지마켓 등 온라인 마켓플레이스의 주문을 통합 관리하고 택배 출고 자료를 생성합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 택배정리 파일생성 | `/market` | 마켓별 엑셀 파일 업로드 → 상품 매칭 → 택배 라벨 생성 |
| 일자별 레포트 | `/market/market-report` | 일별 판매 현황 차트 및 통계 |
| 출고상품 목록 | `/market/day-list` | 일자별 출고된 상품 조회 |
| 상품 관리 | `/market/list` | 마켓별 상품 정보 관리 |
| 상품 생성 | `/market/market-product-create` | 신규 상품 등록 |
| 상품 대량등록 | `/market/bulk-create` | 엑셀로 다수 상품 일괄 등록 |
| 마켓거래처 추가 | `/market/market-create` | 마켓 거래처 정보 등록 |
| 오픈마켓 추가 | `/market/open-market-create` | 신규 오픈마켓 채널 추가 |
| 결산 레포트 | `/market/daily-report` | 월별 정산 보고서 |
| 반품 관리 | `/market/return` | 반품 처리 및 환불 관리 |

#### 핵심 컴포넌트

**`MarketManagement.js`**
- 마켓별 엑셀 파일 업로드
- 옵션ID 기반 상품 자동 매칭
- 택배 라벨용 데이터 집계
- 엑셀 다운로드

**데이터 흐름**:
```
엑셀 업로드 → 옵션ID 추출 → market_products 컬렉션과 매칭
→ 배송정보 생성 → 택배 라벨 엑셀 다운로드
```

#### 왜 이 기능이 필요한가?
- 여러 마켓의 주문을 한 곳에서 통합 관리
- 수작업 오류 감소 (자동 상품 매칭)
- 택배사 호환 형식으로 자동 변환
- 일별/월별 매출 추적

---

### 2.2 창고 관리 (Warehouse)

**경로**: `/warehouses/*`, `/warehouse-inventory/*`

**목적**: 농산물 보관 창고를 관리하고, 각 창고의 재고 상태를 실시간으로 추적합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 창고 목록 | `/warehouses` | 전체 창고 현황 조회 |
| 창고 추가 | `/warehouses/add` | 신규 창고 등록 |
| 창고 상세 | `/warehouses/[id]` | 창고별 상세 정보 및 재고 현황 |
| 입고 목록 | `/warehouse-inventory` | 1톤/5톤 차량 입고 기록 |
| 입고 추가 | `/warehouse-inventory/inbound` | 차량 입고 등록 |
| 창고 적재내용 | `/warehouse-inventory/storage-list` | 창고별 보관 현황 시각화 |

#### 핵심 컴포넌트

**`WarehouseList.js`**
- 창고 목록 테이블 (이름, 관리자, 연락처, 상태)
- 정렬 및 검색 기능
- 상태 칩 표시 (활성/비활성)

**`InboundInventoryList.js`**
- 입고 기록 목록
- 창고명, 상태, 아이템코드, 상품 상세, 총수량 표시
- 날짜순 정렬

#### 창고 상태 체계

```
입고(inbound) → 선별대기(pending) → 선별완료(sorted)
→ 재고(stock) → 출고(shipped)
```

#### 왜 이 기능이 필요한가?
- 다수 창고의 중앙 집중 관리
- 입고부터 출고까지 전 과정 추적
- 창고별 재고 현황 실시간 파악
- 물류 흐름 최적화

---

### 2.3 인벤토리 관리 (Inventory)

**경로**: `/inventory/*`

**목적**: 창고 내 상품의 이동, 상태 변경, 물류기기 연결을 관리합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 인벤토리 목록 | `/inventory` | 전체 인벤토리 아이템 조회 |
| 인벤토리 추가 | `/inventory/add` | 신규 인벤토리 등록 |
| 인벤토리 상세 | `/inventory/[id]` | 인벤토리 상세 정보 |
| 인벤토리 수정 | `/inventory/[id]/edit` | 인벤토리 정보 수정 |
| 창고별 조회 | `/inventory/warehouse` | 창고 기준 인벤토리 필터링 |
| 창고 선택-투입 | `/inventory/select` | 생산 투입용 인벤토리 선택 |

#### 핵심 서비스

**`inventoryService.js`**
- `submitInventoryTransaction`: 인벤토리 생성 (트랜잭션)
- `deleteInventoryTransaction`: 인벤토리 삭제 (연관 데이터 정리)
- `updateInventoryTransaction`: 인벤토리 수정

#### 트랜잭션 처리 이유
```javascript
// 인벤토리 생성 시 동시에 처리되는 작업:
1. inventories 컬렉션에 문서 생성
2. warehouses 컬렉션의 statuses 업데이트 (상품 수량)
3. logistics_movements 생성 (물류기기 이동 기록)
```

#### 왜 이 기능이 필요한가?
- 상품 단위의 세밀한 재고 추적
- 물류기기(팔레트, 컨테이너)와 상품 연결
- 생산 투입량 추적으로 로스율 계산 가능
- 데이터 일관성 보장 (트랜잭션)

---

### 2.4 출고 관리 (Shipping)

**경로**: `/shipping/*`

**목적**: 거래처로 상품을 출고하고, 정산 정보를 관리합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 출고 등록 | `/shipping` | 신규 출고 건 등록 |
| 출고 목록 | `/shipping/list` | 출고 이력 조회 |
| 출고 상세 | `/shipping/[id]` | 출고 건 상세 정보 |
| 출고 수정 | `/shipping/[id]/edit` | 출고 정보 수정 |

#### 핵심 컴포넌트

**`ShippingList.js`**
- 출고 목록 테이블
- 날짜, 창고, 거래처, 물류기기수량, 합계 표시
- 트랜잭션 기반 삭제 (연관 데이터 복원)

**`ShippingRegistration.js`**
- 거래처 선택
- 창고별 재고 선택
- 물류기기 수량 입력
- 운송 정보 입력

#### 출고 프로세스
```
1. 거래처 선택
2. 출고 창고 선택
3. 출고 상품 및 수량 선택
4. 물류기기 수량 입력 (팔레트 등)
5. 운송 정보 입력
6. 출고 확정 → 재고 차감, 거래처 이력 업데이트
```

#### 왜 이 기능이 필요한가?
- 출고 이력 추적으로 정산 근거 확보
- 재고 자동 차감으로 정확한 재고 관리
- 거래처별 출고 이력 누적
- 물류기기 회수 관리

---

### 2.5 거래처 관리 (Partners)

**경로**: `/partners/*`

**목적**: 거래처(구매자/판매자) 정보를 관리하고 거래 이력을 추적합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 거래처 목록 | `/partners` | 전체 거래처 조회 |
| 거래처 추가 | `/partners/add` | 신규 거래처 등록 |
| 거래처 상세 | `/partners/[id]` | 거래처 상세 정보 및 거래 이력 |
| 거래처 수정 | `/partners/[id]/edit` | 거래처 정보 수정 |

#### 데이터 모델

**`Partner.js`**
```javascript
{
  name: '거래처명',
  category: '카테고리',
  master: '담당자',
  phone: '연락처',
  accountNumber: '계좌번호',
  paymentMethod: '결제방법',
  lastPalletQuantity: 0,      // 마지막 팔레트 수량
  lastShippingDate: '',       // 마지막 출고일
  lastTotalQuantity: 0,       // 마지막 총수량
  shippingHistory: [],        // 출고 이력 배열
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 왜 이 기능이 필요한가?
- 거래처 정보 중앙 관리
- 거래 이력 기반 정산
- 미수금 추적
- 거래처별 출고 패턴 분석

---

### 2.6 상품 관리 (Products)

**경로**: `/products/*`

**목적**: 판매/관리하는 모든 상품 정보를 등록하고 관리합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 상품 목록 | `/products` | 전체 상품 조회 |
| 상품 추가 | `/products/add` | 신규 상품 등록 |
| 상품 상세 | `/products/[Id]` | 상품 상세 정보 |
| 상품 수정 | `/products/[Id]/edit` | 상품 정보 수정 |

#### 데이터 모델

**`Product.js`**
```javascript
{
  name: '상품명',
  category: '대분류',
  subCategory: '소분류',
  weight: '중량',
  typeName: '타입명',
  price: 0,
  quantity: 0,
  logistics: [              // 연결된 물류기기
    {
      uid: 'logistics_id',
      name: '물류기기명',
      unit: '단위수량',
      isDefault: true
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 왜 이 기능이 필요한가?
- 상품 정보 표준화
- 물류기기와 상품 연결 (팔레트당 박스 수 등)
- 재고 관리의 기준 데이터
- 마켓 상품 매핑의 기준

---

### 2.7 물류기기 관리 (Logistics)

**경로**: `/logistics/*`, `/logistics-management/*`

**목적**: 팔레트, 바렛트, 컨테이너 등 물류기기의 수량과 이동을 추적합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 물류기기 목록 | `/logistics` | 전체 물류기기 조회 |
| 물류기기 추가 | `/logistics/add` | 신규 물류기기 등록 |
| 물류기기 상세 | `/logistics/[id]` | 물류기기 상세 정보 |
| 이동 조회 | `/logistics-management` | 물류기기 이동 이력 조회 |

#### 데이터 모델

**`Logistic.js`**
```javascript
{
  name: '물류기기명',
  category: '카테고리',
  quantity: 1,
  price: 0,
  sameAsProductQuantity: false,
  partnerId: '',
  partnerName: '',
  accountNumber: '',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 물류기기 이동 추적

**`logistics_movements` 컬렉션**
- 입고 시: 물류기기 입고 기록
- 출고 시: 물류기기 출고 기록
- 반환 시: 물류기기 회수 기록

#### 왜 이 기능이 필요한가?
- 물류기기 자산 관리 (팔레트 비용 관리)
- 거래처별 미반환 물류기기 추적
- 물류기기 최소 수량 알림
- 물류기기 비용 정산

---

### 2.8 작업팀 관리 (Teams)

**경로**: `/teams/*`

**목적**: 창고 작업팀을 관리하고 작업 할당을 추적합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 팀 목록 | `/teams` | 전체 작업팀 조회 |
| 팀 추가 | `/teams/add` | 신규 작업팀 등록 |
| 팀 상세 | `/teams/[id]` | 작업팀 상세 정보 |
| 팀 수정 | `/teams/[id]/edit` | 작업팀 정보 수정 |

#### 왜 이 기능이 필요한가?
- 입고/출고 작업 담당팀 지정
- 작업팀별 실적 추적
- 운송비 정산 (작업팀 기준)

---

### 2.9 운송사 관리 (Transports)

**경로**: `/transports/*`

**목적**: 배송을 담당하는 운송사 정보를 관리합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 운송사 목록 | `/transports` | 전체 운송사 조회 |
| 운송사 추가 | `/transports/add` | 신규 운송사 등록 |
| 운송사 상세 | `/transports/[id]` | 운송사 상세 정보 |
| 운송사 수정 | `/transports/[id]/edit` | 운송사 정보 수정 |

#### 왜 이 기능이 필요한가?
- 운송사 정보 중앙 관리
- 운송비 정산 근거
- 배송 추적

---

### 2.10 일정 관리 (Calendar & Todo)

**경로**: `/calendar/*`, `/todo/*`, `/work-log/*`

**목적**: 업무 일정, 할일, 업무일지를 관리하여 팀 협업을 지원합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 캘린더 | `/calendar` | 월간/주간 일정 관리 |
| 할일 목록 | `/todo` | 개인/할당 할일 관리 |
| 업무일지 대시보드 | `/work-log` | 업무일지 현황 |
| 업무일지 작성 | `/work-log/create` | 신규 업무일지 작성 |
| 업무일지 상세 | `/work-log/detail/[id]` | 업무일지 상세 조회 |

#### 핵심 컴포넌트

**`TodoList.js`**
- 개인 할일 추가/수정/삭제
- 할당된 할일 표시
- 완료/미완료 토글
- 주간 공통 목표 (WeeklyCommonGoals)
- 다른 사용자에게 할일 할당 (AssignTodo)

**`WorkDashboard.js`**
- 전체 업무일지 목록
- 주간 요약
- 업무일지 CRUD

#### 할일 시스템

```
개인 할일: users/{userId}/todos 컬렉션
할당된 할일: assignedTodos 컬렉션
주간 공통 목표: weeklyCommonGoals 컬렉션
```

#### 왜 이 기능이 필요한가?
- 팀원 간 업무 할당 및 추적
- 일일/주간 업무 현황 파악
- 업무일지 기반 성과 관리
- 일정 충돌 방지

---

### 2.11 채팅 시스템 (Chat)

**경로**: `/chat/*`

**목적**: 팀원 간 실시간 커뮤니케이션을 지원합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 채팅 목록 | `/chat` | 참여 중인 채팅방 목록 |
| 채팅방 | `/chat/[id]` | 개별 채팅방 |

#### 핵심 컴포넌트

**`ChatPage.js`**
- 1:1 채팅 및 그룹 채팅 지원
- 실시간 메시지 수신 (Firestore onSnapshot)
- 온라인/오프라인 상태 표시
- 새 채팅 생성 다이얼로그

**`ChatWindow.js`**
- 메시지 목록 (페이지네이션, 캐싱)
- 이미지 업로드
- 실시간 업데이트
- 로딩 인디케이터

#### 기술 구현

```javascript
// Firebase Realtime Database로 온라인 상태 관리
ref(rtdb, `/status/${userId}`) = {
  state: 'online' | 'offline',
  lastActivity: serverTimestamp()
}

// onDisconnect로 자동 오프라인 처리
onDisconnect(userStatusRef).set({
  state: 'offline',
  lastActivity: serverTimestamp()
})
```

#### 왜 이 기능이 필요한가?
- 현장-사무실 간 실시간 소통
- 업무 관련 이미지 공유
- 그룹 채팅으로 팀 협업
- 온라인 상태로 즉각 연락 가능 여부 파악

---

### 2.12 알림 시스템 (Notifications)

**경로**: `/notifications/*`

**목적**: 시스템 알림 및 공지사항을 관리합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 알림 목록 | `/notifications` | 전체 알림 조회 |
| 알림 상세 | `/notifications/[id]` | 알림 상세 내용 |

#### 핵심 컴포넌트

**`NotificationManager.js`**
- 실시간 알림 수신
- 알림 읽음 처리
- 알림 타입별 아이콘 표시

#### 왜 이 기능이 필요한가?
- 중요 공지사항 전파
- 작업 완료/오류 알림
- 할당된 업무 알림
- 재고 부족 알림

---

### 2.13 관리자 기능 (Admin)

**경로**: `/admin/*`

**목적**: 시스템 관리자를 위한 사용자 관리 및 통계 기능을 제공합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 관리자 대시보드 | `/admin` | 유저 관리 |
| 일정 확인 | `/admin/todo` | 전체 사용자 할일 조회 |
| 일과 보고서 | `/admin/todo/daily` | 일별 할일 보고서 (PDF 생성) |
| 사용자별 상세 | `/admin/todo/[id]` | 개별 사용자 할일 상세 |

#### 핵심 컴포넌트

**`AdminPage.js`**
- 전체 사용자 목록
- 역할(role) 관리
- 개별/시스템 알림 발송

**`generateTodoReportPDF.js`**
- 일과 보고서 PDF 생성
- 날짜별 할일 현황 집계

#### 왜 이 기능이 필요한가?
- 사용자 권한 관리
- 팀 전체 업무 현황 파악
- 보고서 자동 생성
- 공지사항 일괄 발송

---

### 2.14 체크리스트 시스템 (Checklist)

**경로**: `/check-list/*`, `/stores/*`

**목적**: 현장 점검 및 상권 분석을 위한 체크리스트를 관리합니다.

#### 주요 기능

| 기능 | 경로 | 설명 |
|------|------|------|
| 체크리스트 | `/check-list` | 체크리스트 실행 |
| 결과 목록 | `/check-list/list` | 체크 결과 조회 |
| 체크리스트 추가 | `/check-list/add` | 신규 체크리스트 템플릿 등록 |
| 카테고리 관리 | `/check-list/category` | 체크리스트 카테고리 관리 |
| 상권 등록 | `/stores` | 점포/상권 등록 |
| 보고서 조회 | `/reports/report-list-page` | 분석 보고서 목록 |

#### 왜 이 기능이 필요한가?
- 현장 점검 표준화
- 상권 분석 데이터 수집
- 분석 보고서 자동 생성
- 점검 이력 추적

---

### 2.15 대량 등록 (Bulk Upload)

**경로**: `/bulk/*`

**목적**: 엑셀 파일을 통해 여러 데이터를 한 번에 등록합니다.

#### 핵심 컴포넌트

**`BulkDataUploadPage.js`**
- 컬렉션 선택 (warehouses, products, partners 등)
- 엑셀 파일 업로드
- 데이터 검증 및 미리보기
- 일괄 등록 실행

#### 왜 이 기능이 필요한가?
- 초기 데이터 마이그레이션
- 대량 상품 등록
- 수작업 시간 절감
- 오류 사전 검증

---

## 3. 시스템 아키텍처

### 3.1 Context 구조

#### UserContext
```javascript
{
  user: {                    // 현재 로그인 사용자
    uid, email, name, phone, role, profileComplete
  },
  allUsers: [],              // 전체 사용자 목록
  onlineUsers: {},           // 온라인 상태 맵
  login(), logout(),         // 인증 함수
  updateUserProfile(),       // 프로필 업데이트
  checkAuth()               // 인증 확인
}
```

#### DataContext
```javascript
{
  warehouses: [],           // 창고 목록
  logisticsItems: [],       // 물류기기 목록
  partners: [],             // 거래처 목록
  loading: boolean,
  error: string,
  refreshData()             // 데이터 새로고침
}
```

### 3.2 Firebase 컬렉션 구조

```
Firestore Collections:
├── users/                  # 사용자
│   └── {userId}/todos/    # 개인 할일
├── warehouses/             # 창고
├── inventories/            # 인벤토리
├── warehouse_inventory/    # 창고별 입고 기록
├── products/               # 상품
├── partners/               # 거래처
├── logistics/              # 물류기기
├── logistics_movements/    # 물류기기 이동
├── shipping/               # 출고
├── teams/                  # 작업팀
├── transports/             # 운송사
├── markets/                # 마켓 거래처
├── market_products/        # 마켓 상품 매핑
├── open_market/            # 오픈마켓 채널
├── daily_summaries/        # 일별 택배 출고 기록
├── chats/                  # 채팅방
├── assignedTodos/          # 할당된 할일
├── weeklyCommonGoals/      # 주간 공통 목표
├── notifications/          # 알림
├── events/                 # 캘린더 이벤트
├── daily_logs/             # 업무일지
├── news/                   # 뉴스
└── versions/               # 버전 정보

Realtime Database:
└── status/                 # 온라인 상태
    └── {userId}/
        ├── state: 'online'|'offline'
        └── lastActivity: timestamp
```

### 3.3 커스텀 훅

| 훅 | 용도 |
|-----|------|
| `useAuthState` | Firebase 인증 상태 관리 |
| `useCollection` | Firestore 컬렉션 실시간 구독 |
| `useFirestore` | Firestore CRUD 작업 |
| `useProducts` | 상품 데이터 관리 |
| `useSettings` | 테마 설정 관리 |
| `useTable` | 테이블 상태 관리 (정렬, 페이지네이션) |
| `useResponsive` | 반응형 브레이크포인트 |
| `useSubmitInventory` | 인벤토리 제출 로직 |
| `useUserData` | 사용자 데이터 관리 |
| `useUnreadMessages` | 읽지 않은 메시지 카운트 |

---

## 4. 데이터 흐름

### 4.1 입고 프로세스

```
1. 차량 도착 (1톤/5톤)
   └─ /warehouse-inventory/inbound

2. 입고 정보 입력
   ├─ 창고 선택
   ├─ 상품 선택 (복수 가능)
   ├─ 수량 입력
   ├─ 물류기기 선택
   ├─ 작업팀 선택
   └─ 이미지 촬영/업로드

3. 입고 확정
   ├─ inventories 컬렉션 생성
   ├─ warehouse_inventory 컬렉션 생성
   ├─ warehouses.statuses 업데이트
   └─ logistics_movements 생성

4. 상태: 입고(inbound)
```

### 4.2 생산 프로세스

```
1. 선별 대기 변경
   └─ /warehouse-inventory-input

2. 인벤토리 선택
   └─ 상태: 입고 → 선별대기

3. 생산 투입
   └─ /warehouse-inventory-select

4. 선별 완료
   └─ 상태: 선별대기 → 선별완료 → 재고
```

### 4.3 출고 프로세스

```
1. 출고 등록
   └─ /shipping

2. 거래처 선택
   └─ partners 컬렉션에서 검색

3. 상품 선택
   ├─ 창고 선택
   ├─ 재고 상품 선택
   └─ 수량 입력

4. 출고 확정
   ├─ shipping 컬렉션 생성
   ├─ inventories.status 업데이트 (stock → shipped)
   ├─ warehouses.statuses 재고 차감
   └─ partners.shippingHistory 업데이트
```

### 4.4 오픈마켓 출고 프로세스

```
1. 마켓별 주문 엑셀 다운로드
   └─ 쿠팡, 네이버, 지마켓 등

2. 파일 업로드
   └─ /market

3. 자동 상품 매칭
   └─ 옵션ID ↔ market_products 매핑

4. 데이터 집계
   └─ 상품별 수량 합산

5. 택배 라벨 엑셀 생성
   └─ ExcelDownloader 컴포넌트

6. 일일 출고 기록 저장
   └─ daily_summaries 컬렉션
```

---

## 5. 보안 및 권한

### 5.1 인증 시스템

- Firebase Authentication 기반
- 이메일/비밀번호 로그인
- JWT 토큰 로컬 저장
- 프로필 완성 강제 (name, phone 필수)

### 5.2 권한 체계

```javascript
role: 'user' | 'admin'

// ProtectedRoute로 권한 확인
// admin 전용 페이지: /admin/*
```

### 5.3 온라인 상태 관리

- Firebase Realtime Database 사용
- `onDisconnect` API로 자동 오프라인 처리
- 실시간 온라인 사용자 목록

---

## 6. 버전 히스토리

현재 버전: **2.6.273**

### 주요 마일스톤

| 버전 | 주요 변경 |
|------|----------|
| 2.0.x | 초기 상품 등록, 기본 기능 |
| 2.1.x | 마켓 상품 확장, 알림 추가 |
| 2.2.x | 판매자 전용 기능 |
| 2.3.x | 운송사 변경, 버그 수정 |
| 2.4.x | 상품 추가, 아르고 마켓 |
| 2.5.x | 상품/창고 CRUD 완성 |
| 2.6.x | 물류기기, 채팅, 실시간 알림, Cloud Functions |

---

## 7. 결론

SNP System은 농산물 유통 전 과정을 디지털화한 종합 ERP 시스템입니다:

1. **통합 재고 관리**: 입고부터 출고까지 실시간 추적
2. **오픈마켓 연동**: 다중 채널 주문 통합 처리
3. **팀 협업**: 채팅, 할일, 업무일지로 원활한 소통
4. **물류기기 추적**: 팔레트 등 자산 관리
5. **정산 지원**: 거래처별 출고 이력 및 정산 근거

이 시스템을 통해 수작업 오류를 줄이고, 재고 정확도를 높이며, 팀 간 협업 효율을 개선할 수 있습니다.
