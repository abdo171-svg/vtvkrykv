document.addEventListener('DOMContentLoaded', () => {
    const cart = [];
    const cartCountElement = document.getElementById('cart-count');
    const totalPriceElement = document.getElementById('total-price');
    let totalPrice = 0;

    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-product');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            cart.push({ name: productName, price: productPrice });
            totalPrice += productPrice;
            updateCart();
            alert(`${productName} تمت إضافته إلى السلة!`);
        });
    });

    function updateCart() {
        cartCountElement.textContent = cart.length;
        totalPriceElement.textContent = totalPrice.toFixed(2);
    }

    // Stripe payment integration
    const stripe = Stripe('pk_test_51Px9Ls04ZzCIB15Mc2iP7jTLCq74c2ixNO417KcEr6dKMbwp9C1UVzKzlE51NPmobgCXLMtAXlx0spy5uC0b05gm009ad5bjCc'); // Replace with your Stripe public key
    const elements = stripe.elements();

    const paymentRequest = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
            label: 'إجمالي السعر',
            amount: Math.round(totalPrice * 100), // Convert to cents
        },
    });

    const paymentRequestButton = elements.create('paymentRequestButton', {
        paymentRequest,
    });

    paymentRequest.canMakePayment().then(result => {
        if (result) {
            document.getElementById('payment-request-button').appendChild(paymentRequestButton);
            paymentRequestButton.mount('#payment-request-button');

            paymentRequest.on('paymentmethod', async (event) => {
                try {
                    const response = await fetch('/create-payment-intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            payment_method_id: event.paymentMethod.id,
                            amount: Math.round(totalPrice * 100), // Convert to cents
                        }),
                    });
                    const { clientSecret } = await response.json();
                    const { error } = await stripe.confirmCardPayment(clientSecret, {
                        payment_method: event.paymentMethod.id,
                    });

                    if (error) {
                        event.complete('fail');
                        alert('فشل الدفع: ' + error.message);
                    } else {
                        event.complete('success');
                        alert('تم الدفع بنجاح!');
                        // Clear cart and update UI
                        cart.length = 0;
                        totalPrice = 0;
                        updateCart();
                    }
                } catch (error) {
                    event.complete('fail');
                    alert('خطأ في الدفع: ' + error.message);
                }
            });
        }
    });
});
