import puppeteer from 'puppeteer';
import Mailer from './Mailer.js'
import {exec} from 'child_process';
import config from './config.js';
import open from 'open';

const urls = config.urlsToCheck;
let mailer;
const sentNotifications = [];


if (config.sendMailNotifications) {
    mailer = await Mailer.build();
    const configVerified = await mailer.verifyConfig();

    if (!configVerified) {
        console.log('🚨 EMAIL SETTINGS ARE NOT CORRECT OR SMTP SERVER IS REFUSING CONNECTION. 🚨');
        console.log('🚨 REFUSING TO RUN! 🚨');
        console.log('ℹ️  Verify email settings or disable them with sendMailNotifications: false');
        process.exit(1);
    }
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let urlIdx = 0;
    var checkStock = async function () {
        const url = urls[urlIdx];

        await page.goto(url, {
            waitUntil: 'networkidle2',
        });

        const functionToInject = function () {
            return document.querySelector("#app").__vue__.appData.product;
        }
        const toWait = Math.floor((config.refreshRate + Math.random() * config.refreshRate) / 1000);
        const data = await page.evaluate(functionToInject);
        const item = data.variants[0];

        console.log(`Product: ${item.name}\nAvailable: ${item.available}\nQuantity: ${item.inventory_quantity}\n========\n`);

        if (item.available || item.inventory_quantity > 0) {
            const notificationSent = sentNotifications.includes(item.name);

            if (config.openUrlOnSuccess) {
                await open(url);
            }

            console.log(`${item.name} IS IN STOCK! (${item.inventory_quantity})`);
            if (config.sendMailNotifications && !notificationSent) {
                const mail = await mailer.send(
                    `${item.name} is in stock now!`,
                    `There are ${item.inventory_quantity} ${item.name}s in stock now: ${url}`
                )
                if (mail?.accepted?.length) {
                    console.log(`📧 Email notification sent to ${mailer.to}`);
                }
                sentNotifications.push(item.name);
            }

            if (notificationSent) {
                console.log('⚠️  Refusing to send email notificaion because it has already been sent.');
            }


            if (config.playSound) {
                exec('afplay mixkit-fast-small-sweep-transition-166.mp3')
            }
            console.log('\n\n');
        }

        urlIdx = urlIdx === (urls.length - 1) ? 0 : (urlIdx + 1);

        setTimeout(checkStock, toWait * 1000);
    }
    checkStock();
})();