import puppeteer from 'puppeteer'
import scraperMap from './scrapers/index'
import { Product } from './types/product'
// we want something that checks and returns name and pic of our item, 
// if google can't find our item, it will check the first page of 
// google (10 sites) and if any of the sites in our trusted site list
// have the item it will click on that and ge the data there


// passing in trusted sites as puppeteer logic is harder to process then
// a simple includes on each site found as we loop through the pages
async function scrapeProduct (barcode: string, trustedSites: string[], browser: puppeteer.Browser): Promise<Product | undefined> {
    // for each div we are going to try match to one of our trusted sites
    // and click on it to scrape from there
    const sitePage = await browser.newPage()
    for (let x = 0; x < trustedSites.length; x++) {
        await sitePage.goto(`https://www.google.com/search?q=${barcode}+${trustedSites[x]}`)

        const divs = await sitePage.$x('//*[@id="rso"]/div')
        for (let i = 0; i < divs.length; i++) {
            let citeStr = await divs[i].$('cite')
            if (citeStr) {
                let re = new RegExp('.+?(?= )');
                let siteUrl = re.exec(await citeStr.evaluate(el => el.textContent))[0]
                // console.log(trustedSites[x], siteUrl)
                if(siteUrl.includes(trustedSites[x])) {
                    const siteLink = await divs[i].$('a')
                    const newSiteURL = await siteLink.evaluate(el => el.getAttribute('href'))

                    // user agent will often state that we are using a headless browser which 
                    // by default will return a permission denied on a lot of Cloudflare
                    // services.
                    // https://stackoverflow.com/questions/68696073/puppeteer-cloudflare-websites-return-403-forbidden
                    // https://jsoverson.medium.com/how-to-bypass-access-denied-pages-with-headless-chrome-87ddd5f3413c
                    await sitePage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36')
                    await sitePage.goto(newSiteURL)
                    let siteScraper = new scraperMap[trustedSites[x]]
                    const data = await siteScraper.run(sitePage)
                    return data
                }
            }
        }

    }
    await sitePage.close()

    // if we make it here then no trusted sites were found and no data can be returned
    // TODO: return something appropriate
    return undefined
}


export default async function getProduct(barcode: string) {
    let browser = await puppeteer.launch()
    
    const product = await scrapeProduct(barcode, trustedSites, browser) 
    
    browser.close()
    
    return product
}

// sainsburys got removed cause the site is shite
// these are in order of what I have found to be the most consistently correct
const trustedSites: string[] = ['openfoodfacts', 'appyshop', 'deebee']