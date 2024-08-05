import Layout from '../../layouts';
import Page from '../../components/Page';
import Calendar from '../../components/calendar/Calendar';

const CalendarPage = () => {
  return <Calendar />;
};

CalendarPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default CalendarPage;
