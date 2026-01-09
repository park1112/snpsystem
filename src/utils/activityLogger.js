import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * 활동 로그를 기록하는 유틸리티 함수
 * @param {Object} logData - 로그 데이터
 * @param {string} logData.action - 액션 타입 (CREATE, UPDATE, DELETE, DOWNLOAD)
 * @param {string} logData.category - 카테고리 (daily_summaries, products 등)
 * @param {string} logData.targetId - 대상 문서 ID
 * @param {string} logData.targetName - 대상 이름 (마켓명 등)
 * @param {string} logData.description - 상세 설명
 * @param {string} logData.userName - 사용자 이름 (선택)
 * @param {Object} logData.metadata - 추가 메타데이터 (선택)
 */
export const logActivity = async (logData) => {
    try {
        const logEntry = {
            action: logData.action,
            category: logData.category || 'general',
            targetId: logData.targetId || null,
            targetName: logData.targetName || null,
            description: logData.description,
            userName: logData.userName || '시스템',
            metadata: logData.metadata || {},
            createdAt: serverTimestamp(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
        };

        await addDoc(collection(db, 'activity_logs'), logEntry);
        console.log('Activity logged:', logEntry.description);
        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
};

// 액션 타입 상수
export const LOG_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    DOWNLOAD: 'DOWNLOAD',
    VIEW: 'VIEW',
};

// 카테고리 상수
export const LOG_CATEGORIES = {
    DAILY_SUMMARIES: 'daily_summaries',
    PRODUCTS: 'products',
    MARKETS: 'markets',
    USERS: 'users',
};

// 액션별 한글 라벨
export const ACTION_LABELS = {
    CREATE: '등록',
    UPDATE: '수정',
    DELETE: '삭제',
    DOWNLOAD: '다운로드',
    VIEW: '조회',
};

// 카테고리별 한글 라벨
export const CATEGORY_LABELS = {
    daily_summaries: '출고상품',
    products: '상품',
    markets: '마켓',
    users: '사용자',
    general: '일반',
};

/**
 * 두 객체를 비교하여 변경된 내용을 반환
 * @param {Object} original - 원본 데이터
 * @param {Object} updated - 수정된 데이터
 * @param {Object} fieldLabels - 필드 이름에 대한 한글 라벨 맵핑
 * @returns {Array} 변경사항 배열 [{field, label, from, to}]
 */
export const compareChanges = (original, updated, fieldLabels = {}) => {
    const changes = [];

    if (!original || !updated) return changes;

    // 단순 필드 비교
    const simpleFields = ['marketName', 'totalQuantity', 'totalPrice'];
    simpleFields.forEach(field => {
        if (original[field] !== updated[field]) {
            changes.push({
                field,
                label: fieldLabels[field] || field,
                from: original[field],
                to: updated[field]
            });
        }
    });

    // summary 배열 비교
    if (original.summary && updated.summary) {
        const origSummary = original.summary;
        const newSummary = updated.summary;

        // 삭제된 상품
        origSummary.forEach((origItem, idx) => {
            const stillExists = newSummary.some(newItem =>
                newItem.productName === origItem.productName
            );
            if (!stillExists) {
                changes.push({
                    field: 'summary',
                    label: '상품 삭제',
                    from: origItem.productName,
                    to: null
                });
            }
        });

        // 추가된 상품
        newSummary.forEach((newItem) => {
            const existed = origSummary.some(origItem =>
                origItem.productName === newItem.productName
            );
            if (!existed && newItem.productName) {
                changes.push({
                    field: 'summary',
                    label: '상품 추가',
                    from: null,
                    to: newItem.productName
                });
            }
        });

        // 수정된 상품
        newSummary.forEach((newItem) => {
            const origItem = origSummary.find(o => o.productName === newItem.productName);
            if (origItem) {
                // 수량 변경
                if (origItem.totalQuantity !== newItem.totalQuantity) {
                    changes.push({
                        field: 'productQuantity',
                        label: `"${newItem.productName}" 수량`,
                        from: origItem.totalQuantity,
                        to: newItem.totalQuantity
                    });
                }
                // 가격 변경
                if (origItem.productPrice !== newItem.productPrice) {
                    changes.push({
                        field: 'productPrice',
                        label: `"${newItem.productName}" 가격`,
                        from: origItem.productPrice,
                        to: newItem.productPrice
                    });
                }
                // 박스타입 변경
                if (origItem.boxType !== newItem.boxType) {
                    changes.push({
                        field: 'boxType',
                        label: `"${newItem.productName}" 박스타입`,
                        from: origItem.boxType || '(없음)',
                        to: newItem.boxType || '(없음)'
                    });
                }
            }
        });
    }

    return changes;
};

/**
 * 변경사항을 읽기 쉬운 문자열로 변환
 * @param {Array} changes - compareChanges 함수의 반환값
 * @returns {string} 변경 내용 요약 문자열
 */
export const formatChangeSummary = (changes) => {
    if (!changes || changes.length === 0) return '변경 없음';

    return changes.map(change => {
        if (change.from === null) {
            return `${change.label}: "${change.to}" 추가`;
        }
        if (change.to === null) {
            return `${change.label}: "${change.from}" 삭제`;
        }
        return `${change.label}: ${change.from} → ${change.to}`;
    }).join(', ');
};
