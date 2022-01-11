import * as puppeteer from 'puppeteer'

export default class deebee {
    async run(page:  puppeteer.Page){
        let [nameEl] = await page.$x('//*[@id="content-center"]/div[3]/section/div[1]/h1/span')

        // if it opens on the preview page
        if(!nameEl){
            // get link for real info page
            const [linkEl] = await page.$x('//*[@id="product-results"]/div[3]/div/div/div[1]/a')
            let link = await linkEl.evaluate(el => el.getAttribute('href'))

            // go to that link
            await page.goto(link)

        }
        
        [nameEl] = await page.$x('//*[@id="content-center"]/div[3]/section/div[1]/h1/span')

        let name = await nameEl.evaluate(el => el.textContent)

        const [imgEl] = await page.$x('//*[@id="content-center"]/div[3]/section/div[2]/div[1]/div/a/img')

        const img = await imgEl.evaluate(el => el.getAttribute('src'))
        
        
        const [brandEl] = await page.$x('//*[@id="content-center"]/div[3]/section/div[2]/div[2]/div[1]/div[2]/ul[2]/li[3]/span[2]/a/span')
        
        let brand = await brandEl.evaluate(el => el.textContent)

        return {
            src: 'deebee',
            name: name.trim(),
            brand: brand.trim(),
            img
        }
    }
}