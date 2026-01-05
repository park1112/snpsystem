import { useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const NotificationManager = () => {
    const [notifications, setNotifications] = useState([]);

    const createNotification = async (userId, notificationData) => {
        try {
            const notificationRef = await addDoc(collection(db, 'notifications'), {
                userId,
                ...notificationData,
                createdAt: new Date(),
                isUnRead: true,
            });
            return notificationRef.id;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    };

    const getNotifications = async (userId, limitCount = 10) => {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
            const querySnapshot = await getDocs(q);
            const notificationsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notificationsData);
            return notificationsData;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, { isUnRead: false });
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id === notificationId ? { ...notification, isUnRead: false } : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    };

    return {
        notifications,
        createNotification,
        getNotifications,
        markNotificationAsRead,
    };
};

export const useNotification = () => {
    const notificationManager = NotificationManager();
    return notificationManager;
};