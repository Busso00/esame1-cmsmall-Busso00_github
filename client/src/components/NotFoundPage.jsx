import {Link} from 'react-router-dom';

function NotFoundPage() {
    return <>
      <div style={{"textAlign": "center", "paddingTop": "5rem"}}>
        <h1>
          <i className="bi bi-exclamation-circle-fill"/>
          {" "}
          The page cannot be found
          {" "}
          <i className="bi bi-exclamation-circle-fill"/>
        </h1>
        <br/>
        <p>
          The requested page does not exist, please head back to the <Link to={"/"}>app</Link>.
        </p>
      </div>
    </>;
  }

  export default NotFoundPage;