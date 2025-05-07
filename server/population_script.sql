

CREATE TABLE "wsname"(
		"name" TEXT NOT NULL,
		PRIMARY KEY ("name"));

CREATE TABLE "users" ( 
		"id" INTEGER NOT NULL UNIQUE, 
		"email" TEXT NOT NULL, 
		"password" TEXT NOT NULL, 
		"name" TEXT, 
		"salt" INTEGER NOT NULL, 
		"superuser" INTEGER NOT NULL CHECK(superuser IN (0,1)), 
		PRIMARY KEY("id" AUTOINCREMENT));

CREATE TABLE "page" ( 
		"id" INTEGER NOT NULL UNIQUE, 
		"title" TEXT NOT NULL, 
		"author" INTEGER NOT NULL, 
		"c_date" DATE NOT NULL, 
		"p_date" DATE, 
		PRIMARY KEY("id" AUTOINCREMENT), 
		FOREIGN KEY("author") REFERENCES "users"("id"));/*tested*/


CREATE TABLE "images" (
		"url" TEXT NOT NULL UNIQUE,
		PRIMARY KEY("url"));

/* this bitmap style table was created before I know that image could be saved in a static route
 an approach with only 1 column can limit flexibility, but on the other hand increase memory efficiency
 and impose the constraint of only one "page content" per record  */
CREATE TABLE "content" ( 
		"pageId" INTEGER NOT NULL, 
		"ord" INTEGER NOT NULL, 
		"type" INTEGER NOT NULL CHECK(type IN(0,1,2)), 
		"paragraph" TEXT, 
		"header" TEXT, 
		"image" TEXT, /*originally BLOB*/
		PRIMARY KEY("pageId","ord"), 
		FOREIGN KEY("pageId") REFERENCES "page"("id"),/*this primary key constraint is not tested*/
		FOREIGN KEY("image") REFERENCES "images"("url"));/*tested*/

INSERT INTO wsname (name)
VALUES  ("CMSmall");

/* password="pwd" */
INSERT INTO users (email,password,name,salt,superuser)
VALUES  ("su1@p.it","bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb","Enrico","123348dusd437840",1), /*autore di 0 pagine*/
		("su2@p.it","498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c","Luigi","7732qweydg3sd637",1), /*autore di 2 pagine*/
		("u3@p.it","09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160","Alice","wgb32sge2sh7hse7",0), /*autore di 3 pagine*/
		("u4@p.it","330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8","Harry","safd6523tdwt82et",0), /*autore di 0 pagine*/
		("u5@p.it","bbbcbac88d988bce98cc13e4c9308306d621d9e278ca62aaee2d156f898a41dd","Carol","ad37JHUW38wj2833",0); /*autore di 1 pagina*/
		/*//password="password" 
	    ("u6@p.it","e06a2f2073a3d66d1ca4fd6ce04c64fe684ea19c27660b05e2fbf7269ce9ff42","John","72e4eeb14def3b21",0), 
	    ("u7@p.it","ac28edf49ba34ac83c17145375a030b4579ffddf3fe1dbb68f530bb3ca4ce514","Mario","a8b618c717683608",0),
	    ("u8@p.it","4af3cc8549ccc19af11b711cada4509c4e93c57cca34078c683498ed7bf64258","Testuser","e818f0647b4e1fe0",0);
		*/

INSERT INTO page (title,author,c_date,p_date)
VALUES  ("Cucina",3,"2023-03-06","2023-04-07"), /*pubblicata*/
		("CucinaCreativa",2,"2023-04-06","2023-05-07"), /*pubblicata*/
		("Modellismo",2,"2023-05-06",NULL), /*draft*/
		("Sport",3,"2023-04-08",NULL), /*draft*/
		("Design",3,"2023-05-10","2024-10-11"), /*programmata*/
		("Elettronica",5,"2023-04-10","2024-12-16"); /*programmata*/

INSERT INTO images (url)
VALUES  ("./static/pizza.png"),
		("./static/sport.png"),
		("./static/CSS.png"),
		("./static/ADC.png");

