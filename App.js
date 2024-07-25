import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Deep from './deep';
import ImageUpload from './upload';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
        { <Route path="/" element={<Deep/>}/> } 
        { <Route path="/" element={<ImageUpload/>}/> }

        </Routes>
      
        
      </BrowserRouter>
    </div> 
  );
}

export default App;
