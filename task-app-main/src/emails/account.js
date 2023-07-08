
const sgMail = require('@sendgrid/mail') 
const sendgridAPIKey = process.env.SEND_EMAIL_API_KEY\
sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: 'sumitpawar_20515@aitpune.edu.in', 
        subject: 'Welcome to Task App', 
        text: `Welcome to the app, ${name}! Hope you enjoy it!` 
    })
}

// Send Farewell Email function
const sendFarewellEmail = (email, name) => {
    sgMail.send({ 
        to: email, 
        from: 'sumitpawar_20515@aitpune.edu.in',
        subject: 'Succefully Cancelled Task App Subscription',
        text: `Farewell ${name}! Hope to see you again!` 
    })
}

module.exports = {
    sendWelcomeEmail,
    sendFarewellEmail
}