var braintree = require("braintree");
require("dotenv").config();

// Check if Braintree credentials exist
const hasBraintreeCredentials = process.env.BRAINTREE_MERCHANT_ID && 
                              process.env.BRAINTREE_PUBLIC_KEY && 
                              process.env.BRAINTREE_PRIVATE_KEY;

if (!hasBraintreeCredentials) {
  console.warn("Braintree credentials not found. Payment processing will be disabled.");
}

// Only initialize gateway if credentials exist
var gateway = hasBraintreeCredentials ? new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
}) : null;

class brainTree {
  ganerateToken(req, res) {
    if (!gateway) {
      return res.status(503).json({ 
        error: "Payment processing is currently unavailable. Please contact support." 
      });
    }

    // Generate client token with PayPal configuration
    gateway.clientToken.generate({
      paypal: {
        displayName: "Your Store Name",
        allowBillingPayments: true
      }
    }, (err, response) => {
      if (err) {
        console.error("Braintree token generation error:", err);
        if (err.code === 'PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED') {
          return res.status(503).json({ 
            error: "PayPal integration is not properly configured. Please contact support." 
          });
        }
        return res.status(500).json({ 
          error: "Failed to generate payment token. Please try again later." 
        });
      }
      return res.json(response);
    });
  }

  paymentProcess(req, res) {
    if (!gateway) {
      return res.status(503).json({ 
        error: "Payment processing is currently unavailable. Please contact support." 
      });
    }

    const { amountTotal, paymentMethod } = req.body;

    if (!amountTotal || !paymentMethod) {
      return res.status(400).json({ 
        error: "Invalid payment data. Amount and payment method are required." 
      });
    }

    gateway.transaction.sale(
      {
        amount: amountTotal,
        paymentMethodNonce: paymentMethod,
        options: {
          submitForSettlement: true,
          paypal: {
            description: "Your Store Purchase"
          }
        },
        channel: "Website",
        deviceData: req.body.deviceData
      },
      (err, result) => {
        if (err) {
          console.error("Braintree payment error:", err);
          if (err.code === 'PAYPAL_SANDBOX_ACCOUNT_NOT_LINKED') {
            return res.status(503).json({ 
              error: "PayPal integration is not properly configured. Please contact support." 
            });
          }
          return res.status(500).json({ 
            error: "Payment processing failed. Please try again later." 
          });
        }

        if (result.success) {
          console.log("Transaction ID: " + result.transaction.id);
          return res.json(result);
        } else {
          console.error("Braintree transaction error:", result.message);
          return res.status(400).json({ 
            error: result.message || "Payment failed. Please try again." 
          });
        }
      }
    );
  }
}

const brainTreeController = new brainTree();
module.exports = brainTreeController;
