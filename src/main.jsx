import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Historias from './Historias.jsx'

import Connectors from '../Connectors.jsx'
import Ports from '../Ports.jsx'
import DrawLinks from './DrawLinks.jsx'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DrawLinks />
  </React.StrictMode>,
)
