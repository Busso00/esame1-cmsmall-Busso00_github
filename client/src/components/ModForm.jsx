import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Col, Row, Button, Form, Alert, ListGroup, ListGroupItem, ButtonGroup, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../API.jsx';

"use strict";

/** common data structure */
function Page(id, title, authorId, authorName, creationDate, publishDate, blocks) {
  this.id = id;
  this.title = title;
  this.authorId = authorId;
  this.authorName = authorName;
  this.creationDate = dayjs(creationDate);
  this.publishDate = dayjs(publishDate);
  this.blocks = blocks;
}

function Block(type, data) {
  this.type = type;
  this.data = data;
}



function SelectAuthor(props) {
  // original (or already set on client) authorId (props.authorId), function to set authorId (props.setAuthorId), function to set author name, display purpose (props.setAuthorName)  

  //not defined in ModForm since is useful only if user is a superuser trying to modify page + on dismiss
  //Run twice in dev mode @ first render
  //https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react
  const [usersList, setUsersList] = useState([]);
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if(authErrorMsg===''){
      setReady(false); //at each retry set ready to false
      API.getAllUsers()
        .then((usersList) => {
          setUsersList(usersList);
          setReady(true);
          //i don't use ready state + effect since i assume that time passing between user clicking on dropdown menu is higher than 
          //response time (so if I don't get a response there is probably an error)
        })
        .catch(err => setAuthErrorMsg(err.error));
    }
  }, [authErrorMsg]); //on dismiss retry

  return <>
    {
      authErrorMsg ?
        <Alert variant='danger' onClose={() => setAuthErrorMsg('')} dismissible>{authErrorMsg + " -> close to retry"}</Alert> :
        <>
          {ready ?
            <Form.Select
              value={props.authorId/**value to submit is the one contained in props, updated in onChange callback */}
              onChange={(ev) => props.setAuthorId(parseInt(ev.target.value))}> {/**value generated is user.id (value) of selected option */}
              {
                usersList.map((user) =>
                  <option key={user.id} value={user.id} onClick={() => props.setAuthorName(user.name)}>{user.name}</option>
                )
              }
            </Form.Select> :
            <Row>
              <Spinner animation="border" variant="primary" />
            </Row>
          }
        </>
    }
  </>;
}



function ImgButtonGroup(props) { // URLs (props.URLs), nBlock (props.nBlock), setCurrElement to set the content on nBlock block (props.setCurrElement)

  const imageButtons = props.URLs.map((url, imageN) => {
    return (
      <Button onClick={() => props.setCurrElement(props.nBlock, url)} key={imageN} variant="light">
        <img src={url} style={{ maxHeight: 40 }} />
      </Button>
    );
  });


  return (
    <div style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 20 }}>
      <ButtonGroup className='custom-button-group' style={{ display: 'inline-block' }}>
        {imageButtons}
      </ButtonGroup>
    </div>
  );
}



function BlockOpButtons(props) { //need access to index of block to modify (props.nBlock) , old content (props.content), setContent function (props.setContent)

  const i = props.nBlock;

  function moveDown(i) {
    if (i < (props.content.length - 1)) {
      const newContent = [...props.content];
      const temp = newContent[i + 1];
      newContent[i + 1] = newContent[i];
      newContent[i] = temp;
      props.setContent(newContent);
    }
  }

  function moveUp(i) {
    if (i > 0) {
      const newContent = [...props.content];
      const temp = newContent[i - 1];
      newContent[i - 1] = newContent[i];
      newContent[i] = temp;
      props.setContent(newContent);
    }
  }

  function removeBlock(i) {
    const newContent = [...props.content];
    newContent.splice(i, 1);
    props.setContent(newContent);
  }


  return (
    <>
      {
        i == 0 ?
          <></> :
          <Button onClick={() => moveUp(i)} className="rounded-circle" variant="outline-primary" size="sm">↑</Button>
      }
      {
        i == (props.content.length - 1) ?
          <></> :
          <Button onClick={() => moveDown(i)} className="rounded-circle" size="sm" variant="outline-primary">↓</Button>
      }
      <Button onClick={() => removeBlock(i)} className="rounded-circle" size="sm" variant="danger" style={{ paddingLeft: 9.45, paddingRight: 9.45 }}>X</Button>
    </>
  );
}



