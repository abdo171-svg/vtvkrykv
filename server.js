const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51Px9Ls04ZzCIB15MiKkd9prfxfzUjNDhQEK1BZpkdzdh12CwI69TtgaSvewrv8uc8xXZygXy439kfgGWHH8TeTaT00ja0Gh5dH'); // Replace with your Stripe secret key

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/create-payment-intent', async (req, res) => {
    const { payment_method_id, amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method: payment_method_id,
            confirm: true,
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(4242, () => console.log('Server listening on port 4242'));

const express = require('express');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51Px9Ls04ZzCIB15MiKkd9prfxfzUjNDhQEK1BZpkdzdh12CwI69TtgaSvewrv8uc8xXZygXy439kfgGWHH8TeTaT00ja0Gh5dH'); // Replace with your Stripe secret key
const nodemailer = require('nodemailer'); // لإرسال البريد الإلكتروني

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// إعداد nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // بريدك الإلكتروني
        pass: 'your-email-password' // كلمة مرور البريد الإلكتروني
    }
});

app.post('/create-payment-intent', async (req, res) => {
    const { payment_method_id, amount, user_email } = req.body; // افتراض أن البريد الإلكتروني يرسل من العميل

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method: payment_method_id,
            confirm: true,
        });

        // إرسال رسالة تأكيد بالبريد الإلكتروني
        const mailOptions = {
            from: 'your-email@gmail.com', // عنوان بريد المرسل
            to: user_email, // عنوان البريد الإلكتروني للمستخدم
            subject: 'تأكيد طلبك',
            text: `تم استلام طلبك بمبلغ ${amount / 100} دولار. شكراً لتسوقك معنا!`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email: ', error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(4242, () => console.log('Server listening on port 4242'));

fetch('/create-payment-intent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        payment_method_id: paymentMethod.id,
        amount: totalAmount,
        user_email: userEmail // البريد الإلكتروني للمستخدم
    }),
})

