
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Policies from './pages/Policies';
import EventInput from './pages/EventInput';
import Estimate from './pages/Estimate';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/event" element={<EventInput />} />
          <Route path="/estimate" element={<Estimate />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
