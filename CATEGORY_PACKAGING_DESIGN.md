# 카테고리별 출고량 및 포장자재 재고 관리 시스템 설계

## 1. 요구사항 분석

### 1.1 카테고리별 출고량 관리
| 요구사항 | 상세 |
|---------|------|
| 상품 카테고리 설정 | 양파(소), 양파(대), 감자, 고구마 등 |
| 출고량 합산 | 양파(소) 5kg + 10kg = 총 15kg |
| 일일 집계 | 하루 단위 카테고리별 총 출고량 확인 |

### 1.2 포장자재 재고 관리
| 요구사항 | 상세 |
|---------|------|
| 박스 종류 관리 | 5kg 박스, 10kg 박스, 15kg 박스 등 |
| 상품-박스 매핑 | 각 상품이 어떤 박스를 사용하는지 |
| 박스 재고 관리 | 입고/출고/현재고 |
| 보냉팩 관리 | 선택적 사용 (전체/상품별/미사용) |

### 1.3 가격 관리 및 손익 분석 (신규)
| 요구사항 | 상세 |
|---------|------|
| 부자재별 단가 설정 | 박스, 보냉팩 등 개당 단가 입력 |
| 총 출고비용 산출 | 원가 + 배송비 + 박스비 + 부자재비 + 수수료 + 광고비 |
| 카테고리별 kg당 가격 | 기준 매입가 설정 |
| 손익 분기점 경고 | 최종 가격이 기준 이하면 경고 UI |
| 가격 변동 승인 시스템 | kg당 가격 변동 시 승인/거부 선택 |

---

## 2. 현재 시스템 분석

### 2.1 기존 데이터 구조
```
market_products (현재)
├── boxType: "극소/소/중/대"  ← 단순 분류만 존재
├── productPrice, margin
└── 카테고리 개념 없음

warehouses / inventories (현재)
├── 창고별 재고 관리
├── 물류기기(logistics) 관리
└── 포장자재 관리 없음
```

### 2.2 개선 필요 사항
- ❌ 상품 카테고리 시스템 없음
- ❌ 포장자재(박스, 보냉팩) 재고 관리 없음
- ❌ 상품-포장자재 연결 없음
- ❌ 일일 출고량 집계 기능 없음

---

## 3. 설계 방향 검토

### 3.1 접근 방식 비교

#### 방식 A: 단순 필드 추가
```javascript
// market_products에 필드만 추가
{
  category: "양파(소)",
  packagingBox: "5kg박스",
  useColdPack: true
}
```
- ✅ 구현 간단
- ❌ 카테고리/박스 종류 관리 어려움
- ❌ 재고 추적 불가
- ❌ 확장성 부족

#### 방식 B: 별도 컬렉션 + 참조 (권장)
```javascript
// 별도 컬렉션으로 관리
product_categories: { id, name, unit }
packaging_materials: { id, name, type, capacity }
packaging_inventory: { id, materialId, quantity, movements }
```
- ✅ 체계적 관리
- ✅ 재고 추적 가능
- ✅ 확장성 우수
- ⚠️ 구현 복잡도 증가

#### 방식 C: 하이브리드 (최종 권장)
- 카테고리: 별도 컬렉션 (관리 필요)
- 포장자재: 별도 컬렉션 + 재고 시스템
- 일일 집계: 실시간 계산 + 캐시

---

## 4. 최종 설계안

### 4.1 데이터 모델

