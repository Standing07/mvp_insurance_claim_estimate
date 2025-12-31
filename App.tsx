
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Policies from './pages/Policies';
import EventInput from './pages/EventInput';
import Estimate from './pages/Estimate';
import Login from './pages/Login';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/event" element={<EventInput />} />
            <Route path="/estimate" element={<Estimate />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageProvider>
  );
};

export default App;
