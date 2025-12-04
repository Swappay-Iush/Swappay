import { create } from "zustand";
import api from "../../service/axiosConfig";

if (typeof window !== "undefined") {
    window.localStorage.removeItem("chat-storage");
}

export const useChatUser = create((set, get) => ({
    conversations_users: [],

    setChat: (infoUsers) => set((state) => {
        const exists = state.conversations_users.some((user) => user.userId === infoUsers.userId);
        if (exists) {
            return {};
        }
        return { conversations_users: [...state.conversations_users, infoUsers] };
    }),

    getChatRoom: async (userId) => {
        try {
            const { data } = await api.get(`/chat/user/${userId}`);

            if (!data || data.length === 0) {
                return;
            }

            const formattedChats = data.map((room) => {
                const user1 = room.User1 || room.user1;
                const user2 = room.User2 || room.user2;

                if (!user1 || !user2) {
                    return null;
                }

                const idActual = Number(userId);
                const user1Id = Number(room.user1Id ?? user1.id);
                let otherUser = user1Id === idActual ? user2 : user1;

                if (otherUser && Number(otherUser.id) === idActual) {
                    otherUser = user1Id === idActual ? user1 : user2;
                }

                if (!otherUser || Number(otherUser.id) === idActual) {
                    return null;
                }

                return {
                    userId: otherUser.id,
                    userImage: otherUser.profileImage,
                    username: otherUser.username,
                    chat_id: room.id,
                };
            }).filter(Boolean);

            const uniqueChats = [];
            const seenIds = new Set();

            for (const chat of formattedChats) {
                if (!seenIds.has(chat.chat_id)) {
                    uniqueChats.push(chat);
                    seenIds.add(chat.chat_id);
                }
            }

            set({ conversations_users: uniqueChats });
        } catch (error) {
            console.error("Error:", error.response?.data);
        }
    },

    removeChatRoomLocal: (chatRoomId) => {
        if (!chatRoomId) {
            return;
        }

        set((state) => ({
            conversations_users: state.conversations_users.filter(
                (chat) => Number(chat.chat_id) !== Number(chatRoomId)
            )
        }));
    },

    deleteChatRoom: async (chatRoomId, userId) => {
        if (!chatRoomId) {
            return false;
        }

        try {
            const baseConfig = {
                withCredentials: true
            };

            if (userId) {
                baseConfig.data = { userId };
                baseConfig.headers = { 'Content-Type': 'application/json' };
            }

            const endpoints = [
                `/chat/rooms/${chatRoomId}`,
                `/chat/${chatRoomId}`,
                `/chat/delete/${chatRoomId}`
            ];

            let success = false;
            let lastError = null;

            for (const endpoint of endpoints) {
                try {
                    const config = { ...baseConfig };
                    if (baseConfig.data) {
                        config.data = baseConfig.data;
                    }
                    if (baseConfig.headers) {
                        config.headers = baseConfig.headers;
                    }

                    await api.delete(endpoint, config);
                    success = true;
                    break;
                } catch (err) {
                    lastError = err;
                    const status = err?.response?.status;
                    if (status !== 404 && status !== 405) {
                        break;
                    }
                }
            }

            if (!success) {
                if (lastError) {
                    throw lastError;
                }
                throw new Error('No se pudo eliminar el chat.');
            }

            set((state) => ({
                conversations_users: state.conversations_users.filter(
                    (chat) => Number(chat.chat_id) !== Number(chatRoomId)
                )
            }));

            return true;
        } catch (error) {
            console.error('Error eliminando sala de chat:', error?.response?.data || error);
            return false;
        }
    },
}));