[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/suhcjUE-)
# Exam #317641: "CMSmall"
## Student: s317641 BUSSOLINO FEDERICO 

## React Client Application Routes

- Route `/`: NOT LOGGED IN: list of already published pages sorted by publish date (only front-office), LOGGED IN: switch between front-office and back-office through button, front-office: same content of not logged in page, back-office: all pages sorted by id (explanation in code) with add/delete/modify buttons.
All pages displayed through a list of PageLine components.
- Route `/add`: FORM to add a new page use ModForm component, accessible only if logged in
- Route `/edit/:pageid`: FORM to edit a page use ModForm component, accessible only if logged in, superuser has additional field to modify the author, PARAMS: page id of the page to modify
- Route `/login`: LOGIN FORM, as provided in week 13 code 

## API Server

### to speed up correction read only description

- {field: "f1", field: "f2"} means an Object{field: "f1", field: "f2"}

- Page(id,title,authorId,authorName,creationDate,publishData,blocks) means an object Page{id: id, title: title, authorId: authorId, authorName: authorName, creationDate: creationDate, publishData: publishData, blocks: blocks}

- Block(type,data) means an object Block{type: type, data: data}

- blocks means a vector of Block(type,data)

- auth means that additionally request generate error 401 if not authenticated user try to call it 


### Authentication

- POST `/api/sessions`
  - body: credentials
  - descriprion: perform login of user
  - response: user in format 
  { id: 6, username: "u6@p.it", name: "John", superuser: 0 } / error in format { message: "Incorrect username and/or password." }

- DELETE `/api/sessions/current`
  - description: perform logout of user

- GET `/api/sessions/current`
  - description: return current logged in user information
  - response: user in format { id: 6, username: "u6@p.it", name: "John", superuser: 0 } / error in format { error: 'Not authenticated' }

### List Users

- GET `/api/users`
  - description: return complete list of users
  - auth (+ check superuser)
  - response: [{id: 6, name: "John"}, {id: 3, name: "Alice"}, ...] / error in format {error: 'message'} (status 500/401)

### Pages

- GET `/api/pages`
  - description: return all pages to display on front-office, sorted by date ascending
  - response: [Page (1,"Cucina",1,"Enrico","2023-03-06","2023-04-07",blocks),Page (2,"CucinaCreativa",5,"2023-04-06","2023-05-07",blocks),...] / error in format {error: 'message'} (status 500)

- GET `/api/pages/login`
  - description: return all pages to display on back-office, sorted by date ascending
  - auth
  - response: [Page (1,"Cucina",1,"Enrico","2023-03-06","2023-04-07",blocks),Page (2,"CucinaCreativa",5,"2023-04-06","2023-05-07",blocks),...] / error in format {error: 'message'} (status 500)

- PUT `/api/pages/:id`
  - description: update the page number id with the value passed in body of the request
  - auth (+ superuser to change author, or a not owned page)
  - body: {title: "Titolo", authorId: 1, publishDate: "2024-05-15",blocks: blocks}
  - params: id of the page to modify
  - response: 1 / error in format {error: 'message'} (status 503/422/404/401)

- POST `/api/pages`
  - description: insert new page (info passed in body) into database
  - auth 
  - body: {title: "Titolo", publishDate: "2024-05-15",blocks: blocks}
  - response: 1 / error in format {error: 'message'} (status 503/422)

- DELETE `/api/pages/:id`
  - description: delete the page number id
  - auth (+ superuser to delete a not owned page)
  - params: id of the page to delete
  - response: 1 / error in format {error: 'message'} (status 503/404/401)

### Image URLs 

- GET `/api/images`
  - description: get all the image URLs
  - auth 
  - respose: {imageURLs: ["URL1", "URL2", ...]}

### Sitename
   
- GET `/api/sitename`
  - description: return sitename
  - response: { sitename: "CMSmall" } / error in format {error: 'message'} (status 500)

- PUT `/api/sitename`
  - description: modify sitename
  - auth (+superuser)
  - body: { sitename: "newSiteName"} 
  - response: 1 / error in format {error: 'message'} (status 503/401)

## Database Tables

