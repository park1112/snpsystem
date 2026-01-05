import { useRouter } from 'next/router';
import ChatWindow from '../../components/chat/ChatWindow';
import Layout from '../../layouts';

export default function ChatDetailPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout>
            {<ChatWindow />}
        </Layout>
    );
}
