import { useContext, useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { UserContext } from './UserContext';
import { uniqBy } from 'lodash'; // Use this to ensure unique messages
import axios from 'axios';
import Contact from './Contact';
import { chatApiPath, imageUrl } from '../apiPath';
import { EmailContext } from './EmailProvider/EmailContext';
import { toast } from 'react-toastify';

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
  // axios.defaults.withCredentials = true;
  const token = localStorage.getItem('token');
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlinePeople, setOnlinePeople] = useState<any>({});
  const [offlinePeople, setOfflinePeople] = useState<Record<string, User>>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [messagesPerUser, setMessagesPerUser] = useState<MessagesPerUser>({});
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessages>({});
  const { id, ws ,connectToWs} = useContext(UserContext) as {
    ws: any;
    id: string;
    connectToWs:any;
  };
  const { fetchUnreadMessages } = useContext(EmailContext) as {
    fetchUnreadMessages: () => Promise<void>;
  };

  const divUnderMessages = useRef<HTMLDivElement | null>(null);
  const totalPeopleRef = useRef<Record<string, User>>({});

  useEffect(() => {
    requestNotificationPermission();
    ws.addEventListener('message', handleMessage);
  }, [selectedUserId]);

  useEffect(()=>{
    connectToWs()
  },[])

  function requestNotificationPermission() {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  async function handleMessage(ev: MessageEvent) {
    const messageData = JSON.parse(ev.data);
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
      if (messageData.sender == selectedUserId) {
        // Append only unique messages to the current user
        setMessagesPerUser((prev) => {
          const updatedMessages = [
            ...(prev[selectedUserId!] || []),
            messageData,
          ];
          return {
            ...prev,
            [selectedUserId!]: uniqBy(updatedMessages, '_id'), // Ensure messages are unique
          };
        });
        await axios.put(`/messages/${messageData._id}/markAsRead`);
      } else {
        handleUnreadMessage(messageData);
      }
    }
  }

  function showOnlinePeople(peopleArray: User[]) {
    const onlinePeople: Record<string, { username: string; _id: string }> = {};
    const uniqueUsers = uniqBy(peopleArray, 'userId');
    uniqueUsers.forEach(({ userId, username }) => {
      onlinePeople[userId] = { username, _id: userId };
    });
    setOnlinePeople(onlinePeople);
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
    // let senderName = totalPeopleRef.current[senderId]?.username || offlinePeople[senderId]?.username || 'unknown';
    if (Notification.permission == 'granted') {
      new Notification("New message", {
        body: `New message : ${messageText}`,
        icon: 'https://t4.ftcdn.net/jpg/00/98/26/11/360_F_98261159_Po5JS7ds82XaePJIsG1MiEtHRzOeUPNj.jpg'
      });
    }    
    setTimeout(() => {
      toast.info(`New message : ${messageText}`, {
        position: "top-right",
        autoClose: 2000,
        toastId: senderId,
      });
    }, 1);
  }

  function sendMessage(ev: React.FormEvent<HTMLFormElement>, file?: object) {
    ev.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN) {
      // Check if WebSocket is open
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
    // Your existing code for handling messages
    if (file) {
      axios.get(`/messages/${selectedUserId}`).then((res) => {
        setMessagesPerUser((prev: any) => ({
          ...prev,
          [selectedUserId!]: uniqBy(res.data, '_id'), // Ensure uniqueness after fetching
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
          {
            text: newMessageText,
            sender: id!,
            recipient: selectedUserId!,
            _id: Date.now().toString(),
          },
        ];
        return {
          ...prev,
          [selectedUserId!]: uniqBy(updatedMessages, '_id'), // Ensure uniqueness when sending new message
        };
      });
      setNewMessageText('');
    }
  }

  function sendFile(ev: any) {
    const reader = new FileReader();
    const file = ev.target.files![0];
    reader.readAsDataURL(file);
    reader.onload = () => {
      sendMessage(ev, {
        name: file.name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messagesPerUser[selectedUserId!]]);

  useEffect(() => {
    axios.get('/people').then((res) => {
      const offlinePeopleArr = res.data
        .filter((p: User) => p._id != id)
        .filter((p: User) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople: Record<string, User> = {};
      offlinePeopleArr.forEach((p: User) => {
        offlinePeople[p._id] = p;
      });
      totalPeopleRef.current = offlinePeople;
      setOfflinePeople(offlinePeople);
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

          const unreadMessages = res.data.filter(
            (message: Message) =>
              !message.read && message.sender == selectedUserId,
          );
          const markAsReadPromises = unreadMessages.map((message: Message) =>
            axios.put(`/messages/${message._id}/markAsRead`),
          );

          Promise.all(markAsReadPromises)
            .then((responses) => {
              if (responses) {
                console.log('Messages marked as read:');
              }
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

  return (
    <div className="flex bg-white" style={{ height: 'calc(100vh - 136px)' }}>
      <div className="w-1/4 flex flex-col border border-white shadow h-full">
        <div className="overflow-auto h-full">
          <Logo />
          {Object.keys(onlinePeople).filter((userId) => userId !== id).map((userId) => (
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
          {Object.keys(offlinePeople).map((userId) => (
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
        </div>
      </div>
      <div className="flex flex-col w-3/4 p-2 bg-white border border-gray shadow">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-black text-lg font-medium">
                &larr; Select a person from the Sidebar
              </div>
            </div>
          )}
          {selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-auto absolute top-0 left-0 right-0 bottom-2">
                {messagesPerUser[selectedUserId]?.map((message: Message) => (
                  <div
                    key={message._id}
                    className={
                      message.sender === id ? 'text-right' : 'text-left'
                    }
                  >
                    <div
                      className={`text-left inline-block px-5 py-2 my-1 rounded-md text-lg font-medium ${message.sender === id
                        ? 'bg-sky-700 text-white'
                        : 'bg-success text-white'
                        }`}
                    >
                      {message.text}
                      {message.file && (
                        <div>
                          <a
                            target="_blank"
                            className="flex items-center gap-1 border-b"
                            href={imageUrl + '/uploads/' + message.file}
                          >
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {selectedUserId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              type="text"
              value={newMessageText}
              onChange={(ev) => setNewMessageText(ev.target.value)}
              placeholder="Type your message here"
              className="bg-gray border border-blue outline-none font-medium p-3 flex-grow rounded"
            />
            <label className="p-3 text-gray-600 rounded border border-blue cursor-pointer">
              <input type="file" className="hidden" onChange={sendFile} />
              📁
            </label>
            <button
              type="submit"
              className="bg-sky-900 p-3 font-medium text-white rounded"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>

  );
}
