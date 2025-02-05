import './App.css';
import ModelControl from './component/ModelPanel';
import {Route,Routes,Navigate} from 'react-router-dom'
function App() {
  return (
    <div className="App">
      <Routes>
        <Route index element={<Navigate replace to='/modelcontrol'/>}/>
        <Route path='modelcontrol' element={<ModelControl/>}/>    
      </Routes>
    </div>
  );
}

export default App;
