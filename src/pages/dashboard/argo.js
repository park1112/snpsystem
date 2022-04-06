import { Container, Typography } from '@mui/material';
// layouts
import Layout from '../../layouts';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
//zustand
import create from 'zustand';
import { reject, set } from 'lodash';
import { useCallback, useState } from 'react';
import readXlsxFile from 'read-excel-file';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// ----------------------------------------------------------------------

PageOne.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// ----------------------------------------------------------------------

const useStore = create(() => ({
  count: 0,

  증가() {
    set((state) => ({ count: state.count + 1 }));
  },
  async ajax요청() {
    const response = await fetch('https://codingapple1.github.io/data.json');
    console.log(await response.json());
  },
}));
const filese = [];
const user = [];

export default function PageOne() {
  const { themeStretch } = useSettings();
  const { count, 증가, ajax요청 } = useStore();

  //파일명 !

  const [deliveryList, setDeliveryList] = useState({});

  const [itemList, setItemList] = useState({
    coupang: [],
    naver: [],
    gmarket: [],
    wemakeprice: [],
    tiket: [],
    st: [],
    interpark: [],
    lotte: [],
  });

  //파일수정 !
  const readExcel = (file, name) => {
    console.log(file);
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: 'buffer' });

        const wsname = wb.SheetNames[0];

        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
    promise.then((d) => {
      console.log('어레이자료!!');
      console.log(d);
      switch (name) {
        case 'coupang':
          console.log('쿠팡접속완료 ! ');
          setItemList({
            ...itemList,
            coupang: d,
          });
          d.map((user, i) => {
            if (d[i].옵션ID == '75962046427') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(특) 3kg'
                )
              );
            } else if (d[i].옵션ID == '75962046334') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(특) 5kg'
                )
              );
            } else if (d[i].옵션ID == '75962046384') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(특) 10kg'
                )
              );
            } else if (d[i].옵션ID == '75938820691') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(대) 3kg'
                )
              );
            } else if (d[i].옵션ID == '75938820679') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(대) 5kg'
                )
              );
            } else if (d[i].옵션ID == '75938820657') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(대) 10kg'
                )
              );
            } else if (d[i].옵션ID == '75962239350') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(중) 3kg'
                )
              );
            } else if (d[i].옵션ID == '75962239207') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(중) 5kg'
                )
              );
            } else if (d[i].옵션ID == '75962239234') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(중) 10kg'
                )
              );
            } else if (d[i].옵션ID == '78670305294') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '중',
                  d[i].배송메세지,
                  '*합천 햇양파(특) 20kg'
                )
              );
            } else if (d[i].옵션ID == '78670337609') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '중',
                  d[i].배송메세지,
                  '*합천 햇양파(대) 20kg'
                )
              );
            } else if (d[i].옵션ID == '78670343332') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '중',
                  d[i].배송메세지,
                  '*합천 햇양파(중) 20kg'
                )
              );
            } else if (d[i].옵션ID == '78867287341') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(장아찌) 10kg'
                )
              );
            } else if (d[i].옵션ID == '78867287327') {
              return filese.push(
                new Delivery(
                  d[i].수취인이름,
                  d[i].구매자전화번호,
                  d[i]['수취인 주소'],
                  d[i]['구매수(수량)'],
                  '소',
                  d[i].배송메세지,
                  '합천 햇양파(장아찌) 5kg'
                )
              );
            }
          });
          console.log(filese);

          break;
        case 'naver':
          console.log('naver접속완료! ! ');
          setItemList({
            ...itemList,
            naver: d,
          });
          d.map((user, i) => {
            if (d[i].옵션정보 == '크기: 양파(특) / 중량: 3kg') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(특) / 중량: 3kg'
                )
              );
            } else if (d[i].옵션정보 == '크기: 양파(대) / 중량: 3kg') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(대) / 중량: 3kg'
                )
              );
            } else if (d[i].옵션정보 == '크기: 양파(중) / 중량: 3kg') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(중) / 중량: 3kg'
                )
              );
            } else if (d[i].옵션정보 == '무게: 5kg / 사이즈: 특' || d[i].옵션정보 == '크기: 양파(특) / 중량: 5kg') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(특) / 중량: 5kg'
                )
              );
            } else if (d[i].옵션정보 == '무게: 5kg / 사이즈: 대' || d[i].옵션정보 == '크기: 양파(대) / 중량: 5kg') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(대) / 중량: 5kg'
                )
              );
            } else if (d[i].옵션정보 == '무게: 5kg / 사이즈: 중' || d[i].옵션정보 == '크기: 양파(중) / 중량: 5kg') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(중) / 중량: 5kg'
                )
              );
            } else if (d[i].옵션정보 == '크기: 양파(특) / 중량: 10kg' || d[i].옵션정보 == '무게: 10kg / 사이즈: 특') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(특) / 중량: 10kg'
                )
              );
            } else if (d[i].옵션정보 == '크기: 양파(대) / 중량: 10kg' || d[i].옵션정보 == '무게: 10kg / 사이즈: 대') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(대) / 중량: 10kg'
                )
              );
            } else if (d[i].옵션정보 == '크기: 양파(중) / 중량: 10kg' || d[i].옵션정보 == '무게: 10kg / 사이즈: 중') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처1,
                  d[i].배송지,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '양파(중) / 중량: 10kg'
                )
              );
            }
          });
          break;
        case 'gmarket':
          console.log('gmarket접속완료! ! ');
          setItemList({
            ...itemList,
            gmarket: d,
          });
          d.map((user, i) => {
            if (d[i].상품번호 == 'C392317388' || d[i].상품번호 == '2183841490') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(특) 3kg'
                )
              );
            } else if (d[i].상품번호 == 'C392297622' || d[i].상품번호 == '2183843227') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(대) 3kg'
                )
              );
            } else if (d[i].상품번호 == 'C392319035' || d[i].상품번호 == '2183840549') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(중) 3kg'
                )
              );
            } else if (d[i].상품번호 == 'C392320442' || d[i].상품번호 == '2183839586') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(특) 5kg'
                )
              );
            } else if (d[i].상품번호 == 'C392321895' || d[i].상품번호 == '2183838274') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(대) 5kg'
                )
              );
            } else if (d[i].상품번호 == 'C392323608' || d[i].상품번호 == '2183837318') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(중) 5kg'
                )
              );
            } else if (d[i].상품번호 == 'C392324243' || d[i].상품번호 == '2183835995') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(특) 10kg'
                )
              );
            } else if (d[i].상품번호 == 'C392324814' || d[i].상품번호 == '2183834728') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(대) 10kg'
                )
              );
            } else if (d[i].상품번호 == 'C392326527' || d[i].상품번호 == '2183833285') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(중) 10kg'
                )
              );
            } else if (d[i].상품번호 == 'C497410406' || d[i].상품번호 == '2326679260') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '중',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(특) 20kg'
                )
              );
            } else if (d[i].상품번호 == 'C497411822' || d[i].상품번호 == '2326680206') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '중',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(대) 20kg'
                )
              );
            } else if (d[i].상품번호 == 'C497412243' || d[i].상품번호 == '2326680444') {
              return filese.push(
                new Delivery(
                  d[i].수령인명,
                  d[i]['수령인 휴대폰'],
                  d[i].주소,
                  d[i].수량,
                  '중',
                  d[i]['배송시 요구사항'],
                  '합천 햇양파(중) 20kg'
                )
              );
            }
          });
          break;
        case 'wemakeprice':
          console.log('wemakeprice접속완료! ! ');
          setItemList({
            ...itemList,
            wemakeprice: d,
          });
          d.map((user, i) => {
            if (d[i].옵션 == '햇 양파(특) | 3kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(특) | 3kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(대) | 3kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(대) | 3kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(중) | 3kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(중) | 3kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(특) | 5kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(특) | 5kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(대) | 5kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(대) | 5kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(중) | 5kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(중) | 5kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(특) | 10kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(특) | 10kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(대) | 10kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(대) | 10kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(중) | 10kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '소',
                  d[i].배송메세지,
                  '햇 양파(중) | 10kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(특) | 20kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '중',
                  d[i].배송메세지,
                  '햇 양파(특) | 20kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(대) | 20kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '중',
                  d[i].배송메세지,
                  '햇 양파(대) | 20kg'
                )
              );
            } else if (d[i].옵션 == '햇 양파(중) | 20kg') {
              return filese.push(
                new Delivery(
                  d[i].받는사람,
                  d[i]['받는사람 연락처'],
                  d[i].주소,
                  d[i].수량,
                  '중',
                  d[i].배송메세지,
                  '햇 양파(중) | 20kg'
                )
              );
            }
          });

          break;
        case 'tiket':
          console.log('tiket접속완료! ! ');
          setItemList({
            ...itemList,
            tiket: d,
          });

          d.map((user, i) => {
            if (d[i].옵션번호 == '8604403334') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(특) | 3kg'
                )
              );
            } else if (d[i].옵션번호 == '8604432946') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(대) | 3kg'
                )
              );
            } else if (d[i].옵션번호 == '8604048910') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(중) | 3kg'
                )
              );
            } else if (d[i].옵션번호 == '8604403338') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(특) | 5kg'
                )
              );
            } else if (d[i].옵션번호 == '8604432950') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(대) | 5kg'
                )
              );
            } else if (d[i].옵션번호 == '8604048914') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(중) | 5kg'
                )
              );
            } else if (d[i].옵션번호 == '8604403322') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(특) | 10kg'
                )
              );
            } else if (d[i].옵션번호 == '8604432938') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(대) | 10kg'
                )
              );
            } else if (d[i].옵션번호 == '8604048918') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '소',
                  d[i].배송요청메모,
                  '햇 양파(중) | 10kg'
                )
              );
            } else if (d[i].옵션번호 == '8604403330') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '중',
                  d[i].배송요청메모,
                  '햇 양파(특) | 20kg'
                )
              );
            } else if (d[i].옵션번호 == '8604432942') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '중',
                  d[i].배송요청메모,
                  '햇 양파(대) | 20kg'
                )
              );
            } else if (d[i].옵션번호 == '8604048922') {
              return filese.push(
                new Delivery(
                  d[i].수취인명,
                  d[i].수취인연락처,
                  d[i].수취인주소,
                  d[i].구매수량,
                  '중',
                  d[i].배송요청메모,
                  '햇 양파(중) | 20kg'
                )
              );
            }
          });
          console.log('자료!!');
          console.log(filese);

          break;
        case 'st':
          console.log('st접속완료! ! ');
          setItemList({
            ...itemList,
            st: d,
          });
          break;

        case 'interpark':
          console.log('interpark접속완료! ! ');
          setItemList({
            ...itemList,
            interpark: d,
          });
          break;
        case 'lotte':
          console.log('lotte접속완료! ! ');
          setItemList({
            ...itemList,
            lotte: d,
          });
          break;
      }

      // 이프문 삭제 !
      // if (name === 'coupang') {
      //   console.log('쿠팡접속완료 ! ');
      //   setItemList({
      //     ...itemList,
      //     coupang: d,
      //   });
      // } else if (name === 'naver') {
      //   console.log('네이버 접속 완료  ! ');
      //   setItemList({
      //     ...itemList,
      //     naver: d,
      //   });
      // }
    });
  };

  // new Delivery(순서대로 , 하면, 된, 다 )

  function Delivery(username, phone, address, quantity, boxsize, message, name) {
    this.예약구분 = '';
    this.집하예정일 = '';
    this.받는분성명 = username;
    this.받는분전화번호 = phone;
    this.받는분기타연락처 = '';
    this.받는분우편번호 = '';
    this.받는분주소 = address;
    this.운송장번호 = '';
    this.고객주문번호 = '';
    this.품목명 = '식품(농산물)';
    this.박스수량 = quantity;
    this.박스타입 = boxsize;
    this.기본운임 = '';
    this.배송메세지1 = message;
    this.배송메세지2 = '';
    this.품목명 = name;
  }

  //수정코드
  const onChangeFile = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    readExcel(file, name);
  };

  // 기존코드 !
  // const onChangeFile = (e) => {
  //   const file = e.target.files[0];
  //   console.log(file);
  //   // readExcel(file);
  // };

  //기본출력 !

  let today = new Date(); // today 객체에 Date()의 결과를 넣어줬다
  let time = {
    year: today.getFullYear(), //현재 년도
    month: today.getMonth() + 1, // 현재 월
    date: today.getDate(), // 현재 날짜
    hours: today.getHours(), //현재 시간
    minutes: today.getMinutes(), //현재 분
  };

  const originalExcelDownload = () => {
    var wb = XLSX.utils.book_new(),
      ws = XLSX.utils.json_to_sheet(filese);

    XLSX.utils.book_append_sheet(wb, ws, 'sheet1');

    XLSX.writeFile(wb, `수취인형식(통합형)${time.year}${time.month}${time.date}${time.hours}.xlsx`);
  };

  return (
    <Page title="Page One">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          아르고 오픈마켓 자료 택배자료 변환
        </Typography>
        <Typography gutterBottom>
          <button onClick={ajax요청}>버튼</button>
          카드 : {count}
        </Typography>
        <br />
        <Typography>
          쿠팡 파일 선택!!
          <input id="coupang" name="coupang" type="file" onChange={onChangeFile} />
          수량 : {itemList.coupang.length}개
        </Typography>
        <br />
        <Typography>
          네이버 파일 선택!!
          <input id="naver" name="naver" type="file" onChange={onChangeFile} />
          수량 : {itemList.naver.length}개
        </Typography>
        <br />
        <Typography>
          옥션지마켓 파일 선택!!
          <input id="gmarket" name="gmarket" type="file" onChange={onChangeFile} />
          수량 : {itemList.gmarket.length}개
        </Typography>
        <br />
        <Typography>
          위메프 파일 선택!!
          <input id="wemakeprice" name="wemakeprice" type="file" onChange={onChangeFile} />
          수량 : {itemList.wemakeprice.length}개
        </Typography>
        <br />
        <Typography>
          티켓몬스터 파일 선택!!
          <input id="tiket" name="tiket" type="file" onChange={onChangeFile} />
          수량 : {itemList.tiket.length}개
          <br />
          경고** 20셀까지 없으면 삭제하시기 바랍니다!
        </Typography>
        <br />
        <Typography>
          여기서부터 아직못함!!
          <br />
          11번가 파일 선택!!
          <input id="st" name="st" type="file" onChange={onChangeFile} />
          수량 : {itemList.st.length}개
        </Typography>
        <br />
        <Typography>
          인터파크 파일 선택!!
          <input id="interpark" name="interpark" type="file" onChange={onChangeFile} />
          수량 : {itemList.interpark.length}개
        </Typography>
        <br />
        <Typography>
          롯데온 파일 선택!!
          <input id="lotte" name="lotte" type="file" onChange={onChangeFile} />
          수량 : {itemList.lotte.length}개
        </Typography>
        <br />
        <Typography>
          <button onClick={originalExcelDownload}> 택배자료 다운로드 </button>
        </Typography>
      </Container>
    </Page>
  );
}
