import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Camera from './pages/Camera'
import Result from './pages/Result'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Login from './pages/Login'

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/camera" element={<Camera />} />
                <Route path="/result" element={<Result />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/login" element={<Login />} />
            </Route>
        </Routes>
    )
}

export default App
