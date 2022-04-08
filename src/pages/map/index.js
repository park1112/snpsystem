/*global kakao*/
import {
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardHeader,
  Button,
  Stack,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
// layouts
import Layout from '../../layouts';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import { useEffect, useState, useCallback } from 'react';
import Axios from 'axios';
import CollapsibleTable from '../../components/table';
import DataTable from '../../components/table/dataTable';
import { ca } from 'date-fns/locale';
import { set } from 'lodash';
import { useRouter } from 'next/router';
import Iconify from '../../components/Iconify';
import styled from '@emotion/styled';
import { Map, MapMarker, MapTypeControl, ZoomControl, MapTypeId, useMap } from 'react-kakao-maps-sdk';
import Block from '../../components/Block';

// ----------------------------------------------------------------------

KakaoMap.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

// ----------------------------------------------------------------------

export default function KakaoMap() {
  const { themeStretch } = useSettings();
  const [addressName, setAddressName] = useState('');

  const [state, setState] = useState({
    // 지도의 초기 위치
    center: { lat: 35.58957767266, lng: 128.175247954429 },
    // 지도 위치 변경시 panto를 이용할지에 대해서 정의
    isPanto: false,
  });

  //

  // 마커이미지의 주소입니다. 스프라이트 이미지 입니다
  const markerImageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/category.png';

  const imageSize = { width: 22, height: 26 };
  const spriteSize = { width: 36, height: 98 };

  // 커피숍 마커가 표시될 좌표 배열입니다
  const coffeePositions = [
    { lat: 37.499590490909185, lng: 127.0263723554437 },
    { lat: 37.499427948430814, lng: 127.02794423197847 },
    { lat: 37.498553760499505, lng: 127.02882598822454 },
    { lat: 37.497625593121384, lng: 127.02935713582038 },
    { lat: 37.49646391248451, lng: 127.02675574250912 },
    { lat: 37.49629291770947, lng: 127.02587362608637 },
    { lat: 37.49754540521486, lng: 127.02546694890695 },
  ];
  const coffeeOrigin = { x: 10, y: 0 };

  // 편의점 마커가 표시될 좌표 배열입니다
  const storePositions = [
    { lat: 37.497535461505684, lng: 127.02948149502778 },
    { lat: 37.49671536281186, lng: 127.03020491448352 },
    { lat: 37.496201943633714, lng: 127.02959405469642 },
    { lat: 37.49640072567703, lng: 127.02726459882308 },
    { lat: 37.49640098874988, lng: 127.02609983175294 },
    { lat: 37.49932849491523, lng: 127.02935780247945 },
    { lat: 37.49996818951873, lng: 127.02943721562295 },
  ];
  const storeOrigin = { x: 10, y: 36 };

  // 주차장 마커가 표시될 좌표 배열입니다
  const carparkPositions = [
    { lat: 37.49966168796031, lng: 127.03007039430118 },
    { lat: 37.499463762912974, lng: 127.0288828824399 },
    { lat: 37.49896834100913, lng: 127.02833986892401 },
    { lat: 37.49893267508434, lng: 127.02673400572665 },
    { lat: 37.49872543597439, lng: 127.02676785815386 },
    { lat: 37.49813096097184, lng: 127.02591949495914 },
    { lat: 37.497680616783086, lng: 127.02518427952202 },
  ];
  const carparkOrigin = { x: 10, y: 72 };

  const [selectedCategory, setSelectedCategory] = useState('coffee');

  useEffect(() => {
    const coffeeMenu = document.getElementById('coffeeMenu');
    const storeMenu = document.getElementById('storeMenu');
    const carparkMenu = document.getElementById('carparkMenu');

    if (selectedCategory === 'coffee') {
      // 커피숍 카테고리를 선택된 스타일로 변경하고
      coffeeMenu.className = 'menu_selected';

      // 편의점과 주차장 카테고리는 선택되지 않은 스타일로 바꿉니다
      storeMenu.className = '';
      carparkMenu.className = '';
    } else if (selectedCategory === 'store') {
      // 편의점 카테고리가 클릭됐을 때

      // 편의점 카테고리를 선택된 스타일로 변경하고
      coffeeMenu.className = '';
      storeMenu.className = 'menu_selected';
      carparkMenu.className = '';
    } else if (selectedCategory === 'carpark') {
      // 주차장 카테고리가 클릭됐을 때

      // 주차장 카테고리를 선택된 스타일로 변경하고
      coffeeMenu.className = '';
      storeMenu.className = '';
      carparkMenu.className = 'menu_selected';
    }
  }, [selectedCategory]);

  const addload = () => {
    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder(); // 주소-좌표 반환 객체를 생성
      // 주소로 좌표를 검색
      geocoder.addressSearch(addressName, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          // 정상적으로 검색이 완료됐으면
          var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          setState({
            center: { lat: coords.Ma, lng: coords.La },
            isPanto: true,
          });
          console.log('정상작동');
        } else {
          console.log('에러 안됨!!');
        }
      });
    });
  };

  return (
    <Page title="Page Two">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Typography variant="h3" component="h1" paragraph>
          양파 마늘 구매현황
          <MapSearch>
            <TextField
              id="road"
              label="주소를 입력해주세요&nbsp;😀 &nbsp;😀&nbsp;&nbsp;주소만 검색 가능합니다."
              style={{ width: '60%' }}
              value={addressName}
              onChange={(e) => setAddressName(e.target.value)}
            />{' '}
            &nbsp;
            <Button
              onClick={addload}
              id="address"
              style={{ backgroundColor: '#FFCC4D' }}
              variant="contained"
              disableElevation
            >
              <span style={{ fontWeight: '600' }}>검색</span>
            </Button>
          </MapSearch>
          <Map center={state.center} isPanto={state.isPanto} style={{ width: '100%', height: '600px' }} level={3}>
            {selectedCategory === 'coffee' &&
              coffeePositions.map((position) => (
                <MapMarker
                  key={`coffee-${position.lat},${position.lng}`}
                  position={position}
                  image={{
                    src: markerImageSrc,
                    size: imageSize,
                    options: {
                      spriteSize: spriteSize,
                      spriteOrigin: coffeeOrigin,
                    },
                  }}
                />
              ))}
            {selectedCategory === 'store' &&
              storePositions.map((position) => (
                <MapMarker
                  key={`store-${position.lat},${position.lng}`}
                  position={position}
                  image={{
                    src: markerImageSrc,
                    size: imageSize,
                    options: {
                      spriteSize: spriteSize,
                      spriteOrigin: storeOrigin,
                    },
                  }}
                />
              ))}
            {selectedCategory === 'carpark' &&
              carparkPositions.map((position) => (
                <MapMarker
                  key={`carpark-${position.lat},${position.lng}`}
                  position={position}
                  image={{
                    src: markerImageSrc,
                    size: imageSize,
                    options: {
                      spriteSize: spriteSize,
                      spriteOrigin: carparkOrigin,
                    },
                  }}
                >
                  <div style={{ padding: '5px', color: '#000' }}>
                    합천 박현재 농가 <br />
                    <a
                      href="https://map.kakao.com/link/map/Hello World!,33.450701,126.570667"
                      style={{ color: 'blue' }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      농가정보
                    </a>{' '}
                    <a
                      href="https://map.kakao.com/link/to/Hello World!,33.450701,126.570667"
                      style={{ color: 'blue' }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      작업현황
                    </a>
                  </div>
                </MapMarker>
              ))}

            {/* <MapTypeId type={kakao.maps.MapTypeId.TERRAIN} /> */}
            {/* <ZoomControl position={kakao.maps.ControlPosition.TOPRIGHT()} /> */}
            {/* <MapTypeControl position={kakao.maps.ControlPosition.TOPRIGHT()} /> */}
          </Map>
          {/* 지도 위에 표시될 마커 카테고리 */}
          <div className="category">
            <ul>
              <li id="coffeeMenu" onClick={() => setSelectedCategory('coffee')}>
                <span className="ico_comm ico_coffee"></span>
                모두보기
              </li>
              <li id="storeMenu" onClick={() => setSelectedCategory('store')}>
                <span className="ico_comm ico_store"></span>
                양파
              </li>
              <li id="carparkMenu" onClick={() => setSelectedCategory('carpark')}>
                <span className="ico_comm ico_carpark"></span>
                마늘
              </li>
            </ul>
          </div>
        </Typography>
      </Container>

      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Button
          onClick={() =>
            setState({
              center: { lat: 35.58957767266, lng: 128.175247954429 },
              isPanto: false,
            })
          }
        >
          에스엔피 1공장
        </Button>
        <Button
          onClick={() =>
            setState({
              center: { lat: 33.45058, lng: 126.574942 },
              isPanto: false,
            })
          }
        >
          제주도
        </Button>
      </Container>
    </Page>
  );
}

const MapSearch = styled.div`
  margin-top: 25;
  margin-bottom: 25px;
  width: 900px;
  display: flex; // align-items: center; @media (max-width: 1000px){ width: 85%; }; @media (max-width: 450px){ width: 95%; }
`;
const MapContainer = styled.div`
  aspect-ratio: 16 / 9;
`;
