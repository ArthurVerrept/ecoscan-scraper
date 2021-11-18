import * as puppeteer from 'puppeteer'

export default class codecheck {
    async run(page: puppeteer.Page){
        // console.log(page.url())
        const [nameEl] = await page.$x('//*[@id="t-2841620248"]')

        const name = await nameEl.evaluate(el => el.textContent)

        const [imgEl] = await page.$x('//*[@id="i-2841620248"]')

        const imgRef = await imgEl.evaluate(el => el.getAttribute('src'))
        console.log(imgRef)
        // const img = 'https://appyshop.co.uk/' + imgRef


        // const [brandEl] = await page.$x('/html/body/div[1]/main/div[2]/div[2]/div[4]/div/div[1]/div[1]/p[1]')

        // const brand = await brandEl.evaluate(el => el.textContent)

        // return {
        //     src: 'codecheck',
        //     name: name.trim(),
        //     brand: brand.trim(),
        //     img
        // }
        // return console.log('codecheck scraper not implemented')
    }
}