import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Harvester from './pages/Harvester';
import ApiDocs from './pages/ApiDocs';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="explore" element={<Explore />} />
            <Route path="harvester" element={<Harvester />} />
            <Route path="api-docs" element={<ApiDocs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