#### 4.1.1 상품 카테고리 (`product_categories`)
```javascript
{
  id: "cat_001",
  name: "양파(소)",           // 카테고리명
  displayName: "양파(소)",    // 표시명
  unit: "kg",                // 기본 단위
  sortOrder: 1,              // 정렬 순서
  isActive: true,

  // === 가격 관리 (신규) ===
  pricing: {
    basePricePerKg: 2000,    // kg당 기준 매입가
    lastUpdated: Timestamp,
    updatedBy: "user_001"
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 4.1.2 포장자재 (`packaging_materials`)
```javascript
{
  id: "pkg_001",
  name: "5kg 박스",
  type: "BOX",               // BOX | COLD_PACK | OTHER
  capacity: 5,               // 용량 (kg 또는 개수)
  capacityUnit: "kg",        // kg | ea
  description: "소형 농산물용 5kg 박스",

  // === 단가 정보 (신규) ===
  unitPrice: 500,            // 개당 단가 (원)
  priceHistory: [            // 가격 변동 이력
    { price: 500, date: Timestamp, note: "2024년 1월 단가" }
  ],

  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 4.1.3 포장자재 재고 (`packaging_inventory`)
```javascript
{
  id: "inv_001",
  materialId: "pkg_001",     // packaging_materials 참조
  materialName: "5kg 박스",   // 조회 편의용 (비정규화)
  materialType: "BOX",

  currentStock: 500,         // 현재 재고
  minStock: 100,             // 최소 재고 (알림용)

  warehouseId: "wh_001",     // 창고별 관리 (선택)

  lastUpdated: Timestamp,
  createdAt: Timestamp
}
```

#### 4.1.4 포장자재 입출고 기록 (`packaging_movements`)
```javascript
{
  id: "mov_001",
  materialId: "pkg_001",
  materialName: "5kg 박스",

  type: "INBOUND",           // INBOUND | OUTBOUND | ADJUSTMENT
  quantity: 100,             // 수량 (입고: +, 출고: -)

  // 출고 시 연결 정보
  relatedShipmentId: "ship_001",  // 출고와 연결
  relatedProductId: "prod_001",   // 상품과 연결

  note: "월간 박스 입고",
  createdBy: "user_001",
  createdAt: Timestamp
}
```

#### 4.1.5 market_products 확장
```javascript
{
  // 기존 필드...
  id: "prod_001",
  registeredProductName: "양파(소) 5kg",
  boxType: "소",

  // === 새로 추가되는 필드 ===
  categoryId: "cat_001",           // 카테고리 참조
  categoryName: "양파(소)",         // 비정규화

  weight: 5,                       // 중량 (kg)
  weightUnit: "kg",

  // 포장자재 설정
  packaging: {
    boxId: "pkg_001",              // 사용하는 박스
    boxName: "5kg 박스",
    boxQuantity: 1,                // 박스 사용 개수

    coldPackId: "pkg_010",         // 보냉팩 (선택)
    coldPackName: "대형 보냉팩",
    coldPackQuantity: 2,           // 보냉팩 사용 개수
    coldPackMode: "OPTIONAL"       // ALWAYS | OPTIONAL | NEVER
  },

  // === 가격 구성 (신규) ===
  costBreakdown: {
    // 원가 요소
    purchasePricePerKg: 2000,      // kg당 매입가 (승인된 가격)
    purchasePrice: 10000,          // 총 매입가 (weight × pricePerKg)

    shippingCost: 3000,            // 배송비
    boxCost: 500,                  // 박스비 (자동 계산: 박스단가 × 수량)
    packagingCost: 400,            // 부자재비 (보냉팩 등)

    // 판매 관련
    marketFeeRate: 9,              // 마켓 수수료율 (%)
    advertisingCost: 500,          // 광고비

    // 자동 계산 필드
    totalCost: 14400,              // 총 원가 (매입가+배송비+박스비+부자재비)
    marketFee: 1296,               // 마켓 수수료 (판매가 × 수수료율)
    finalCost: 16196,              // 최종 비용 (총원가+수수료+광고비)

    margin: 2000,                  // 마진
    sellingPrice: 18196,           // 판매가
    profitRate: 11.0               // 수익률 (%)
  },

  // === 가격 변동 상태 (신규) ===
  priceStatus: {
    hasPendingChange: false,       // 대기 중인 가격 변동 있음
    pendingChangeId: null,         // price_change_requests 참조
    lastApprovedAt: Timestamp,     // 마지막 승인 일시
    lastApprovedBy: "user_001"
  }
}
```

#### 4.1.6 일일 출고 집계 (`daily_shipment_summary`)
```javascript
{
  id: "2024-01-15",              // 날짜를 ID로 사용
  date: "2024-01-15",

  // 카테고리별 출고량
  categoryTotals: {
    "cat_001": {                  // 양파(소)
      categoryId: "cat_001",
      categoryName: "양파(소)",
      totalWeight: 150,           // 총 출고량 (kg)
      unit: "kg",
      shipmentCount: 25,          // 출고 건수
      products: {
        "prod_001": { name: "양파(소) 5kg", weight: 50, count: 10 },
        "prod_002": { name: "양파(소) 10kg", weight: 100, count: 10 }
      }
    },
    "cat_002": { /* 감자... */ }
  },

  // 포장자재 사용량
  packagingUsage: {
    "pkg_001": {                  // 5kg 박스
      materialId: "pkg_001",
      materialName: "5kg 박스",
      type: "BOX",
      usedQuantity: 25
    },
    "pkg_002": { /* 10kg 박스... */ },
    "pkg_010": { /* 보냉팩... */ }
  },

  // === 비용 집계 (신규) ===
  costSummary: {
    totalPurchaseCost: 1500000,   // 총 매입 비용
    totalShippingCost: 75000,     // 총 배송비
    totalPackagingCost: 45000,    // 총 포장비 (박스+부자재)
    totalMarketFee: 135000,       // 총 수수료
    totalAdvertisingCost: 12500,  // 총 광고비
    grandTotal: 1767500           // 총 출고 비용
  },

  lastUpdated: Timestamp
}
```

#### 4.1.7 가격 변동 요청 (`price_change_requests`) - 신규
```javascript
{
  id: "pcr_001",

  // 요청 유형
  type: "CATEGORY_PRICE",         // CATEGORY_PRICE | PRODUCT_PRICE | BULK_PRICE

  // 카테고리 가격 변동인 경우
  categoryId: "cat_001",
  categoryName: "양파(소)",

  // 가격 정보
  previousPricePerKg: 2000,       // 변경 전 kg당 가격
  newPricePerKg: 2500,            // 변경 후 kg당 가격
  priceChangeRate: 25.0,          // 변동률 (%)

  // 영향받는 상품들
  affectedProducts: [
    {
      productId: "prod_001",
      productName: "양파(소) 5kg",
      weight: 5,
      previousCost: 10000,        // 변경 전 매입가
      newCost: 12500,             // 변경 후 매입가
      previousFinalCost: 16196,   // 변경 전 최종 비용
      newFinalCost: 18696,        // 변경 후 최종 비용
      currentSellingPrice: 18196, // 현재 판매가
      profitStatus: "WARNING"     // PROFIT | BREAK_EVEN | WARNING | LOSS
    }
  ],

  // 요청 상태
  status: "PENDING",              // PENDING | APPROVED | REJECTED | PARTIAL

  // 개별 상품 승인 현황
  productApprovals: {
    "prod_001": {
      status: "PENDING",          // PENDING | APPROVED | REJECTED
      approvedAt: null,
      approvedBy: null,
      rejectionReason: null
    }
  },

  // 요약 정보
  summary: {
    totalAffected: 5,             // 영향받는 상품 수
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 5,
    profitCount: 2,               // 이익 상품 수
    warningCount: 2,              // 경고 상품 수
    lossCount: 1                  // 손실 상품 수
  },

  requestedAt: Timestamp,
  requestedBy: "user_001",
  completedAt: null,
  note: "1월 시세 변동 반영"
}
```

#### 4.1.8 가격 변동 이력 (`price_change_history`) - 신규
```javascript
{
  id: "pch_001",
  requestId: "pcr_001",           // price_change_requests 참조

  productId: "prod_001",
  productName: "양파(소) 5kg",
  categoryId: "cat_001",

  changeType: "KG_PRICE",         // KG_PRICE | SHIPPING | BOX | PACKAGING | MARKET_FEE | AD

  previousValue: 2000,
  newValue: 2500,
  changeRate: 25.0,

  previousFinalCost: 16196,
  newFinalCost: 18696,

  action: "APPROVED",             // APPROVED | REJECTED
  actionBy: "user_001",
  actionAt: Timestamp,
  note: "시세 변동 승인"
}
```

---

### 4.2 데이터 관계도

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              데이터 관계도                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐                    ┌─────────────────────┐
│ product_categories  │                    │ packaging_materials │
│  - id               │                    │  - id               │
│  - name             │                    │  - name             │
│  - pricing.basePrice│                    │  - unitPrice ←──────┼── 단가
└─────────┬───────────┘                    └─────────┬───────────┘
          │ 1:N                                      │ 1:1
          │                                          ▼
          │                              ┌─────────────────────┐
          │                              │ packaging_inventory │
          │                              │  - currentStock     │
          │                              └─────────┬───────────┘
          │                                        │ 1:N
          ▼                                        ▼
┌─────────────────────┐                  ┌─────────────────────┐
│  market_products    │                  │ packaging_movements │
│  - categoryId       │                  │  - type (IN/OUT)    │
│  - packaging        │                  │  - quantity         │
│  - costBreakdown ◄──┼── 비용 구성      └─────────────────────┘
│  - priceStatus      │
└─────────┬───────────┘
          │
          │ 가격 변동 시
          ▼
┌─────────────────────┐     승인/거부     ┌─────────────────────┐
│price_change_requests│ ───────────────► │ price_change_history│
│  - affectedProducts │                  │  - action           │
│  - productApprovals │                  │  - previousValue    │
│  - status           │                  │  - newValue         │
└─────────────────────┘                  └─────────────────────┘
          │
          │ 출고 시
          ▼
┌─────────────────────┐
│daily_shipment_summary│
│  - categoryTotals   │
│  - packagingUsage   │
│  - costSummary ◄────┼── 비용 집계
└─────────────────────┘
```

### 4.3 가격 계산 공식

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            가격 계산 공식                                    │
└─────────────────────────────────────────────────────────────────────────────┘

[1단계: 매입가 계산]
총 매입가 = kg당 매입가 × 중량(kg)
예: 2,000원/kg × 5kg = 10,000원

[2단계: 포장비 계산]
박스비 = 박스 단가 × 박스 수량
부자재비 = 보냉팩 단가 × 보냉팩 수량 (사용 시)
총 포장비 = 박스비 + 부자재비
예: 500원 × 1개 + 200원 × 2개 = 900원

[3단계: 총 원가 계산]
총 원가 = 총 매입가 + 배송비 + 총 포장비
예: 10,000 + 3,000 + 900 = 13,900원

[4단계: 판매 비용 계산]
마켓 수수료 = 판매가 × 수수료율(%)
총 비용 = 총 원가 + 마켓 수수료 + 광고비

[5단계: 손익 판단]
손익분기점 = 총 비용
수익 = 판매가 - 총 비용
수익률 = (수익 / 판매가) × 100

┌─────────────────────────────────────────┐
│              손익 상태 기준              │
├─────────────────────────────────────────┤
│ 🟢 PROFIT     : 수익률 > 5%            │
│ 🟡 BREAK_EVEN : 0% ≤ 수익률 ≤ 5%       │
│ 🟠 WARNING    : -5% ≤ 수익률 < 0%      │
│ 🔴 LOSS       : 수익률 < -5%           │
└─────────────────────────────────────────┘
```

---

### 4.4 핵심 로직

#### 4.4.1 출고 시 자동 처리 플로우

```
출고 생성 요청
      │
      ▼
┌─────────────────────────────────────┐
│ 1. 출고 상품 목록 확인              │
│    - 각 상품의 categoryId 확인      │
│    - 각 상품의 packaging 정보 확인   │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 2. 포장자재 사용량 계산             │
│    - 박스: 상품별 boxQuantity 합산   │
│    - 보냉팩: coldPackMode에 따라    │
│      · ALWAYS: 무조건 차감          │
│      · OPTIONAL: 사용자 선택        │
│      · NEVER: 차감 안함             │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 3. 재고 차감 (트랜잭션)             │
│    - packaging_inventory 업데이트   │
│    - packaging_movements 기록 생성  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 4. 일일 집계 업데이트               │
│    - categoryTotals 업데이트        │
│    - packagingUsage 업데이트        │
└─────────────────────────────────────┘
```

#### 4.4.2 보냉팩 처리 시나리오

```javascript
// 시나리오 1: 전체 적용
coldPackGlobalSetting: "ALL"  // 모든 출고에 보냉팩 적용

// 시나리오 2: 상품별 설정
product.packaging.coldPackMode: "ALWAYS"   // 이 상품은 항상 보냉팩
product.packaging.coldPackMode: "OPTIONAL" // 출고 시 선택
product.packaging.coldPackMode: "NEVER"    // 보냉팩 사용 안함

// 시나리오 3: 출고 시 수동 선택
shipment.useColdPack: true    // 이번 출고는 보냉팩 사용
shipment.coldPackQuantity: 5  // 보냉팩 5개 사용
```

#### 4.4.3 가격 변동 승인 플로우 (신규)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         가격 변동 승인 플로우                                │
└─────────────────────────────────────────────────────────────────────────────┘

[트리거: 카테고리 kg당 가격 변경]

카테고리 관리에서 kg당 가격 수정
          │
          ▼
┌─────────────────────────────────────┐
│ 1. 영향 분석                        │
│    - 해당 카테고리 상품 목록 조회    │
│    - 각 상품별 새 비용 자동 계산     │
│    - 손익 상태 판정 (PROFIT/LOSS)   │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 2. 가격 변동 요청 생성              │
│    - price_change_requests 문서 생성│
│    - 영향받는 모든 상품 목록 포함    │
│    - 상태: PENDING                  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│ 3. 승인 대기 화면 표시              │
│    - 상품별 변동 전/후 비용 표시     │
│    - 손익 상태 시각화 (색상 표시)    │
│    - 개별 승인/거부 선택 가능        │
└─────────────────┬───────────────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
┌─────────────────┐ ┌─────────────────┐
│ 4a. 승인        │ │ 4b. 거부        │
│  - 상품 매입가   │ │  - 기존 가격    │
│    업데이트      │ │    유지         │
│  - 이력 기록     │ │  - 거부 사유    │
│  - 알림 발송     │ │    기록         │
└────────┬────────┘ └────────┬────────┘
         │                   │
         └─────────┬─────────┘
                   ▼
┌─────────────────────────────────────┐
│ 5. 완료 처리                        │
│    - 전체 승인: APPROVED            │
│    - 전체 거부: REJECTED            │
│    - 일부만: PARTIAL                │
└─────────────────────────────────────┘
```

#### 4.4.4 가격 변동 시 자동 계산 로직

```javascript
// 카테고리 kg당 가격이 변경되면 자동 실행
function calculatePriceImpact(categoryId, newPricePerKg) {
  // 1. 해당 카테고리 모든 상품 조회
  const products = await getProductsByCategory(categoryId);

  const affectedProducts = products.map(product => {
    // 2. 새 매입가 계산
    const newPurchasePrice = newPricePerKg * product.weight;

    // 3. 새 총 비용 계산
    const newTotalCost =
      newPurchasePrice +                     // 새 매입가
      product.costBreakdown.shippingCost +   // 배송비
      product.costBreakdown.boxCost +        // 박스비
      product.costBreakdown.packagingCost;   // 부자재비

    // 4. 마켓 수수료 계산 (판매가 기준)
    const marketFee = product.costBreakdown.sellingPrice *
                      (product.costBreakdown.marketFeeRate / 100);

    // 5. 최종 비용
    const newFinalCost = newTotalCost + marketFee +
                         product.costBreakdown.advertisingCost;

    // 6. 손익 판정
    const profit = product.costBreakdown.sellingPrice - newFinalCost;
    const profitRate = (profit / product.costBreakdown.sellingPrice) * 100;

    let profitStatus;
    if (profitRate > 5) profitStatus = "PROFIT";
    else if (profitRate >= 0) profitStatus = "BREAK_EVEN";
    else if (profitRate >= -5) profitStatus = "WARNING";
    else profitStatus = "LOSS";

    return {
      productId: product.id,
      productName: product.registeredProductName,
      weight: product.weight,
      previousCost: product.costBreakdown.purchasePrice,
      newCost: newPurchasePrice,
      previousFinalCost: product.costBreakdown.finalCost,
      newFinalCost: newFinalCost,
      currentSellingPrice: product.costBreakdown.sellingPrice,
      profitRate: profitRate.toFixed(1),
      profitStatus: profitStatus
    };
  });

  return affectedProducts;
}
```

---

### 4.5 UI/UX 설계

#### 4.5.1 새로운 메뉴 구조

```
📦 상품관리
├── 상품 목록 (기존)
├── 상품 등록 (기존 + 카테고리/포장/비용 설정 추가)
├── 카테고리 관리 (신규)  ← 양파(소), 감자 등 + kg당 기준가 설정
└── 포장자재 관리 (신규)  ← 박스, 보냉팩 종류 + 단가 설정

📊 재고관리
├── 상품 재고 (기존)
├── 포장자재 재고 (신규)  ← 박스/보냉팩 현재고
└── 포장자재 입출고 (신규) ← 입고 등록, 이력 조회

💰 가격관리 (신규 메뉴)
├── 가격 변동 요청 (신규)  ← 대기 중인 승인 요청 목록
├── 가격 변동 이력 (신규)  ← 승인/거부 이력 조회
└── 손익 분석 (신규)       ← 상품별 손익 현황

📈 대시보드
├── 일일 출고 현황 (신규)
│   ├── 카테고리별 출고량
│   ├── 포장자재 사용량
│   └── 출고 비용 집계 (신규)
├── 재고 알림 (신규)       ← 최소 재고 이하 알림
└── 가격 경고 (신규)       ← 손실 상품 알림
```

#### 4.5.2 상품 등록 페이지 수정

```
[상품 등록/수정]

기본 정보
├── 등록 상품명: [양파(소) 5kg        ]
├── 택배 상품명: [햇 양파(소) 5kg     ]
└── 오픈마켓:    [쿠팡 ▼]

카테고리 & 중량 (신규 섹션)
├── 카테고리:    [양파(소) ▼] [+ 새 카테고리]
│   └── 현재 kg당 기준가: 2,000원
├── 중량:        [5    ] [kg ▼]
└──

포장 설정 (신규 섹션)
├── 박스 종류:   [5kg 박스 ▼] × [1]개  (단가: 500원)
├── 보냉팩:      [대형 보냉팩 ▼] × [2]개  (단가: 200원)
└── 보냉팩 모드: ○ 항상 사용  ○ 선택적  ● 사용 안함

비용 구성 (신규 섹션) ─────────────────────────────
├── 매입가:      [10,000] (자동: 2,000원 × 5kg)
├── 배송비:      [3,000 ]
├── 박스비:      500원 (자동 계산)
├── 부자재비:    400원 (자동 계산)
├── 광고비:      [500  ]
├── 수수료율:    9% (마켓에서 자동 적용)
├── ─────────────────────────────────────
├── 총 원가:     13,900원
├── 수수료:      1,251원 (판매가의 9%)
├── 최종 비용:   15,651원
├── ─────────────────────────────────────
├── 판매가:      [18,000]
├── 마진:        2,349원
└── 수익률:      13.1% 🟢
```

#### 4.5.3 일일 출고 현황 대시보드

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📅 2024년 1월 15일 출고 현황                                    [◀][▶] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📦 카테고리별 출고량                                                   │
│  ┌─────────────┬─────────┬─────────┬───────────┬─────────────────────┐ │
│  │ 카테고리     │ 총 출고량│ 건수    │ 매입비용   │ 상세               │ │
│  ├─────────────┼─────────┼─────────┼───────────┼─────────────────────┤ │
│  │ 양파(소)    │ 150 kg  │ 25건    │ 300,000원 │ [상세보기]          │ │
│  │ 양파(대)    │ 200 kg  │ 15건    │ 360,000원 │ [상세보기]          │ │
│  │ 감자        │ 80 kg   │ 12건    │ 160,000원 │ [상세보기]          │ │
│  │ 고구마      │ 60 kg   │ 8건     │ 150,000원 │ [상세보기]          │ │
│  └─────────────┴─────────┴─────────┴───────────┴─────────────────────┘ │
│                                                                         │
│  📦 포장자재 사용량                                                     │
│  ┌─────────────┬─────────┬─────────┬───────────┬─────────────────────┐ │
│  │ 자재        │ 사용량   │ 현재고  │ 비용      │ 상태               │ │
│  ├─────────────┼─────────┼─────────┼───────────┼─────────────────────┤ │
│  │ 5kg 박스    │ 25개    │ 475개   │ 12,500원  │ 🟢 정상            │ │
│  │ 10kg 박스   │ 20개    │ 85개    │ 14,000원  │ 🟡 주의            │ │
│  │ 15kg 박스   │ 8개     │ 42개    │ 6,400원   │ 🟢 정상            │ │
│  │ 보냉팩(대)  │ 30개    │ 15개    │ 6,000원   │ 🔴 부족            │ │
│  └─────────────┴─────────┴─────────┴───────────┴─────────────────────┘ │
│                                                                         │
│  💰 일일 비용 요약                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  매입비용: 970,000원 │ 포장비: 38,900원 │ 배송비: 180,000원      │  │
│  │  수수료: 153,000원  │ 광고비: 30,000원 │ 총 비용: 1,371,900원   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 4.5.4 가격 변동 승인 페이지 (신규)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💰 가격 변동 승인                                            [전체승인] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📋 변동 요청: 양파(소) kg당 가격 변경                                   │
│  ├── 요청일: 2024-01-15 10:30                                           │
│  ├── 변경 전: 2,000원/kg → 변경 후: 2,500원/kg (+25%)                   │
│  └── 영향 상품: 5개                                                     │
│                                                                         │
│  📊 영향받는 상품 목록                                                   │
│  ┌─────────────────┬────────┬──────────┬──────────┬────────┬─────────┐ │
│  │ 상품명          │ 중량   │ 기존 비용 │ 새 비용   │ 판매가  │ 손익    │ │
│  ├─────────────────┼────────┼──────────┼──────────┼────────┼─────────┤ │
│  │ 양파(소) 3kg    │ 3kg    │ 9,600원  │ 11,100원 │ 12,000 │🟢 +7.5% │ │
│  │                 │        │          │          │        │[✓][✗]  │ │
│  ├─────────────────┼────────┼──────────┼──────────┼────────┼─────────┤ │
│  │ 양파(소) 5kg    │ 5kg    │ 15,651원 │ 18,151원 │ 18,000 │🔴 -0.8% │ │
│  │                 │        │          │          │        │[✓][✗]  │ │
│  ├─────────────────┼────────┼──────────┼──────────┼────────┼─────────┤ │
│  │ 양파(소) 10kg   │ 10kg   │ 28,802원 │ 33,802원 │ 35,000 │🟡 +3.4% │ │
│  │                 │        │          │          │        │[✓][✗]  │ │
│  └─────────────────┴────────┴──────────┴──────────┴────────┴─────────┘ │
│                                                                         │
│  ⚠️ 경고: 1개 상품이 손실 상태입니다. 판매가 조정을 권장합니다.          │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 요약: 🟢 이익 2개 │ 🟡 손익분기 1개 │ 🟠 경고 0개 │ 🔴 손실 1개   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                              [선택 항목 승인] [전체 거부] [보류]         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 4.5.5 상품 손익 분석 페이지 (신규)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 상품 손익 분석                                    [필터: 전체 ▼]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ⚠️ 손실 상품 경고: 3개 상품이 손실 상태입니다                           │
│                                                                         │
│  ┌─────────────────┬────────┬────────┬────────┬────────┬───────┬─────┐ │
│  │ 상품명          │ 카테고리│ 총 비용│ 판매가 │ 마진   │ 수익률│상태 │ │
│  ├─────────────────┼────────┼────────┼────────┼────────┼───────┼─────┤ │
│  │ 양파(소) 5kg    │양파(소)│ 18,151 │ 18,000 │  -151  │ -0.8% │ 🔴  │ │
│  │ 감자 3kg        │ 감자   │ 12,500 │ 12,000 │  -500  │ -4.2% │ 🟠  │ │
│  │ 고구마 5kg      │ 고구마 │ 22,000 │ 20,000 │ -2,000 │-10.0% │ 🔴  │ │
│  │ 양파(대) 10kg   │양파(대)│ 35,000 │ 38,000 │  3,000 │  7.9% │ 🟢  │ │
│  │ ...             │        │        │        │        │       │     │ │
│  └─────────────────┴────────┴────────┴────────┴────────┴───────┴─────┘ │
│                                                                         │
│  💡 권장 조치                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ • 양파(소) 5kg: 판매가를 18,500원 이상으로 조정 필요              │  │
│  │ • 고구마 5kg: 매입가 재협상 또는 판매가 24,200원 이상 조정 필요   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. 구현 계획

### 5.1 단계별 구현

#### Phase 1: 기반 구조
- [ ] Firestore 컬렉션 생성
  - `product_categories` (+ pricing 필드)
  - `packaging_materials` (+ unitPrice 필드)
  - `packaging_inventory`
  - `packaging_movements`
  - `price_change_requests` (신규)
  - `price_change_history` (신규)
- [ ] 기본 CRUD 서비스 함수 작성
- [ ] 가격 계산 유틸리티 함수 작성

#### Phase 2: 관리 페이지
- [ ] 카테고리 관리 페이지 (`CategoryManagementPage`)
  - kg당 기준가 설정 기능
- [ ] 포장자재 관리 페이지 (`PackagingMaterialPage`)
  - 단가 설정 기능
- [ ] 포장자재 재고 페이지 (`PackagingInventoryPage`)

#### Phase 3: 상품 연동
- [ ] `ProductCreationPage` 수정
  - 카테고리 선택 UI 추가
  - 포장자재 설정 UI 추가
  - 비용 구성 섹션 추가 (자동 계산)
  - 손익 실시간 표시
- [ ] 기존 상품 마이그레이션 (카테고리 할당)

#### Phase 4: 출고 연동
- [ ] 출고 시 포장자재 자동 차감 로직
- [ ] 보냉팩 선택 UI 추가
- [ ] 비용 자동 집계 트랜잭션 처리

#### Phase 5: 가격 관리 시스템 (신규)
- [ ] 가격 변동 승인 페이지 (`PriceChangeApprovalPage`)
  - 영향 분석 표시
  - 개별/일괄 승인/거부 기능
  - 손익 상태 시각화
- [ ] 가격 변동 이력 페이지 (`PriceChangeHistoryPage`)
- [ ] 상품 손익 분석 페이지 (`ProductProfitAnalysisPage`)
  - 손실 상품 경고
  - 권장 조치 표시

#### Phase 6: 대시보드
- [ ] 일일 출고 집계 로직 (비용 포함)
- [ ] 대시보드 UI 구현
- [ ] 재고 알림 기능
- [ ] 가격 경고 알림 (손실 상품)

---

## 6. 추가 고려사항

### 6.1 데이터 마이그레이션
```javascript
// 기존 상품에 기본 카테고리 할당
// 1. 상품명에서 카테고리 추출 로직 작성
// 2. 배치 업데이트 스크립트 실행
// 예: "양파(소) 5kg" → categoryId: "양파(소)", weight: 5
```

### 6.2 성능 최적화
- 일일 집계는 출고 시 실시간 업데이트 (increment)
- 대시보드 조회 시 `daily_shipment_summary`만 조회
- 카테고리/포장자재 목록은 캐싱

### 6.3 확장 가능성
- 주간/월간 집계 리포트
- 포장자재 발주 자동화 (최소 재고 도달 시)
- 계절별 보냉팩 설정 자동화
- 가격 변동 예측 알림 (시세 연동)
- 마켓별 수익률 분석

---

## 7. 결론

### 7.1 핵심 변경사항 요약

| 영역 | 변경 내용 |
|------|----------|
| 데이터 | 6개 신규 컬렉션 + market_products 대폭 확장 |
| UI | 6개 신규 관리 페이지 + 대시보드 + 가격 승인 |
| 로직 | 출고 시 자동 집계 + 재고 차감 + 비용 계산 + 가격 승인 워크플로우 |

### 7.2 신규 컬렉션 요약

| 컬렉션 | 용도 |
|--------|------|
| `product_categories` | 카테고리 관리 + kg당 기준가 |
| `packaging_materials` | 포장자재 종류 + 단가 |
| `packaging_inventory` | 포장자재 재고 |
| `packaging_movements` | 포장자재 입출고 기록 |
| `price_change_requests` | 가격 변동 승인 요청 |
| `price_change_history` | 가격 변동 이력 |

### 7.3 예상 효과

1. **운영 효율성**
   - 일일 카테고리별 출고량 즉시 확인
   - 포장자재 재고 실시간 파악
   - 비용 구성 자동 계산

2. **비용 관리**
   - 포장자재 재고 부족 사전 예방
   - 총 출고 비용 실시간 모니터링
   - 상품별 손익 현황 파악

3. **가격 관리**
   - kg당 가격 변동 시 영향 분석 자동화
   - 상품별 승인/거부 선택으로 유연한 가격 정책
   - 손실 상품 사전 경고로 리스크 관리

4. **데이터 기반 의사결정**
   - 카테고리별 판매 추이 분석
   - 포장자재 소비 패턴 파악
   - 가격 변동 이력 추적
