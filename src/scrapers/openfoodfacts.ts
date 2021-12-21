import * as puppeteer from 'puppeteer'

export default class openfoodfacts {
    async run(page:  puppeteer.Page){
        const [nameEl] = await page.$x('//*[@id="main_column"]/div[4]/h1')
        let name = await nameEl.evaluate(el => el.textContent)

        if (name.includes('-')) {
            name = name.split('-')[0]
        }

        const [imgEl] = await page.$x('//*[@id="og_image"]')

        const imgRef = await imgEl.evaluate(el => el.getAttribute('src'))
        const img = 'https://openfoodfacts.org/' + imgRef

        const [brandEl] = await page.$x('//*[@id="field_brands_value"]/a')

        let brand = await brandEl.evaluate(el => el.textContent)

        return {
            src: 'openfoodfacts',
            name: name.trim(),
            brand: brand.trim(),
            img
        }
    }
}