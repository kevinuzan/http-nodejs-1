import { createServer } from 'http';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

var app = express();
var server = createServer(app);
server.listen(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/json', express.static(path.join(__dirname, 'public/json')));
app.use('/src', express.static(path.join(__dirname, 'public/src')));
app.use('/html', express.static(path.join(__dirname, 'public/html')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/temp_folder', express.static(path.join(__dirname, 'public/temp_folder')));
app.use('/', express.static(path.join(__dirname, '/index.html')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/changeJsonData', function (req, res) {
  var newDataAppend = req.query.name.split(';')[0]
  var id = req.query.name.split(';')[1]
  var resultado = changeJson(newDataAppend, id)
  res.json(resultado)
});

/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */

async function findOneDocument(collection) {
  // Defina o filtro para encontrar o documento. Altere conforme necessário.
  const query = { user: "KMCU1509" }; // Exemplo de filtro

  const document = await collection.findOne(query);

  if (document) {
    console.log("Documento encontrado:", document.planos['TRT-2'].disciplinas[3]);
    console.log("Documento encontrado:", document.planos['TRT-2'].cargahoraria[3]);
  } else {
    console.log("Nenhum documento corresponde ao filtro");
  }
}

async function getQuery(client, user) {
  var collection = await client.db("test").collection("user");
  const query = { user: user }; // Exemplo de filtro
  const document = await collection.findOne(query);

  if (document) {
    console.log("Documento encontrado:", document.planos['TRT-2'].disciplinas);
    console.log("Documento encontrado:", document.planos['TRT-2'].cargahoraria);
  } else {
    console.log("Nenhum documento corresponde ao filtro");
  }
};

async function mongoDbQuery() {
  var mongoConnectionString = process.env.MONGO_URL
  console.log(mongoConnectionString)
  const client = new MongoClient(mongoConnectionString);
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls
    await getQuery(client, "AGMU2401");

  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

mongoDbQuery()
// var connectionString = process.env.DATABASE_URL
// var pgClient = new pg.Client(connectionString)
// pgClient.connect()

// async function getDataPostgre(email) {
//   try {
//       var query = `select data from users where LOWER(email) = LOWER('${email}')`
//       var { rows } = await pgClient.query(query)
//       return { rows }
//   } catch (e) {
//       console.log(e)
//       return e
//   }
// }

function changeJson(newDataAppend, id) {
  try {
    // Leitura do arquivo JSON
    const data = fs.readFileSync(path.join(__dirname + '/public/json/itemData.json'), 'utf8');
    // Conversão do JSON em objeto JavaScript
    const jsonData = JSON.parse(data);

    // Adição de um novo item à lista 'itemDespesas'
    var newItem = newDataAppend;
    if (id === "despesasBtn") {
      if (jsonData["itemDespesa"].indexOf(newItem.toLowerCase()) == -1) {
        jsonData["itemDespesa"][0][newItem] = 0;
      }
    } else {
      if (jsonData["itemRenda"].indexOf(newItem.toLowerCase()) == -1) {
        jsonData["itemRenda"][0][newItem] = 0;
      }
    }

    // Conversão do objeto JavaScript atualizado de volta para JSON
    const updatedJson = JSON.stringify(jsonData, null, 2);
    // Escrita do JSON atualizado de volta ao arquivo
    fs.writeFileSync(path.join(__dirname + '/public/json/itemData.json'), updatedJson, 'utf8');
    return [updatedJson, true];
  } catch (err) {
    console.error('Erro ao ler ou escrever o arquivo JSON:', err);
    return [err, false];
  }
}


app.post('/salvar-json', (req, res) => {
  const jsonData = req.body;
  // Salvar o JSON em um arquivo
  fs.writeFile(path.join(__dirname + '/public/json/calendarData.json'), JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Erro ao escrever o arquivo:', err);
      res.status(500).json({ error: 'Erro ao salvar o arquivo.' });
      return;
    }
    console.log('Arquivo atualizado com sucesso!');
    res.json({ success: true });
  });
});