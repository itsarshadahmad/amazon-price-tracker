const nightmare = require("nightmare")()
const sgMail = require("@sendgrid/mail")

require("dotenv").config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const URL = process.argv[2];
const DROP_PRICE = process.argv[3];
const EMAIL = process.argv[4];

checkPrice(URL, DROP_PRICE, EMAIL)

async function checkPrice(url, dropPrice, receiverEmail) {
    try {
        const priceString = await nightmare
            .goto(url)
            .wait("span .a-price-whole")
            .evaluate(() => document.querySelector(".a-price-whole").textContent)
            .end()

        const priceNumber = parseFloat(priceString.replace(",", ""))
        console.log(priceNumber);

        if (priceNumber < dropPrice) {
            await sendEmail(
                receiverEmail,
                "Hurry, Price Drop!",
                `Price dropped below Rs${dropPrice} on ${url}`
            )
        }
    } catch (err) {
        throw err
    }
}

function sendEmail(receiverEmail, subject, body) {
    const email = {
        to: receiverEmail,
        from: process.env.SENDER_EMAIL,
        subject: subject,
        text: body,
        html: body
    }

    return sgMail.send(email)
}