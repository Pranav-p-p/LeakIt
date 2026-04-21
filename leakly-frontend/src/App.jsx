import { useState } from 'react';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';
import ChatPage from './ChatPage';

function App() {
  const [user, setUser] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(null);

  const handleLogin = (data) => {
    setUser(data);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentGroup(null);
  };

  const handleEnterChat = (group) => {
    setCurrentGroup(group);
  };

  const handleBackToDashboard = () => {
    setCurrentGroup(null);
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  if (currentGroup) {
    return (
      <ChatPage
        group={currentGroup}
        onBack={handleBackToDashboard}
        myToken={user.senderToken}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onEnterChat={handleEnterChat}
    />
  );
}

export default App;