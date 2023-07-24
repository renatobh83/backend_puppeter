const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

const isDev = !process.env.NODE_ENV  


const instanciaBrowser = isDev ? async ()=>{
	const puppeteerLocal = require('puppeteer')
	const browser =  await puppeteerLocal.launch({headless: 'new'});
	return browser
	
} :
async ()=>{

const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium-min");

	const browser =  await puppeteer.launch({
       args:[ "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      ],
      executablePath: await chromium.executablePath(
         "https://github.com/Sparticuz/chromium/releases/download/v114.0.0/chromium-v114.0.0-pack.tar"
      ),
      ignoreHTTPSErrors: true,
    });
	return browser
	
}


app.get('/',(request, response)=>{
	response.send("Server On")
})

app.get('/screen',async (request, response)=>{
	const url = request.query.url

	if(!url) {
		response.send('Parametro invalido para url')
		return 
	}
	const browser =  await instanciaBrowser()
	try {
		
		const page = await browser.newPage();	
		await page.goto(url)
		const screenshot = await page.screenshot({fullPage :true});
		 await browser.close();
		response.set('Content-Type', 'image/png')		
		response.send(screenshot)
	} catch(e) {
 		response.send(`Something went wrong while running Puppeteer: ${e}`);
	}
})

app.get('/news', async (request, response)=>{
	const url = request.query.url
	const classe = request.query.classe
	const jornal = request.query.jornal
	const nNoticias = request.query.n || 5
	if(!url || !classe || !jornal) {
		response.send('Parametro invalido para url')
		return 
	}

	try {
		const browser = await instanciaBrowser()
		const page = await browser.newPage();	
		await page.setJavaScriptEnabled(false)
		await page.goto(url,{ waitUntil: 'domcontentloaded' })
		 	const noticiaJornal = await page.evaluate((classe, jornal, nNoticias)=>{
        	const nodeList = document.getElementsByClassName(classe)
        	const valorNews = [...nodeList].slice(0,nNoticias)
        	const list =  valorNews.map(({textContent}) => ({jornal, noticia: textContent}))
      return list
    },classe, jornal, nNoticias)
		 await browser.close()
		response.send(noticiaJornal)
	}catch (e) {
    response.send(`Something went wrong while running Puppeteer: ${e}`);
  } 
 })



app.listen(PORT, ()=> console.log(`Server on port:${PORT}` ))
