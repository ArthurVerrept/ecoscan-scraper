import getProduct from './scrapers'
import express from 'express'
// rest of the code remains same
const app = express();
const PORT = 8000;


app.get('/', async (req, res) => {
  try{
    res.send(await getProduct(req.query.barcode.toString()))
  }catch (e) {
    // if there is an error just return nothing
    res.send()
  }
})


app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
});
