import Layout from '../../layouts';
import Page from '../../components/Page';
import ChatPage from '../../components/chat/ChatPage';

const ChatMainPage = () => {
    return <ChatPage />;
};

ChatMainPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default ChatMainPage;
