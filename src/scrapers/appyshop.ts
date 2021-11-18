import * as puppeteer from 'puppeteer'

export default class appyshop {
    async run(page:  puppeteer.Page){
        const [nameEl] = await page.$x('/html/body/div[1]/main/div[2]/div[2]/h1')

        const name = await nameEl.evaluate(el => el.textContent)


        const [imgEl] = await page.$x('/html/body/div[1]/main/div[2]/div[1]/a/img')

        const imgRef = await imgEl.evaluate(el => el.getAttribute('src'))
        const img = 'https://appyshop.co.uk/' + imgRef


        const [brandEl] = await page.$x('/html/body/div[1]/main/div[2]/div[2]/div[4]/div/div[1]/div[1]/p[1]')

        const brand = await brandEl.evaluate(el => el.textContent)

        return {
            src: 'appyshop',
            name: name.trim(),
            brand: brand.trim(),
            img
        }
    }
}