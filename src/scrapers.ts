import * as puppeteer from 'puppeteer'
import scraperMap from './scrapers/index'

// we want something that checks and returns name and pic of our item, 
// if google can't find our item, it will check the first page of 
// google (10 sites) and if any of the sites in our trusted site list
// have the item it will click on that and ge the data there

async function getPage(barcode){
    // this creates a headless a browser
    const browser = await puppeteer.launch()
   
    // creates a new page
    const page = await browser.newPage()
   
    // go to google page of barcode
    await page.goto('https://www.google.com/search?q=' + barcode)
    return page
}


// passing in trusted sites as puppeteer logic is harder to process then
// a simple includes on each site found as we loop through the pages
async function scrapeProduct (trustedSites, page) {
    // CHECK GOOGLE

    // $x selects an item in the page using xpath which returns an array
    // we extract that using [el]
    const [nameEl] = await page.$x('//*[@id="rhs"]/div/div/div/div[2]/div[1]/div/div[1]')
    
    // if google is able to find the product in the sidebar then use
    // the name from google and click images to get an image link
    if (nameEl){
        const name = await nameEl.evaluate(el => el.textContent)

        // get image and extract src tag text
        const img = await page.$eval('div.commercial-unit-desktop-rhs g-scrolling-carousel img', el => el.src)

        const [brandEl] = await page.$x('//*[@id="rhs"]/div/div/div/div[5]/div[1]/div[3]/span[3]')

        const brand = await brandEl.evaluate(el => el.textContent);

        //  return all info from google
        return {
            name,
            brand,
            img
        }

    } else {
        // get all divs with links to websites from page 1
        const divs = await page.$x('//*[@id="rso"]/div')

        // for each div we are going to try match to one of our trusted sites
        // and click on it to scrape from there
        for (let i = 0; i < divs.length; i++) {

            // get the url of shop using cite html tag it's linking to out the div
            const citeStr = await divs[i].$('cite')

            // if it found a url
            if(citeStr){
                // remove extra text (not necessary)
                let re = new RegExp('.+?(?= )');
                const siteUrl = re.exec(await citeStr.evaluate(el => el.textContent))[0]

                // for this div, check if it matches on of our trusted sites
                const trustedSite = trustedSites.find(url => siteUrl.includes(url))
                
                // if one matches go scrape data from there
                if (trustedSite) {
                    // TODO: add scraping of data
                    console.log(trustedSite)
                    let siteScraper = new scraperMap[trustedSite]
                    console.log('site: ' + await siteScraper.run())
                }
            }
        }

        // if we make it here then no trusted sites were found and no data can be returned
        // TODO: return something appropriate
    }
}


export default async function getProduct(){
    
    let page = await getPage('50008667')
    
    let product = await scrapeProduct(trustedSites, page)
    
    console.log(product)
    
    page = await getPage('4009900482776')
    
    product = await scrapeProduct(trustedSites, page)
    
    console.log(product)
}
const trustedSites = ['appyshop', 'deebee', 'buycott', 'tesco', 'sainsburys', 'waitrose']






// const [imagesButton] = await page.$x('//*[@id="hdtb-msb"]/div[1]/div/div[4]/a')
// await imagesButton.click()