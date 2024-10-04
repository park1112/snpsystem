// components/useUnreadMessages.js
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';

const useUnreadMessages = (chats = [], userId) => { // 기본값을 빈 배열로 설정
    const [unreadCounts, setUnreadCounts] = useState({}); // 각 채팅방의 unreadCount 저장

    useEffect(() => {
        // chats가 배열이 아닌 경우 처리
        if (!Array.isArray(chats) || chats.length === 0 || !userId) return;

        const unsubscribeList = chats.map(chat => {
            const messagesQuery = query(collection(db, `chats/${chat.id}/messages`));

            return onSnapshot(messagesQuery, (snapshot) => {
                let count = 0;
                snapshot.docs.forEach((doc) => {
                    const messageData = doc.data();
                    const readByArray = Array.isArray(messageData.readBy)
                        ? messageData.readBy
                        : Object.keys(messageData.readBy || {});

                    if (!readByArray.includes(userId)) {
                        count += 1;
                    }
                });

                // 해당 채팅의 unread count 업데이트
                setUnreadCounts(prevCounts => ({
                    ...prevCounts,
                    [chat.id]: count,
                }));
            });
        });

        // 모든 snapshot 리스너를 해제
        return () => unsubscribeList.forEach(unsubscribe => unsubscribe());
    }, [chats, userId]);

    return unreadCounts; // 모든 채팅의 unreadCount를 반환
};

export default useUnreadMessages;
