import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const FormattedDate = ({ date, className = '', showTime = true, formatString }) => {
    const formatDate = (date) => {
        try {
            if (formatString) {
                return format(date, formatString, { locale: ko });
            }
            return format(date, showTime ? 'yyyy년 MM월 dd일 HH:mm:ss' : 'yyyy년 MM월 dd일', { locale: ko });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    if (!date) {
        return <span className={className}>날짜 없음</span>;
    }

    let dateObject;
    try {
        if (date instanceof Date) {
            dateObject = date;
        } else if (typeof date === 'object' && date.toDate instanceof Function) {
            // Firestore Timestamp 객체 처리
            dateObject = date.toDate();
        } else if (typeof date === 'number') {
            // Unix timestamp (밀리초) 처리
            dateObject = new Date(date);
        } else if (typeof date === 'string') {
            // ISO 문자열 또는 다른 날짜 문자열 처리
            dateObject = new Date(date);
        } else {
            throw new Error('Unsupported date format');
        }

        if (isNaN(dateObject.getTime())) {
            throw new Error('Invalid date');
        }

        return <span className={className}>{formatDate(dateObject)}</span>;
    } catch (error) {
        console.error('Error processing date:', error);
        return <span className={className}>잘못된 날짜</span>;
    }
};

export default FormattedDate;