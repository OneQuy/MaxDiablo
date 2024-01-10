import { Tier } from "./Types";

const fs = require('fs')

export const Check = () => {
    // const text = fs.readFileSync('./assets/BuildsData.json');

    // const buildsData: Tier[] = JSON.parse(text)
    // let loop = 0;

    // for (let itier = 0; itier < buildsData.length; itier++) {
    //     const tier = buildsData[itier]

    //     for (let ibuild = 0; ibuild < tier.builds.length; ibuild++) {
    //         const build = tier.builds[ibuild]

    //         for (let islot = 0; islot < build.slots.length; islot++) {
    //             const slot = build.slots[islot]

    //             for (let istat = 0; istat < slot.stats.length; istat++) {
    //                 const stat = slot.stats[istat]

    //                 if (stat.name.includes('Movement Speed'))
    //                     console.log(stat.name);

    //                 loop++
    //             }
    //         }
    //     }
    // }

    // console.log('done', loop);


    Func()

}

import puppeteer from 'puppeteer';

const Func = async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto('https://developer.chrome.com/');

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    // Type into search box
    await page.type('.search-box__input', 'automate beyond recorder');

    // Wait and click on first result
    const searchResultSelector = '.search-box__link';
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector(
        'text/Customize and automate'
    );
    const fullTitle = await textSelector?.evaluate(el => el.textContent);

    // Print the full title
    console.log('The title of this blog post is "%s".', fullTitle);

    await browser.close();
}