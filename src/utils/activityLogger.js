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
