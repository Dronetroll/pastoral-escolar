import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Cronograma from './pages/Cronograma';
import Calendar from './pages/Calendar';
import Baptisms from './pages/Baptisms';
import Collaborators from './pages/Collaborators';
import HealthySchool from './pages/HealthySchool';
import AdventistStudents from './pages/AdventistStudents';
import Communities from './pages/Communities';
import Events from './pages/Events';
import BiblicalClasses from './pages/BiblicalClasses';
import Collections from './pages/Collections';
import Reports from './pages/Reports';
import PastoralCare from './pages/PastoralCare';
import PastoralPlanning from './pages/PastoralPlanning';

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/batismos" element={<Baptisms />} />
            <Route path="/colaboradores" element={<Collaborators />} />
            <Route path="/escola-saudavel" element={<HealthySchool />} />
            <Route path="/alunos-adventistas" element={<AdventistStudents />} />
            <Route path="/comunidades" element={<Communities />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/classes-biblicas" element={<BiblicalClasses />} />
            <Route path="/recoltas" element={<Collections />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/atendimentos-pastorais" element={<PastoralCare />} />
            <Route path="/planejamento-pastoral" element={<PastoralPlanning />} />
            <Route path="/cronograma" element={<Cronograma />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
