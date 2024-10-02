import { format, getTime, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

// ----------------------------------------------------------------------

export function fDate(date) {
  return format(new Date(date), 'dd MMMM yyyy');
}

export function fDateTime(date) {
  return format(new Date(date), 'dd MMM yyyy p');
}

export function fTimestamp(date) {
  return getTime(new Date(date));
}

export function fDateTimeSuffix(date) {
  return format(new Date(date), 'dd/MM/yyyy hh:mm p');
}

export function fToNow(date) {
  if (!date || isNaN(new Date(date))) {
    return '잘못된 날짜'; // 'Invalid date'를 한국어로
  }

  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ko,  // 한국어 로케일 적용
  });
}

