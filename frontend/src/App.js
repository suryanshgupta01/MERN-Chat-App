import { Button, ButtonGroup } from '@chakra-ui/react'
import { Route, BrowserRouter } from 'react-router-dom';
import Homepage from './pages/Homepage'
import Chatpage from './pages/Chatpage'

function App() {
  const userinfo = JSON.parse(localStorage.getItem('userinfo'))
  // console.log(userinfo)
  return (
    <BrowserRouter>
      <Route path='/' component={!userinfo ? Homepage : Chatpage} exact />
      <Route path='/chats' component={userinfo ? Chatpage : Homepage} exact />
    </BrowserRouter>
  );
}

export default App;