function ListMod(props) { //content Array of Blocks (props.content), setContent (props.setContent), URLs to pass to ImgButtonGroup (props.URLs)

  function setCurrElement(i, value) {//set value of element returning a new Array of contents 
    const newContent = [...props.content];
    newContent[i].data = value;
    props.setContent(newContent);
  }

  const pagesMod = props.content.map((el, i) => {
    
    if (el.type === 0) {
      // block of type header
      return (
        <ListGroupItem key={i}>
          <Form.Label>Header</Form.Label>
          <Form.Control value={el.data} onChange={ev => setCurrElement(i, ev.target.value)} as="textarea" style={{ height: 100, marginBottom: 20 }}>{el.data}</Form.Control>
          <BlockOpButtons
            nBlock={i} content={props.content} setContent={props.setContent}
          />
        </ListGroupItem>
      );
    }
    else if (el.type === 1) {
      // block of type paragraph
      return (
        <ListGroupItem key={i}>
          <Form.Label>Paragraph</Form.Label>
          <Form.Control value={el.data} onChange={ev => setCurrElement(i, ev.target.value)} as="textarea" style={{ height: 200, marginBottom: 20 }}>{el.data}</Form.Control>
          <BlockOpButtons
            nBlock={i} content={props.content} setContent={props.setContent}
          />
        </ListGroupItem>
      );
    }
    else if (el.type === 2) {
      // block of type image
      console.log(props.URLs);
      return (
        <ListGroupItem key={i}>
          {
            props.imgErrorMsg ?
              <Alert variant='danger' onClose={() => props.setImgErrorMsg('')} dismissible>{props.imgErrorMsg + " -> close to retry"}</Alert> :
              <>
                <Form.Label>Selected image</Form.Label>
                {
                  props.ready ?
                    <>
                      <Row style={{ paddingLeft: 0, paddingRight: 0, marginBottom: 20 }}> {/**image display element, div with heigh 200 is just to fix the height of the block**/}
                        <div style={{ height: 200, paddingLeft: 0 }}>
                          <img src={el.data} style={{ paddingLeft: 0, paddingRight: 0, maxHeight: 200, maxWidth: 200 }} />
                        </div>
                      </Row>
                      <Row>
                        <ImgButtonGroup
                          URLs={props.URLs} setCurrElement={setCurrElement} nBlock={i}
                        />
                      </Row>
                      <BlockOpButtons
                        nBlock={i} content={props.content} setContent={props.setContent}
                      />
                    </> :
                    <Row>
                      <Spinner animation="border" variant="primary" />
                    </Row>
                }
              </>
          }
        </ListGroupItem>
      );
    }
  });

  return (
    <ListGroup style={{ paddingBottom: 20 }}>
      {pagesMod}
    </ListGroup>);
}



