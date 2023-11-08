import { Navbar, Nav, Button, Container, Form, Row, Col, Alert } from 'react-bootstrap';
import { RiPagesLine } from 'react-icons/ri';
import { BsPersonCircle, BsPencilSquare } from 'react-icons/bs';
import { TbHexagonLetterS } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../API.jsx';

"use strict";

function MyNavbar(props) {

  const name = props.user && props.user.name;
  //if props.user defined -> assign to 2nd expr
  const navigate = useNavigate();

  const [openForm, setOpenForm] = useState(false);
  //const [ready, setReady] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [newSiteName, setNewSiteName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const getSiteName = async () => { //needed to use it both in update and in useEffect
    API.getSiteName()
      .then(retval => {
        setSiteName(retval.sitename);
        setNewSiteName(retval.sitename);
      })
      .catch(err => {
        setErrorMsg(err.error);
      })
  };

  useEffect(() => {
    if(openForm) //when I reopen the form I want that precompiled field is consistent with siteName
      setNewSiteName(siteName);
  }, [openForm]);

  useEffect(()=>{
    if(errorMsg==='')//at first render + on dismiss
      getSiteName();
  },[errorMsg])

  const updateSiteName = async (newName) => {
    API.updateSiteName(newName)
      .then(() => {
        getSiteName();//then get again after update (no dirty + use effect since )
      })
      .catch(err => {
        setErrorMsg(err.error);
      })
  };

  function closeForm() {
    setOpenForm(false);
  }

  function handleSubmit(event) {

    event.preventDefault();

    //if (newSiteName === '')
    //  setErrorMsg('Nome sito non valido');
    //else {
      updateSiteName(newSiteName);
      closeForm();
      setErrorMsg('');
    //}
  }

  return (
    errorMsg?
    <Alert variant='danger' onClose={() => {setErrorMsg('');}} dismissible>{errorMsg+" -> close to retry"}</Alert> :
    <Navbar bg="primary" variant="primary" >
      <Container fluid>

        <Navbar.Brand style={{ color: "white" }}>

          <RiPagesLine className="navbarItem brand" />

          {siteName}

          {
            /**mx = margin x direction */
            props.isSuperuser ?
              <Button variant="primary" className="mx-2" onClick={() => setOpenForm(true)}>
                <BsPencilSquare />
              </Button> :
              <></>
          }

        </Navbar.Brand>

        {
          openForm ?
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Row>
                  <Col>
                    <Form.Control type="text" value={newSiteName} onChange={ev => setNewSiteName(ev.target.value)} />
                  </Col>
                  <Col lg="2">
                    <Button type="submit" variant="success">Submit</Button>
                  </Col>
                  <Col lg="2">
                    <Button variant="danger" onClick={() => closeForm()}>Cancel</Button>{/** this only close form, to close also on logout */}
                  </Col>
                </Row>
              </Form.Group>
            </Form> :
            <></>
          /**lg= num columns on large devices */
        }

        <Nav className="justify-content-end">
          <Nav.Item >
            {
              name ?
                <>
                  <Navbar.Text className="fs-5" style={{ color: "white" }}>
                    {"Logged in as: " + name /**fs = font-size */}
                  </Navbar.Text>
                  {
                    props.isSuperuser ?
                      <TbHexagonLetterS size={32} color='white' className='mx-2' /> :
                      <></>
                  }
                  <Button className='mx-3' variant='danger' onClick={() => { props.handleLogout(); navigate("/"); closeForm(); }}>Logout</Button>
                  {/** just reset states in App component and in  Navbar, 
                   * than navigate will make disappear components like opened form 
                   * setting state to reset for next re-enter 
                   * -> reset because the component is rendered like the first time */}
                </> :

                <Button onClick={() => navigate('/login')} style={{ padding: 0 }} className="rounded-circle">
                  <BsPersonCircle className="navbarItem" />
                </Button>
            }
          </Nav.Item>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;