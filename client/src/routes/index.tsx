import { Route, Routes } from 'react-router-dom';
import HomePage from '@pages/HomePage';
import UploadPage from '@pages/UploadPage';
import SearchPage from '@pages/SearchPage';

const MainRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path='/' element={< HomePage />} />
            <Route path='/upload' element={<UploadPage />} />
            <Route path='/search/:query' element={<SearchPage />} />
        </Routes>
    );
};

export default MainRoutes;