function ModForm(props) {
  /*
  //handled in main
  const navigate = useNavigate();
  function closeForm() {
    navigate(-1);
  }
  */
  //in the case used id is not passed by props-> is undefined
  const id = useParams().pageid ? parseInt(useParams().pageid.replace(":", "")) : props.id;
  const modPage = id ? props.pagesList.find((page) => { return page.id === id; }) : undefined;

  const currUser = props.user;

  //see slide 20 3-03, components and state -> can be taken from props (value assigned at first render)
  const [title, setTitle] = useState(modPage ? modPage.title : '');//check if page is modified else initial title is '' since the form must be controlled
  const [authorId, setAuthorId] = useState(modPage ? modPage.authorId : currUser.id);
  const [authorName, setAuthorName] = useState(modPage ? modPage.authorName : currUser.name);
  const creationDate = modPage ? (modPage.creationDate.format('YYYY-MM-DD')) : dayjs().format('YYYY-MM-DD');// check if page is modified else default creationDate is today -> creationDate can't change (NO useState)
  const [publishDate, setPublishDate] = useState(modPage ? (modPage.publishDate.isValid() ? modPage.publishDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')) : dayjs().format('YYYY-MM-DD'));// check if page is modified else default publishDate date is today, if not defined undefined
  const [content, setContent] = useState(modPage ? modPage.blocks.map((bl)=>Object.assign({},bl)) : []);//modify will be lost

  //author name has to be also a state so update is visible in temporary record
  const [toDefine, setToDefine] = useState(modPage ? (modPage.publishDate.isValid() ? false : true) : true);
  function handleChange(e) {
    const isChecked = e.target.checked;
    setToDefine(isChecked);//decide wether to define / not define publish date
  }

  //load once at render of component + on dismiss
  //Run twice in dev mode @ first render
  //https://stackoverflow.com/questions/72238175/why-useeffect-running-twice-and-how-to-handle-it-well-in-react
  const [ready, setReady] = useState(false);
  const [URLs, setURLs] = useState([]);
  const [imgErrorMsg, setImgErrorMsg] = useState('');

  useEffect(() => {
    if (imgErrorMsg === '') {
      setReady(false); //at each retry set ready to false
      API.getImages()
        .then((imageURLs) => {
          setURLs(imageURLs.imageURLs);
          setReady(true);
        })
        .catch(err => {
          setImgErrorMsg(err.error);
        });
    }
  }, [imgErrorMsg]);//on dismiss retry request


  const [errorMsg, setErrorMsg] = useState('');
  function handleSubmit(event) {

    event.preventDefault();
    //similar to && condition but not false --> if false return undefined instead
    const nBlocksOk = content.find(block => block.type === 0) && content.find(block => block.type === 1 || block.type === 2);

    const blockContentOk = content.every(block => block.data.length > 0);
    
    if (title === '')
      setErrorMsg('Titolo non valido');
    else if (!nBlocksOk)//controllo almeno 1 header e 1 tra paragrafo/immagine
      setErrorMsg('Numero di blocchi non valido');
    else if (!blockContentOk)
      setErrorMsg('Contenuto dei blocchi non valido');
    else {
      if (modPage) {
        //just use Page which is standard format on both client and server
        props.updatePage(new Page(id, title, authorId, authorName, creationDate, toDefine ? null : publishDate, content));
      }
      else {
        //just use Page which is standard format on both client and server
        props.addPage(new Page(id, title, authorId, authorName, creationDate, toDefine ? null : publishDate, content));
      }
      ///closeForm(); //navigate(-1) handled in App.jsx;
      //setErrorMsg(''); //not needed since the form will re-render on re-opening
      //setImgErrorMsg('');
    }
  }


  function addHeader(content) {
    setContent([...content, new Block(0, '')]);
  }

  function addParagraph(content) {
    setContent([...content, new Block(1, '')]);
  }

  function addImage(content) {
    setContent([...content, new Block(2, URLs[0])]);//by default image is set with first URL
  }

  return (
    <Row >
      <Col lg="1"></Col>

      <Col style={{ paddingTop: 50 }}>

        <h1>{modPage ? "Edit Page" : "New Page"}</h1>

        {errorMsg ? <Alert variant="danger" onClose={() => setErrorMsg('')} dismissible>{errorMsg}</Alert> : false}

        <Form onSubmit={handleSubmit}>

          <Form.Group className="my-4" >{/**my set margin y upper, lower to 3 */}
            <Form.Label >Title</Form.Label>
            <Form.Control type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="Title" />
          </Form.Group>

          {
            props.isSuperuser && modPage ? //only superuser in modify page are allowed to change author
              <Form.Group className="my-4" >
                <Form.Label>Author</Form.Label>
                <SelectAuthor
                  authorId={authorId} setAuthorId={setAuthorId} setAuthorName={setAuthorName}
                />
              </Form.Group> :
              <></>
          }

          <Form.Group className="my-4">
            <Form.Label>Publish date</Form.Label>
            <Row>
            <Col className="px-0">
              <Form.Check type="checkbox" label="To define" value={toDefine} checked={toDefine} onChange={ev => handleChange(ev)} />
            </Col>
            <Col>
            <Form.Control type="date" value={publishDate} onChange={ev => setPublishDate(ev.target.value)} format='yyyy-MM-dd'/>
            </Col>
            </Row>
          </Form.Group>

          <Form.Group className="my-4">
            <Form.Label>Content</Form.Label>
            <ListMod
              ready={ready} URLs={URLs}
              content={content} setContent={setContent}
              imgErrorMsg={imgErrorMsg} setImgErrorMsg={setImgErrorMsg}
            />
          </Form.Group>

          <ButtonGroup className="my-4">
            <Button onClick={() => addHeader(content)} variant="success">+ Header</Button>
            <Button onClick={() => addParagraph(content)} variant="success">+ Paragraph</Button>
            <Button onClick={() => addImage(content)} variant="success">+ Image</Button>
          </ButtonGroup>

          <Row >
            <Button type="submit" variant="primary">Submit</Button>
            <Button variant="danger" onClick={closeForm}>Cancel</Button>
          </Row>

        </Form>
      </Col>

      <Col lg="1"></Col>
    </Row>
  );
}

export default ModForm;