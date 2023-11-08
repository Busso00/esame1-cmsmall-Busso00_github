'use strict';
/* Data Access Object (DAO) module for accessing questions and answers */

const sqlite = require('sqlite3');
const dayjs = require('dayjs');

// open the database
const db = new sqlite.Database('CMS_DB.sqlite', (err) => {
  if (err) throw err;
});

//need to use foreign key 
db.run('PRAGMA foreign_keys = ON', (error) => {
  if (error) {
    console.error('Failed to enable foreign key support:', error);
  } else {
    // Continue with other database operations
  }
});

/**debug configurations **/
const randomDbError = false;

function getRandomInt() {
  if (randomDbError)
    return Math.floor(Math.random() * 1.5); //1 over 3 fails
  else 
    return 0;
}



//*****************************************Data Structures*************************************************************/
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

/**
 * Wrapper around db.all
 */
const dbAllAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

/**
 * Wrapper around db.run
 */
const dbRunAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve(this.changes);
  });
});

/**
 * Wrapper around db.get
 */
const dbGetAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

//******************************************DB Queries Pages****************************************************************/
//--------GET pages -------------------------------------------------------------------------------------------------------- (no authentication)
/**
 * 
 * @returns Promise that resolves in a list of Page objects/ an error
 */
exports.listPages = async () => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  const sql = 'SELECT page.id,title,author,name,c_date,p_date,ord,type,paragraph,header,image FROM page,content,users WHERE page.id = content.pageId AND page.author = users.id ORDER BY page.p_date,page.id,content.ord';
  //need ordering by page.id because if 2 pages have same publish date
  //they can result shuffled because of the ordering by ord


  const rows = await dbAllAsync(db, sql);//can throw error

  const listPages = [];

  rows.forEach((row) => {

    const newBlock = new Block(row.type, '');
    if (row.type === 0) {
      newBlock.data = row.header;
    } else if (row.type === 1) {
      newBlock.data = row.paragraph;
    } else {
      newBlock.data = row.image;
    }

    if ((listPages.length == 0) || (listPages[listPages.length - 1].id != row.id)) {
      //all'inizio oppure se l'ultimo elemento inserito non è della pagina precedente
      //aggiungo la pagina

      listPages.push(
        new Page(
          row.id,
          row.title,
          row.author,
          row.name,
          row.c_date,
          row.p_date,
          [newBlock]
        ));
    } else {
      listPages[listPages.length - 1].blocks.push(newBlock);
    }
  });

  return listPages;
}
//--------------- GET PAGE BY ID ------------------------------------------------------------------------(authentication) used to conrol ownership of page (can be useful)
/**
 * 
 * @param {*} id of the page
 * @returns a Promise that resolves in a Page(the requested) / an error 
 */
exports.getPage = async (id) => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  const sql = 'SELECT page.id,title,author,name,c_date,p_date,ord,type,paragraph,header,image FROM page,content,users WHERE page.id = content.pageId AND page.author = users.id AND page.id=? ORDER BY page.p_date,page.id,content.ord';
  //need ordering by page.id because if 2 pages have same publish date
  //they can result shuffled because of the ordering by ord
  const rows = await dbAllAsync(db, sql, [id]);

  const listPages = [];

  rows.forEach((row) => {

    const newBlock = new Block(row.type, '');
    if (row.type === 0) {
      newBlock.data = row.header;
    } else if (row.type === 1) {
      newBlock.data = row.paragraph;
    } else {
      newBlock.data = row.image;
    }

    if ((listPages.length == 0) || (listPages[listPages.length - 1].id != row.id)) {
      //all'inizio oppure se l'ultimo elemento inserito non è della pagina precedente
      //aggiungo la pagina

      listPages.push(
        new Page(
          row.id,
          row.title,
          row.author,
          row.name,
          row.c_date,
          row.p_date,
          [newBlock]
        ));
    } else {
      listPages[listPages.length - 1].blocks.push(newBlock);
    }

  });

  return listPages[0]; //use the same code but the page can be only 1
}
//---------PUT page (id) ----------------------------------------------------------------------------------------------(authentication)
/**
 * 
 * @param {*} newPage: is a page containing {id: ...,  title: ..., authorId: ..., publishDate: ..., blocks: []}
 * @returns a Promise that resolves to the vector of 1 x n_new_blocks / an error
 */
