import Layout from '../../layouts';
import Page from '../../components/Page';
import CalendarList from '../../components/calendar/CalendarList';

const CalendarPage = () => {
  return <CalendarList />;
};

CalendarPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default CalendarPage;
