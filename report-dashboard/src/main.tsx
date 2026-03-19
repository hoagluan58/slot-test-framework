import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Overview from './pages/Overview'
import RunDetail from './pages/RunDetail'
import BugList from './pages/BugList'
import MatrixView from './pages/MatrixView'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Overview />} />
          <Route path="run/:runId" element={<RunDetail />} />
          <Route path="bugs" element={<BugList />} />
          <Route path="matrix" element={<MatrixView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
