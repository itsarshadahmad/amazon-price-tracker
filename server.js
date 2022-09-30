import nightmare from "nightmare";
import sgMail from "@sendgrid/mail";
import ora from "ora";
import inquirer from "inquirer";
import dotenv from "dotenv";

dotenv.config();
const spinner = ora();

inquirer
    .prompt([
        { name: "url", message: "Enter your product amazon link: " },
        { name: "dropPrice", message: "Enter your discont price: " },
        { name: "email", message: "Enter your email: " },
    ])
    .then((answers) => {
        const URL = answers.url;
        const DROP_PRICE = answers.dropPrice;
        const EMAIL = answers.email;

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        checkPrice(URL, DROP_PRICE, EMAIL);
    })
    .catch((error) => {
        throw error;
    });

async function checkPrice(url, dropPrice, receiverEmail) {
    try {
        spinner.start("Loading Price").color = "yellow";
        const priceString = await nightmare()
            .goto(url)
            .wait("span .a-price-whole")
            .evaluate(() => document.querySelector(".a-price-whole").textContent)
            .end();

        const priceNumber = parseFloat(priceString.replace(",", ""));
        spinner.succeed("Price Loaded");

        if (priceNumber < dropPrice) {
            spinner.start("Sending Email").color = "yellow";
            await sendEmail(
                receiverEmail,
                "Hurry, Price Drop!",
                `Price dropped below Rs${dropPrice} on ${url}`
            );
            spinner.succeed("Email Sent");
        }
    } catch (err) {
        spinner.fail();
        throw err;
    }
}

function sendEmail(receiverEmail, subject, body) {
    const email = {
        to: receiverEmail,
        from: process.env.SENDER_EMAIL,
        subject: subject,
        text: body,
        html: body,
    };
    return sgMail.send(email);
}