- Table `wsname` - contains name (name of website)
- Table `content` - contains pageId, ord, type, paragraph, header, image (block of page information: ord=position of the block in page,3 type of content more flexible)
- Table `page` - contains id, title, author, c_date, p_date (pages information: author=author id, c_date=creation date, p_date=pubblish date) 
- Table `users` - contains id, email, password, name, salt, superuser (password=hash of the password not the actual password)
- Table `images` - contains url (url of the image)

- Table `content` has pageId,ord as primary key, pageId references page.id and image references images.url
- Table `page` has id as primary key and author references users.id
- Table `users` has id as primary key
- Table `images` has directly url as primary key 

- note that to activate external key I used db.run("PRAGMA foreign_keys=ON ",...) 
## Main React Components

- `App` (in `App.jsx`): show the Navbar and different Components based on the current Route, its States are a page list (complete or incomplete based on authentication), authentication states, states ragarding retrive of information (ready, dirty, dbErrorMsg) and a flag to switch between front-office and back-office, it use a useEffect to switch PageList based on login state and to display temporary states. Contains various API calls that when resolve set the states in a consistent way to state of the application (set the background in previous page list).
- `ModForm` ( `ModForm.jsx`): a form that function both to add a page and to update it, based on the (facultative) passage of props modPage, in addition to the states that contains initial value of the form (retrived by params and listPages). There are states related to URLs to retrive (retrive at each re-render of the ModForm and on dismiss of an error message Alert) and an effect to show the result of API call to get the images, is defined an handleSubmit function and additionally to the normal control of the form there is a component (ListMod) that allow the update of state "content" (blocks).
- `ListMod` ( `ModForm.jsx`): the list of form components that controls the blocks (variable number, can be re-ordered), based on the type of block it returns a textbox area form control or an image selector (ImgButtonGroup), his blocks are mapped from props.content (add function is in parent component and push an empty block), here a function is passed to all components of the different type of block to change block.data, other 2 props are used to update the state of retrival of the URLs from db. A series of button that performs ordering and deleting operations are enclosed to BlockOpButtons which appear at the end of each block input area.
- `ImgButtonGroup` ( `ModForm.jsx`): create, with a mapping buttons containing a miniature of the image to add (img src="url"), each button on click change the state of block list via the props setCurrElement defined in ListMod.
- `BlockOpButtons` ( `ModForm.jsx`): define function that allow ordering elements and deleting them directly via the props setContent,these function are the callbacks called by their respective buttons.
- `SelectAuthor` (`ModForm.jsx`): a dropdown menu with an effect to display an error message if users can't be retived, on dismiss of the errorMsg API call will be re-sended.
- `PagesRoute` (`PagesRoute.jsx`): the component of the main route that displays a list of pages, in an order and with a filter depending on being in front-office or back-office, a button to switch between front and back office, mapping to PageLine components of the pageList passed via props.
- `PageLine` (`PagesRoute.jsx`): show properties of the page, header font is bigger then paragraph font, page in programmed state show publish date in green, published page show publish date in grey, and page witch date is to define doesn't show the date "da definire" instead is written in yellow, button to edit and delete and add(end of page) are shown only in back-office and are enabled only for user with authorization to perform the operation.
- `MyNavbar` (`MyNavbar.jsx`): a navbar that displays site name, login button (bring to /login) and, for superusers, a form that allows to change site name: a state keeps a temporary modified sitename, newSiteName, an effect on change of open/close form set newSiteName to props.siteName, on submit the API that store the site name is called, the actual sitename is retrived and used only here.
- `NotFoundPage` (`NotFoundPage.jsx`): a page that redirects to '/' route, the one seen in exam theme
- `LoginForm` (`AuthComponents.jsx`): a page to perform login, the one seen in last example (aw1-weeks/week13) 


## Screenshot
- screenshot of all pages route (switch button, add button nd navbar aren't shown)
![Screenshot](./img/all_pages.jpg)
- screenshot of add page route (content textarea and image selector aren't shown)
![Screenshot](./img/add_no_content.jpg)

## Users Credentials

- su1@p.it, pwd (amministratore)
- su2@p.it, pwd (amministratore)
- u3@p.it, pwd
- u4@p.it, pwd
- u5@p.it, pwd

