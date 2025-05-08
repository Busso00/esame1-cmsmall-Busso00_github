import dayjs from 'dayjs';
import { Button, ListGroup, Row, Col, ListGroupItem, Container, Spinner} from 'react-bootstrap';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

"use strict";

function PageLine(props) {

  let statusClass = null;
  const page = props.page;
  const userId = props.user ? (props.user.id || 0) : 0;//0 non matcha con nessun id
  
  const allow = (userId === page.authorId) || props.isSuperuser;

  const blockDisplay = page.blocks.map((block, i) => {
    if (block.type == 0)
      return <h5 key={i}>{block.data}</h5>
    else if (block.type == 1)
      return <p key={i}>{block.data}</p>
    else
      return <Row key={i}><img src={block.data} style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 0, paddingRight: 0 }} /></Row>
  });

  console.log(props.dirty);
  
  switch (props.status) {
    case 'added':
      statusClass = 'bg-success';
      break;
    case 'deleted':
      statusClass = 'bg-danger';
      break;
    case 'updated':
      statusClass = 'bg-warning';
      break;
    default:
      break;
  }

  return (//low bg-opacity for color when update/insert/delete, maxwidth hight to adapt well with low zoom of browser
    <Container className={statusClass + ' bg-opacity-25'} style={{marginLeft: 0, marginRight: 0, maxWidth: 8000}}>

      <h3 style={{color: 'navy'}}>{page.title}</h3>
    
      {blockDisplay /** elements of the page (blocks) **/}

      <Row>

        <Col style={{ paddingLeft: 0, paddingTop: 0, color: 'grey', fontSize: 18 }}>
          {page.authorName}
        </Col>

        <Col style={{ fontSize: 12, color: 'grey', maxWidth: 220}}>
          {"creation date: " + (page.creationDate.isValid() ? page.creationDate.format('YYYY/MM/DD') : "")}
        </Col>

        {
          page.publishDate.isValid() ?
            (
              page.publishDate.isAfter(dayjs()) ?
                <Col style={{ fontSize: 12, color: 'green',  maxWidth: 250 /* state programmed (future)*/ }}>
                  {"publish date: " + page.publishDate.format('YYYY/MM/DD')}
                </Col> :
                <Col style={{ fontSize: 12, color: 'grey',  maxWidth: 250 /* state published*/ }}>
                  {"publish date: " + page.publishDate.format('YYYY/MM/DD')}
                </Col>
            ) :
            <Col style={{ fontSize: 12, color: 'gold', maxWidth: 250 /* state draft */ }}>
              {"publish date: <to define>"}
            </Col>
        }

        <Col lg="1" style={{ paddingTop: 5, paddingLeft: 0, paddingRight: 0, maxWidth: 'fit-content' }} hidden={props.showFront}>

          <Link to={`/edit/:${page.id}`} onClick={(ev) => { //edit button + link to edit page
            if (!allow)
              ev.preventDefault();//prevent navigate to edit page
          }}>
            <Button disabled={!allow} variant="primary">
              <BsPencilSquare />
            </Button>
          </Link>

          <Button variant="danger" disabled={!allow} onClick={() => props.deletePage(page.id)}> {/* delete button */}
            <BsTrash />
          </Button>

        </Col>

      </Row>
    </Container>
  );
}




function PagesRoute(props) {

  const pageDisplayNotOrdered = props.pagesList.filter((page)=>{
    if(props.showFront && ((!page.publishDate.isValid()) || page.publishDate.isAfter(dayjs()))){
      return false;
    }else{
      return true;
    }
  });
    //sort is a detail: since it is not imposed an order in back-office 
    //I order it by id (more strict than creation date) such that when i add a new page 
    //it is the last visualized and i can see it near the add button and notice the fact that it has been added (green->white background)
    //elsewhere at the retrive of updated pages from the server it will be reordered probably go up
    //requiring the user to manually look all pages to know if it has been added

  const pageDisplay = (props.showFront? 
    pageDisplayNotOrdered:
    [...pageDisplayNotOrdered].sort((pa,pb)=>pa.id-pb.id))
    .map((page,i) =>
    <ListGroupItem key={i}>
      <PageLine
        dirty={props.dirty}
        user={props.user} isSuperuser={props.isSuperuser}
        page={page} status={page.status} deletePage={props.deletePage}
        showFront={props.showFront}
      />
    </ListGroupItem>
  );

  return (
    <Row >
      <Col lg="1" style={{paddingRight: 0, width:130}}>
        <Button 
          onClick={()=>props.toggleView(props.showFront)} 
          disabled={!props.loggedIn} 
          variant="info" 
          style={{marginTop: 100, paddingBottom:100}}>
    
          {props.showFront?"Switch to Back-Office":"Switch to Front-Office"}

        </Button>
      </Col>
      <Col style={{ paddingTop: 40}}>

        <h1>All Pages</h1>
        <ListGroup>
          {props.ready ? pageDisplay : <Spinner animation="border" variant="primary" />/**show spinner or pages if ready */}
        </ListGroup>

        {(props.loggedIn && (!props.showFront)) ? //add page button (show only if logged in and in back-office)
          <Link to="/add">
            <div className="d-grid" style={{ paddingTop: 20 }}>
              <Button variant={'primary'} size='lg'>+</Button>
            </div>
          </Link> :
          <></>
        }
      </Col>
      <Col lg="1"></Col>
    </Row>
  );
}


export default PagesRoute;