// components/FormattedDate.js
import React from 'react';
import PropTypes from 'prop-types';

const FormattedDate = ({ date, className }) => {
    const formatDate = (inputDate) => {
        const now = new Date();
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (inputDate >= todayMidnight) {
            // 오늘 날짜라면 시간만 표시
            return inputDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } else {
            // 다른 날짜라면 날짜만 표시
            return inputDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
        }
    };

    // Firestore Timestamp 객체 처리
    const dateObject = date instanceof Date ? date : date.toDate();

    return <span className={className}>{formatDate(dateObject)}</span>;
};

FormattedDate.propTypes = {
    date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.object]).isRequired,
    className: PropTypes.string,
};

export default FormattedDate;