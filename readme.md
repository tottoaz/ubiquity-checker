# How to use
* You must have node installed on your computer https://nodejs.org/en/download/
* Download or clone this repo
* In the same directory  as the script run `npm install`
* And then run `node ubiquity-checker.js`

# Modification
* Modify the "urls" array to contain the products you want to check.
* Test that the mp3 will play on your system without error by adding a product you know is in stock. You don't want to find out that it doesn't work when something is actually in stock. If it causes an error then just delete exec('afplay mixkit-fast-small-sweep-transition-166.mp3')
