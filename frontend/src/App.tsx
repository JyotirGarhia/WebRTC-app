import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import RoomPage  from './pages/RoomPage.tsx'
import PreJoinPage from './pages/PreJoinPage.tsx'
function App() {

  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/prejoin" element={<PreJoinPage />} />
          <Route path="/room" element={<RoomPage />} />
        </Routes>
      </BrowserRouter>
    </div>

  )
}

export default App
