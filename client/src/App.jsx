import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import { Row, Alert } from 'react-bootstrap';
//import AddForm from './components/AddForm';
//import EditForm from './components/EditForm';
import MyNavbar from './components/MyNavbar';
import PagesRoute from './components/PagesRoute';
import ModForm from './components/ModForm';
import LoginForm from './components/AuthComponents';
import './App.css';
import API from './API.jsx';
import NotFoundPage from './components/NotFoundPage'

"use strict";

dayjs().format('L LT');

function App() {

  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [dbErrorMsg, setDbErrorMsg] = useState('');
  //for simplicity on dismiss I don't make the API call again --> just show error and invite user to reload 
  //elsewhee I must have a state for each query (1 for each CRUD operation -> 4)

  const [pagesList, setPagesList] = useState([]);
  //const [siteName, setSiteName] = useState('');

  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  //loggedIn and isSuperuser are redundant but allow simpler code 
  //(ex. instead of props.user || props.user.superuser i can write props.isSuperuser)

  const [showFront, setShowFront] = useState(true);

  const navigate = useNavigate();
  function closeForm() {
    navigate(-1);
  }
  //Run twice in dev mode @ first render
  //https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react
  useEffect(() => { //i am always at first render of App-> useEffect always executed twice
    if (dirty || !ready) {
      console.log("ensure effect execute");
      //!ready in || with other condition ensure that at first render the get is executed, is setAlso by dismiss and change of log state
      if (!loggedIn) {
        API.getAllPages()
          .then((pagesList) => {
            setPagesList(pagesList);
            setDirty(false);
            setReady(true);
            //setDbErrorMsg('');
          })
          .catch(err => setDbErrorMsg(err.error)
          );
      }
      else {
        API.getAllPagesLogin()
          .then((pagesList) => {
            setPagesList(pagesList);
            setDirty(false);
            setReady(true);
            //setDbErrorMsg('');
          })
          .catch(err => setDbErrorMsg(err.error)
          );
      }
    }
  }, [dirty, loggedIn, dbErrorMsg]); 
  //dbErrorMsg is needed since if i dismiss ready is set to false 
  //but if the state is already at false, I will miss the set
  //loggedIn also is needed for the same reason: if i fail to login/logout i 
  //must retry but if ready is already set to false when login/logout I can't

  /*********************************************************API CALL to modify/update/delete pages **********************/
  const addPage = (newPage) => {
    setPagesList((pagesList) => {
      const newTempId = Math.max(...pagesList.map((page) => page.id)) + 1; //id update is only local (temporary), from solution las lab
      newPage.id = newTempId;
      newPage.status = 'added';
      return [...pagesList, newPage];
    });
    API.addPage(newPage)
      .then(() => {
        closeForm();
        setDirty(true);
      })//useEffect will retrive up to date information
      .catch((err) => setDbErrorMsg(err.error));
  };

  const updatePage = (newPage) => {
    setPagesList((pagesList) =>
      pagesList.map((page) => {
        return (newPage.id === page.id) ? Object.assign({}, newPage, { status: 'updated' }) : page;
      }));
    API.updatePage(newPage)
      .then(() => {
        closeForm();
        setDirty(true);
      })//useEffect will retrive up to date information
      .catch((err) => setDbErrorMsg(err.error));
  };

  const deletePage = (id) => {
    setPagesList((pagesList) =>
      pagesList.map((page) => page.id === id ? Object.assign({}, page, { status: 'deleted' }) : page)
    );
    API.deletePage(id)
      .then(() => setDirty(true))//useEffect will retrive up to date information
      .catch((err) => setDbErrorMsg(err.error));
  };

  /*************************** change site name on first rendering of Navbar ************************************/
  /*
  //moved to MyNavbar
  const getSiteName = async () => { //needed to use it both in update and in useEffect
    API.getSiteName()
      .then(retval => {
        setSiteName(retval.sitename);
      })
      .catch(err => {
        setDbErrorMsg(err.error);
        //error on a GET API (or api that involves SELECT query) theorically must have a dismiss button on alert that re-query the database
        //and so they may be use an effect
        //if information retrived are necessary to the correct functionalities of the site
        //in this case the only disadvantage is that on modify form the superuser cannot have a precompiled form
        //-> no useState
      })
  };

  useEffect(() => {
    getSiteName();
  }, []);//at first render, avoid calling at each re-render of App

  const updateSiteName = async (newName) => {
    API.updateSiteName(newName)
      .then(retval => {
        getSiteName();//then get again after update (no dirty + use effect since )
      })
      .catch(err => {
        setDbErrorMsg(err.error);
      })
  };
  */
  /*************************** user functionalities *************************************************************/
  const loginSuccessful = (usr) => {
    try {
      setUser(usr);
      setLoggedIn(true);
      if (usr.superuser === 1) {
        setIsSuperuser(true);
      }
      setReady(false);//need an update of available pages
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setPagesList([]);
    setUser(null);
    setShowFront(true);
    setIsSuperuser(false);
    setLoggedIn(false);
    setReady(false);//need an update of available pages
  };

  const toggleView = (showFront) => {//call it with callback !!!
    setShowFront(!showFront)
  };

  /***************************************PAGE ******************************************************************/
  return (
    <BrowserRouter>


      <MyNavbar
        user={user} handleLogout={handleLogout} isSuperuser={isSuperuser}
      //siteName={siteName} 
      //updateSiteName={updateSiteName}
      />

      <Routes>
        
          <Route path="/" element={
            
            dbErrorMsg ?
              <Alert variant='danger' onClose={() => { setDbErrorMsg(''); setReady(false); }} dismissible>
                {dbErrorMsg + "\n CREATE/UPDATE/DELETE are lost, you can retry READ by dismissing this alert"}
              </Alert> :
              <PagesRoute
                ready={ready}
                pagesList={pagesList}
                showFront={showFront} toggleView={toggleView}
                user={user} loggedIn={loggedIn} isSuperuser={isSuperuser} handleLogout={handleLogout}
                deletePage={deletePage}
              />
          }
          />

        <Route path="/add" element={
          loggedIn ?
            <ModForm
              addPage={addPage}
              user={user} handleLogout={handleLogout}
            /> :
            <NotFoundPage />
        }
        />

        <Route path="/edit/:pageid" element={
          loggedIn ?
            <ModForm
              updatePage={updatePage}
              pagesList={pagesList}
              user={user} isSuperuser={isSuperuser} handleLogout={handleLogout}//only in modify can change the author
            /> :
            <NotFoundPage />
        }
        />

        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm loginSuccessful={loginSuccessful} />} />

        <Route path="*" element={<NotFoundPage />} />

      </Routes>
      <Row style={{ paddingBottom: 100 }}>{""}</Row> {/*just to add a padding to bottom of site*/ }


    </BrowserRouter >
  );
}

export default App
