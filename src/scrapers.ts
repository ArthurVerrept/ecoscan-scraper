import * as puppeteer from 'puppeteer'
import scraperMap from './scrapers/index'

// we want something that checks and returns name and pic of our item, 
// if google can't find our item, it will check the first page of 
// google (10 sites) and if any of the sites in our trusted site list
// have the item it will click on that and ge the data there


// passing in trusted sites as puppeteer logic is harder to process then
// a simple includes on each site found as we loop through the pages
async function scrapeProduct (barcode: string, trustedSites: string[], browser: puppeteer.Browser) {

    // creates a new page
    const page = await browser.newPage()
   
    // go to google page of barcode
    await page.goto('https://www.google.com/search?q=' + barcode)

    // CHECK GOOGLE

    // $x selects an item in the page using xpath which returns an array
    // we extract that using [el]
    const [nameEl] = await page.$x('//*[@id="rhs"]/div/div/div/div[2]/div[1]/div/div[1]')

    let name: string | null = null
    if (nameEl) {
        name = await nameEl.evaluate(el => el.textContent)
    }

    // get image and extract src tag text
    let img: string | null = null
    try {
        img = await page.$eval('div.commercial-unit-desktop-rhs g-scrolling-carousel img', (el:Element) => el.getAttribute('src'))
    } catch {
    }

    const [brandEl] = await page.$x('//*[@id="rhs"]/div/div/div/div[5]/div[1]/div[3]/span[3]')
    let brand: string | null = null
    if (brandEl) {
       brand = await brandEl.evaluate(el => el.textContent);
    }

    // if google is able to find all the product info in the sidebar
    if (name && brand && img){
        //  return all info from google
        return {
            src: 'google',
            name: name.trim(),
            brand: brand.trim(),
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
                // this returns a trusted site from our sites to be used later
                const trustedSite = trustedSites.find(url => siteUrl.includes(url))
                console.log('found ' + siteUrl)
                // if one matches go scrape data from there
                if (trustedSite) {
                    // TODO: add scraping of data
                    console.log('matched to: ' + trustedSite)
                    // get link element
                    const siteLink = await divs[i].$('a')
                    // pull out URL
                    const newSiteURL = await siteLink.evaluate(el => el.getAttribute('href'))
                    
                    // create new page
                    const sitePage = await browser.newPage()

                    // user agent will often state that we are using a headless browser which 
                    // by default will return a permission denied on a lot of Cloudflare
                    // services.
                    // https://stackoverflow.com/questions/68696073/puppeteer-cloudflare-websites-return-403-forbidden
                    // https://jsoverson.medium.com/how-to-bypass-access-denied-pages-with-headless-chrome-87ddd5f3413c
                    await sitePage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36')

                    // go to trusted site page
                    await sitePage.goto(newSiteURL)

                    // create new instance of scraper of trusted site passed in
                    let siteScraper = new scraperMap[trustedSite]
                    const data = await siteScraper.run(sitePage)

                    // close current page before potentially opening another
                    await sitePage.close()

                    // if data is found it exits for loop aka stops looking at other pages
                    return data
                }
            }
        }
        await page.close()

        console.log('no matches')
        // if we make it here then no trusted sites were found and no data can be returned
        // TODO: return something appropriate
        return null
    }
}


export default async function getProduct() {
    let browser = await puppeteer.launch()
    
    let product = await scrapeProduct('5010358254470', trustedSites, browser)
    
    console.log(product)

    browser.close()


    browser = await puppeteer.launch()

    product = await scrapeProduct('9780141029542', trustedSites, browser)
    
    console.log(product)

    browser.close()


    browser = await puppeteer.launch()

    product = await scrapeProduct('4009900482776', trustedSites, browser)
    
    console.log(product)

    browser.close()
}

// sainsburys got removed cause the site is shite
// these are in order of what I have found to be the most consistently correct
const trustedSites: string[] = ['codecheck', 'appyshop', 'deebee', 'buycott', 'tesco', 'waitrose']

// const [imagesButton] = await page.$x('//*[@id="hdtb-msb"]/div[1]/div/div[4]/a')
// await imagesButton.click()