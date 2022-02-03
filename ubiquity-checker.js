const puppeteer = require('puppeteer');
const { exec } = require("child_process");
const refreshRate = 10000;
const urls = [
    'https://store.ui.com/collections/early-access/products/dream-router-ea',
    'https://store.ui.com/collections/unifi-protect/products/unifi-video-g3-flex-camera',
    // 'https://store.ui.com/collections/unifi-protect/products/unifi-protect-g3-instant-camera',
    // 'https://store.ui.com/collections/unifi-protect/products/camera-g4-instant-ea',
    // 'https://store.ui.com/collections/unifi-protect/products/unifi-video-camera-g3-bullet',
    // 'https://store.ui.com/collections/unifi-protect/products/uvc-g4-dome'
];

(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
    let urlIdx = 0;
	var checkStock = async function(){
        const url = urls[urlIdx];

		await page.goto(url, {
			waitUntil: 'networkidle2',
		});
        
		var functionToInject = function(){
			return document.querySelector("#app").__vue__.appData.product;
		}
		var toWait = Math.floor((refreshRate+Math.random()*refreshRate)/1000);
		var data = await page.evaluate(functionToInject);
        var item = data.variants[0];

        console.log(`Product: ${item.name}\nAvailable: ${item.available}\nQuantity: ${item.inventory_quantity}\n========\n`);


        if (item.available || item.inventory_quantity > 0) {
            setInterval(() => {
                console.log(`${item.name} IS IN STOCK! (${item.inventory_quantity})`);
                exec('afplay mixkit-fast-small-sweep-transition-166.mp3')
            }, 2500);
        }
        
        urlIdx = urlIdx === (urls.length - 1) ? 0 : (urlIdx + 1);

		setTimeout(checkStock, toWait*1000);
	}
	checkStock();
})();