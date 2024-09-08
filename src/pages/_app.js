// scroll bar
import 'simplebar/src/simplebar.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import PropTypes from 'prop-types';
import cookie from 'cookie';
// next
import Head from 'next/head';
import App from 'next/app';
// utils
import { getSettings } from '../utils/settings';
// contexts
import { SettingsProvider } from '../contexts/SettingsContext';
import { CollapseDrawerProvider } from '../contexts/CollapseDrawerContext';
// theme
import ThemeProvider from '../theme';
// components
import Settings from '../components/settings';
import RtlLayout from '../components/RtlLayout';
import ProgressBar from '../components/ProgressBar';
import ThemeColorPresets from '../components/ThemeColorPresets';
import MotionLazyContainer from '../components/animate/MotionLazyContainer';
import Script from 'next/script';
import { SnackbarProvider } from 'notistack';


import { UserProvider } from '../contexts/UserContext'; // UserProvider 임포트 추가
import { DataProvider } from '../contexts/DataContext';  // DataProvider 임포트 추가


// ----------------------------------------------------------------------

MyApp.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
  settings: PropTypes.object,
};

export default function MyApp(props) {
  const { Component, pageProps, settings } = props;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Script

        strategy="beforeInteractive"
      />
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <CollapseDrawerProvider>
        <SettingsProvider defaultSettings={settings}>
          <SnackbarProvider maxSnack={3}>
            <ThemeProvider>
              <DataProvider>{/* DataProvider 감싸기 */}
                <UserProvider> {/* UserProvider로 감싸기 */}
                  <MotionLazyContainer>
                    <ThemeColorPresets>
                      <RtlLayout>
                        <Settings />
                        <ProgressBar />
                        {getLayout(<Component {...pageProps} />)}
                      </RtlLayout>
                    </ThemeColorPresets>
                  </MotionLazyContainer>
                </UserProvider> {/* UserProvider로 감싸기 */}
              </DataProvider>{/* DataProvider 감싸기 */}
            </ThemeProvider>
          </SnackbarProvider>
        </SettingsProvider>
      </CollapseDrawerProvider >
    </>
  );
}

// ----------------------------------------------------------------------

MyApp.getInitialProps = async (context) => {
  const appProps = await App.getInitialProps(context);

  const cookies = cookie.parse(context.ctx.req ? context.ctx.req.headers.cookie || '' : document.cookie);

  const settings = await getSettings(cookies);

  return {
    ...appProps,
    settings,
  };
};
