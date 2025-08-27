import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignInPage from './pages/Auth/signing'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SignUp from './pages/Auth/signup'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </Router>
  )

}

export default App
