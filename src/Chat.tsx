import React, { useContext, useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import Avatar from './Avatar';
import { UserContext } from './UserContext';
import { uniqBy } from 'lodash';
import axios from 'axios';
import Contact from './Contact';
import { chatApiPath, imageUrl } from '../apiPath';
import { EmailContext } from './EmailProvider/EmailContext';
import { toast } from 'react-toastify';
import {
  MdSearch,
  MdSend,
  MdAttachFile,
  MdInsertDriveFile,
  MdChat,
  MdRefresh,
  MdClose,
  MdPeopleOutline
} from 'react-icons/md';

interface User {
  _id: string;
  userId: string;
  username: string;
}
interface Message {
  _id: string;
  sender: string;
  recipient: string;
  text: string;
  file?: string;
  read?: boolean;
}
interface UnreadMessages {
  [key: string]: Message[];
}
interface MessagesPerUser {
  [key: string]: Message[];
}

export default function Chat() {
  axios.defaults.baseURL = chatApiPath;
  const token = localStorage.getItem('token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const [onlinePeople, setOnlinePeople] = useState<any>({});
  const [offlinePeople, setOfflinePeople] = useState<Record<string, User>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [messagesPerUser, setMessagesPerUser] = useState<MessagesPerUser>({});
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'online'>('all');

  const { id, ws, connectToWs } = useContext(UserContext) as {
    ws: any;
    id: string;
    connectToWs: any;
  };
  const { fetchUnreadMessages } = useContext(EmailContext) as {
    fetchUnreadMessages: () => Promise<void>;
  };

  const divUnderMessages = useRef<HTMLDivElement | null>(null);
  const totalPeopleRef = useRef<Record<string, User>>({});

  useEffect(() => {
    requestNotificationPermission();
    if (ws) {
      ws.addEventListener('message', handleMessage);
    }
  }, [selectedUserId]);

  useEffect(() => {
    connectToWs();
  }, []);

  function requestNotificationPermission() {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  async function handleMessage(ev: MessageEvent) {
    try {
      const messageData = JSON.parse(ev.data);
      if ('online' in messageData) {
        showOnlinePeople(messageData.online);
      } else if ('text' in messageData) {
        if (messageData.sender === selectedUserId) {
          setMessagesPerUser((prev) => {
            const updatedMessages = [
              ...(prev[selectedUserId!] || []),
              messageData,
            ];
            return {
              ...prev,
              [selectedUserId!]: uniqBy(updatedMessages, '_id'),
            };
          });
          await axios.put(`/messages/${messageData._id}/markAsRead`);
        } else {
          handleUnreadMessage(messageData);
        }
      }
    } catch (e) {
      console.error("Error processing incoming WebSocket message", e);
    }
  }

  function showOnlinePeople(peopleArray: User[]) {
    const onlinePeopleObj: Record<string, { username: string; _id: string }> = {};
    const uniqueUsers: User[] = uniqBy(peopleArray, 'userId');
    uniqueUsers.forEach(({ userId, username }) => {
      onlinePeopleObj[userId] = { username, _id: userId };
    });
    setOnlinePeople(onlinePeopleObj);
    const updatedOfflinePeople = { ...totalPeopleRef.current };
    uniqueUsers.forEach(({ userId }) => {
      delete updatedOfflinePeople[userId];
    });
    setOfflinePeople(updatedOfflinePeople);
  }

  function handleUnreadMessage(messageData: Message) {
    setUnreadMessages((prev) => {
      const updatedUnread = { ...prev };
      if (!updatedUnread[messageData.sender]) {
        updatedUnread[messageData.sender] = [];
      }
      updatedUnread[messageData.sender].push(messageData);
      return updatedUnread;
    });
    showNotification(messageData.sender, messageData.text);
    setTimeout(() => {
      fetchUnreadMessages();
    }, 1000);
  }

  function showNotification(senderId: string, messageText: string) {
    if (Notification.permission === 'granted') {
      new Notification("New message", {
        body: `New message: ${messageText}`,
        icon: 'https://t4.ftcdn.net/jpg/00/98/26/11/360_F_98261159_Po5JS7ds82XaePJIsG1MiEtHRzOeUPNj.jpg'
      });
    }    
    setTimeout(() => {
      toast.info(`New message: ${messageText}`, {
        position: "top-right",
        autoClose: 2000,
        toastId: senderId,
      });
    }, 1);
  }

  function sendMessage(ev?: React.FormEvent<HTMLFormElement>, file?: object) {
    if (ev) ev.preventDefault();
    if (!newMessageText.trim() && !file) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageData = {
        recipient: selectedUserId,
        sender: id,
        text: newMessageText,
        file,
      };
      ws.send(JSON.stringify(messageData));
    } else {
      console.warn('WebSocket connection is not open yet. Message not sent.');
    }

    if (file) {
      axios.get(`/messages/${selectedUserId}`).then((res) => {
        setMessagesPerUser((prev: any) => ({
          ...prev,
          [selectedUserId!]: uniqBy(res.data, '_id'),
        }));
      });
    } else {
      setMessagesPerUser((prev) => {
        const updatedMessages = [
          ...(prev[selectedUserId!] || []),
          {
            text: newMessageText,
            sender: id!,
            recipient: selectedUserId!,
            _id: Date.now().toString(),
          },
        ];
        return {
          ...prev,
          [selectedUserId!]: uniqBy(updatedMessages, '_id'),
        };
      });
      setNewMessageText('');
    }
  }

  function sendFile(ev: any) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      sendMessage(undefined, {
        name: file.name,
        data: reader.result,
      });
    };
  }

  const refreshMessages = () => {
    if (selectedUserId) {
      axios.get(`/messages/${selectedUserId}`).then((res) => {
        setMessagesPerUser((prev: any) => ({
          ...prev,
          [selectedUserId!]: uniqBy(res.data, '_id'),
        }));
        toast.success("Messages updated", { autoClose: 1000 });
      }).catch(err => {
        console.error(err);
      });
    }
  };

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messagesPerUser[selectedUserId!]]);

  useEffect(() => {
    axios.get('/people').then((res) => {
      const offlinePeopleArr = res.data
        .filter((p: User) => p._id !== id)
        .filter((p: User) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeopleMap: Record<string, User> = {};
      offlinePeopleArr.forEach((p: User) => {
        offlinePeopleMap[p._id] = p;
      });
      totalPeopleRef.current = offlinePeopleMap;
      setOfflinePeople(offlinePeopleMap);
    });
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      axios
        .get(`/messages/${selectedUserId}`)
        .then((res) => {
          setMessagesPerUser((prev: any) => ({
            ...prev,
            [selectedUserId!]: uniqBy(res.data, '_id'),
          }));

          const unread = res.data.filter(
            (message: Message) =>
              !message.read && message.sender === selectedUserId,
          );
          const markAsReadPromises = unread.map((message: Message) =>
            axios.put(`/messages/${message._id}/markAsRead`),
          );

          Promise.all(markAsReadPromises)
            .then(() => {
              // Read status updated
            })
            .catch((error) => {
              console.error('Error marking messages as read:', error);
            });

          setUnreadMessages((prev) => {
            const newUnread = { ...prev };
            delete newUnread[selectedUserId!];
            return newUnread;
          });
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
        });
    }
    setTimeout(() => {
      fetchUnreadMessages();
    }, 1000);
  }, [selectedUserId]);

  // Combined and filtered people list
  const onlineUserIds = Object.keys(onlinePeople).filter((userId) => userId !== id);
  const offlineUserIds = Object.keys(offlinePeople);

  const filteredOnlineUsers = onlineUserIds.filter((userId) =>
    onlinePeople[userId]?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredOfflineUsers = offlineUserIds.filter((userId) =>
    offlinePeople[userId]?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserInfo = selectedUserId
    ? onlinePeople[selectedUserId] || offlinePeople[selectedUserId]
    : null;
  const isSelectedUserOnline = selectedUserId ? onlineUserIds.includes(selectedUserId) : false;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col md:flex-row h-[calc(100vh-210px)] min-h-[580px]">
      {/* Left Contacts Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200/80 bg-white shrink-0">
        <Logo />

        {/* Search Contact Bar */}
        <div className="p-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <MdSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <MdClose className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Online / All Filter Pills */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              All ({onlineUserIds.length + offlineUserIds.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('online')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterMode === 'online'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Online ({onlineUserIds.length})</span>
            </button>
          </div>
        </div>

        {/* Contacts List Container */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100/60 no-scrollbar">
          {/* Online Users */}
          {filteredOnlineUsers.map((userId) => (
            <Contact
              key={userId}
              id={userId}
              username={onlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
              online={true}
              unreadMessages={unreadMessages[userId]?.length || 0}
            />
          ))}

          {/* Offline Users */}
          {filterMode === 'all' && filteredOfflineUsers.map((userId) => (
            <Contact
              key={userId}
              id={userId}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
              online={false}
              unreadMessages={unreadMessages[userId]?.length || 0}
            />
          ))}

          {filteredOnlineUsers.length === 0 && (filterMode === 'online' || filteredOfflineUsers.length === 0) && (
            <div className="py-12 px-4 text-center text-slate-400">
              <MdPeopleOutline className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">No contacts found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Messaging Area */}
      <div className="flex flex-col flex-1 bg-slate-50/50 relative overflow-hidden">
        {!selectedUserId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-3xl mb-4 shadow-xs">
              <MdChat />
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              Select a conversation to start chatting
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Choose a team member from the left sidebar to view message history, exchange real-time updates and share attachments.
            </p>
          </div>
        ) : (
          <>
            {/* Conversation Header */}
            <div className="px-5 py-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-3">
                <Avatar
                  online={isSelectedUserOnline}
                  username={selectedUserInfo?.username}
                  userId={selectedUserId}
                  size="md"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {selectedUserInfo?.username || 'Team Member'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${isSelectedUserOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className={`text-xs font-medium ${isSelectedUserOnline ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                      {isSelectedUserOnline ? 'Active Now' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={refreshMessages}
                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
                  title="Refresh Conversation"
                >
                  <MdRefresh className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
              {(!messagesPerUser[selectedUserId] || messagesPerUser[selectedUserId].length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl mb-2">
                    <MdChat />
                  </div>
                  <p className="text-xs font-bold text-slate-600">No messages yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Send a message below to start the conversation!</p>
                </div>
              ) : (
                messagesPerUser[selectedUserId]?.map((message: Message) => {
                  const isSelf = message.sender === id;
                  return (
                    <div
                      key={message._id}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                          isSelf
                            ? 'bg-primary text-white rounded-tr-xs shadow-primary/10'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        }`}
                      >
                        {message.text && <div>{message.text}</div>}
                        {message.file && (
                          <div className={`mt-2 pt-2 border-t ${isSelf ? 'border-white/20' : 'border-slate-100'}`}>
                            <a
                              target="_blank"
                              rel="noreferrer"
                              className={`inline-flex items-center gap-1.5 text-xs font-bold underline transition-opacity hover:opacity-80 ${
                                isSelf ? 'text-white' : 'text-primary'
                              }`}
                              href={`${imageUrl}/uploads/${message.file}`}
                            >
                              <MdInsertDriveFile className="text-sm" />
                              <span className="truncate max-w-[200px]">{message.file}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={divUnderMessages} />
            </div>

            {/* Message Input Footer */}
            <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2.5 shrink-0">
              <label
                className="p-2.5 rounded-xl border border-slate-200 hover:border-primary/40 hover:bg-primary/5 text-slate-500 hover:text-primary transition-all cursor-pointer shrink-0"
                title="Attach Document or Image"
              >
                <input type="file" className="hidden" onChange={sendFile} />
                <MdAttachFile className="w-5 h-5" />
              </label>

              <input
                type="text"
                value={newMessageText}
                onChange={(ev) => setNewMessageText(ev.target.value)}
                placeholder="Type a message here..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />

              <button
                type="submit"
                disabled={!newMessageText.trim()}
                className="px-5 py-2.5 bg-primary hover:bg-opacity-90 disabled:opacity-40 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm shadow-primary/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <MdSend className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