/*from web to test overflow of image selection ButtonGroup
INSERT INTO images (url) 
VALUES  ("https://i0.wp.com/www.giacomocusano.com/wp-content/uploads/2016/07/coastal-wash-web.jpg?resize=1024%2C675&ssl=1"),
		("https://www.artemedialab.it/wp-content/uploads/2019/04/immagini-sfondo-1-700x400.jpg"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRWDD_unTM70kvHmeRtuEt1GsexozvM2HgnwoS0bUBaQ&s"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFSHVVC9sJNKp9mAb7b9Uq_zCdcsjlX2az5_Dxsr-q_9tcLikJgf5y_68BPrB8DMu8A90&usqp=CAU"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMz5q01E70iTvclguyRdJMYWesZW5PtrDl2g&usqp=CAU"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOxuBiqq9WPIrzsYNuAXEimQlldp4i73M_nQ&usqp=CAU"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThzMadGJ_FGE4LG-WtUYtEQT2EuspwHdhnYg&usqp=CAU"),
		("https://www.psicosocial.it/wp-content/uploads/2020/10/immagini-che-si-muovono.jpg"),
		("https://us.123rf.com/450wm/rarityassetclub/rarityassetclub2209/rarityassetclub220901024/191807533-orso-polare-con-aurora-boreale-aurora-boreale-immagine-notturna-con-stelle-cielo-scuro-bestia.jpg"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJMl4qHIqv6J8SUpm6zLr092E24O026TEgTupI4xklE64r9LfDTB7AXZbt2b6MaHBlxZM&usqp=CAU"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIBbvg_wwX6Uom8UUf1UEpcRWtxkIYAXmJyg&usqp=CAU"),
		("https://images.pexels.com/photos/16714211/pexels-photo-16714211.jpeg?auto=compress&bri=5&cs=tinysrgb&fit=crop&h=500&w=1400&dpr=1"),
		("https://us.123rf.com/450wm/virtosmedia/virtosmedia2301/virtosmedia230120140/197671838-reflection-in-the-mirror-of-a-smartphone-in-a-field-of-flowers.jpg?ver=6"),
		("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZEoHEnKcE4FAqFpAnxJ7s0KgjY_5kQVp8FA&usqp=CAU");
*/
INSERT INTO content (pageId,ord,type,paragraph,header,image)
VALUES  (1,0,0,NULL,"Pizza",NULL),
		(2,0,0,NULL,"Croissant con marmellata di cipolle",NULL),
		(3,0,0,NULL,"Aeromodelli a turbina",NULL),
		(4,0,0,NULL,"Le regole del padel",NULL),
		(5,0,0,NULL,"selettori CSS",NULL),
		(6,0,0,NULL,"ADC",NULL),
		(1,2,1,"la pizza è un tipico piatto italiano diffuso in tutto il mondo, in questo blog racconterò i segreti per cucinarla al meglio",NULL,NULL),
		(2,1,1,"Esploriamo oggi nuovi gusti nel nostro blog di cucina creativa, prepareremo un croissant con marmellata di cipolle",NULL,NULL),
		(3,1,1,"La propulsione a turbina è molto usata anche nel modellismo poiché permette di raggiungere velocità maggiori, porta però ad avere maggiore consumo, in seguito vedremo nel dettaglio alcune comparazioni fra i vari modelli di turbine in commercio.",NULL,NULL),
		(6,1,1,"Un convertitore analogico-digitale (in inglese Analog to Digital Converter) è un circuito elettronico in grado di convertire un segnale analogico con andamento continuo (ad es. una tensione) in una serie di valori discreti (vedi teoria sulla conversione analogico-digitale). Il convertitore digitale-analogico o DAC compie l'operazione inversa.",NULL,NULL),	
		(6,2,0,NULL,"Risoluzione",NULL),
		(6,4,1,"La risoluzione di un ADC indica il numero di valori discreti che può produrre. È usualmente espressa in bit. Per esempio, un ADC che codifica un ingresso analogico in 256 livelli discreti ha una risoluzione di 8 bit, essendo 28 = 256. La risoluzione può anche essere definita elettricamente, ed espressa in volt. La risoluzione in volt di un ADC è uguale alla minima differenza di potenziale tra due segnali che vengono codificati con due livelli distinti adiacenti. Alcuni esempi possono aiutare:
    	Esempio 1:
			Range compreso tra 0 e 10 volt
			Risoluzione dell'ADC di 12 bit: 212 = 4096 livelli di quantizzazione
			La differenza di potenziale tra due livelli adiacenti è 10 V / 4096 = 0,00244 V = 2,44 mV
    	Esempio 2:
			Range compreso tra -10 e 10 volt
			Risoluzione dell'ADC di 14 bit: 214 = 16384 livelli di quantizzazione
			La differenza di potenziale tra due livelli adiacenti è 20 V / 16384 = 0,00122 V = 1,22 mV
		Nella pratica, la risoluzione di un convertitore è limitata dal rapporto segnale/rumore (S/N ratio) del segnale in questione. Se è presente troppo rumore all'ingresso analogico, sarà impossibile convertire con accuratezza oltre un certo numero di bit di risoluzione. Anche se l'ADC produrrà un valore, questo non sarà accurato essendo i bit meno significativi funzione del rumore e non del segnale. Il rapporto S/N dovrebbe essere di circa 6 dB per bit. ",NULL,NULL),
		(1,1,2,NULL,NULL,"./static/pizza.png"),
		(4,2,2,NULL,NULL,"./static/sport.png"),
		(5,2,2,NULL,NULL,"./static/CSS.png"),
		(6,3,2,NULL,NULL,"./static/ADC.png");