exports.updatePage = async (newPage) => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  //notice that if 2nd or 3rd sql statement fails we can try a rollback saving preview state and re running db.run()
  //but since it need to be done with db.rnn() database doesn't guarantee that the "application controlled" rollback 
  //can terminate with success -> still doesn't guarantee atomicity

  const sql1 = 'UPDATE page SET title=?,author=?,p_date=DATE(?) WHERE id=?;' //id cannot change, author has an integrity reference check -> if try to insert an inexistent authorId -> error 
  const sql2 = 'DELETE FROM content WHERE pageId=?;';

  //must impose that delete (sql2) is executed before all sql1;
  await Promise.all([
    dbRunAsync(db, sql1, [newPage.title, newPage.authorId, newPage.publishDate || null, newPage.id]),
    dbRunAsync(db, sql2, [newPage.id])]);

  const sql3 = 'INSERT INTO content (pageId, ord, type, paragraph, header, image) VALUES (?, ?, ?, ?, ?, ?); ';

  return Promise.all(
    newPage.blocks.map((block, i) => {//prepare parameters & query

      let paramsV = [];//only need to exist here

      if (block.type == 0)
        paramsV = [newPage.id, i, block.type, null, block.data, null];
      else if (block.type == 1)
        paramsV = [newPage.id, i, block.type, block.data, null, null];
      else if (block.type == 2)
        paramsV = [newPage.id, i, block.type, null, null, block.data];

      //in case of error page can have less blocks than expected

      return dbRunAsync(db, sql3, paramsV);
    }));
}
//---------POST page ------------------------------------------------------------------------------------------------(authentication)
/**
 * 
 * @param {*} newPage is a page containing {title: ..., authorId: ..., publishDate: ..., blocks: []}
 * @returns a Promise that resolves in a vector of [[1 x number of inserted blocks], 1] / a error
 */
exports.addPage = async (newPage) => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  return new Promise((resolve, reject) => {
    const sql1 = 'INSERT INTO page (title,author,c_date,p_date) VALUES (?,?,DATE(?),DATE(?));' //id must be defined by db, date must be current date, author id must be defined server side in index.js

    db.run(sql1, [newPage.title, newPage.authorId, dayjs().format("YYYY-MM-DD"), newPage.publishDate || null], async function (err) {
      if (err) {
        reject(err);
      }
      //no error -> proceed

      const pageId = this.lastID;
      const sql2 = 'INSERT INTO content (pageId, ord, type, paragraph, header, image) VALUES (?, ?, ?, ?, ?, ?); ';
      //if page is not added/selected lastId must be null, so that following insert will fail
      //same as update page

      Promise.all(newPage.blocks.map((block, i) => {//prepare parameters & query

        let paramsV = [];//only need to exist here

        if (block.type == 0)//modify newPage.id to return value of modify 1
          paramsV = [pageId, i, block.type, null, block.data, null];
        else if (block.type == 1)
          paramsV = [pageId, i, block.type, block.data, null, null];
        else if (block.type == 2)
          paramsV = [pageId, i, block.type, null, null, block.data];

        return dbRunAsync(db, sql2, paramsV)
      }))
      .then((res) => resolve(1))
      .catch((err) => reject(err));

    });
  });
}
//----------- DELETE page ---------------------------------------------------------------------------------------------
/**
 * 
 * @param {*} id of the page to delete
 * @returns a vector of 2 elements [1,n_page_deleted] / an error
 */
exports.deletePage = async (id) => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  //first i delete from content (REFERENCE INTEGRITY)
  const sql1 = 'DELETE FROM content WHERE pageId = ?';
  await dbRunAsync(db, sql1, [id]);

  const sql2 = 'DELETE FROM page WHERE id = ?';
  return dbRunAsync(db, sql2, [id]);
}

/************************************************ DB queries images url ***********************************************/
/**
 * 
 * @returns a Promise that resolves in {imageURLs: [] } / an error
 */
exports.getImages = async () => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  const sql = "SELECT * FROM images";
  const rows = await dbAllAsync(db, sql);
  return { imageURLs: rows.map((row) => row.url) };
}

/************************************************ DB queries sitename *************************************************/
//---------GET sitename -----------------------------------------------------------------------------------------------(no authentication)
/**
 * 
 * @returns a Promise that resolves in {sitename: ...} / an error
 */
exports.getSiteName = async () => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  const sql = 'SELECT * FROM wsname';
  const row = await dbGetAsync(db, sql);
  return { sitename: row.name };
}
//---------PUT sitename -----------------------------------------------------------------------------------------------(authentication superuser)
/**
 * 
 * @param {*} newName is the new name of the site
 * @returns a Promise that resolves in 1 / an error
 */
exports.updateSiteName = (newName) => {

  if (getRandomInt()>=1){
    console.log("randomDbError");
    throw new Error("randomDbError");
  }

  const sql = 'UPDATE wsname SET name=? WHERE name IN (SELECT name FROM wsname)';
  return dbRunAsync(db, sql, [newName]);
}