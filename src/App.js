import './App.css';
import ModelControl from './component/ModelPanel';
import WebIndex from './component/WebIndex';
import ManageSystem from './component/ManageSystem';
import SystemLogin from './component/SystemLogin';
import {Route,Routes,Navigate} from 'react-router-dom'
import Commonlogin from './component/CommonLogin';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route index element={<Navigate replace to='/modelcontrol'/>}/>
        <Route path='modelcontrol' element={<ModelControl/>}/>    
        <Route path='webindex'>
          <Route index element={<Navigate replace to='/webindex/home'/>}/>
          <Route path='home' element={<WebIndex/>}/>
          <Route path='shirtbottom'>
            <Route index element={<Navigate replace to='/webindex/shirtbottom/tshirt'/>} />
            <Route path='tshirt' element={<WebIndex/>}/>
            <Route path='poloshirt' element={<WebIndex/>}/>
            <Route path='sweater_01' element={<WebIndex/>}/>
            <Route path='sweater_02' element={<WebIndex/>}/>
            <Route path='suit' element={<WebIndex/>}/>
            <Route path='others' element={<WebIndex/>}/>
          </Route>
          <Route path='picshop' element={<WebIndex/>}/>
          <Route path='serviceprocedure'>
            <Route index element={<Navigate replace to='/webindex/serviceprocedure/service'/>}/>
            <Route path='service' element={<WebIndex/>}/>
            <Route path='question' element={<WebIndex/>}/>
            <Route path='ensure' element={<WebIndex/>}/>
          </Route>
          <Route path='sketchdetail'>
            <Route index element={<Navigate replace to='/webindex/sketchdetail/knowledge'/>}/>
            <Route path='knowledge' element={<WebIndex/>}/>
            <Route path='technology' element={<WebIndex/>}/>
            {/* <Route path='QA' element={<WebIndex/>}/> */}
          </Route>
          <Route path='selfdetail' element={<WebIndex/>}/>
          <Route path='about' element={<WebIndex/>}/>
        </Route>
        <Route path='managesystem' element={<ManageSystem/>}/>
        <Route path='systemlogin' element={<SystemLogin/>}/>
        <Route path='commonlogin' element={<Commonlogin/>}/>
      </Routes>
    </div>
  );
}

export default App;
