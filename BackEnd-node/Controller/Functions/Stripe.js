const path = require("path");
const envPath = path.join(__dirname, "../../key.env");
require("dotenv").config({ path: envPath });

const stripe = require("stripe")(process.env.StripePrivateKey);

async function createCustomer(email, name) {
  try {
    if (!email || !name) {
      throw new Error("Enter Valid Datails");
    }
    const customer = await stripe.customers.create({
      email: email,
      name: name,
    });
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

async function SetUpIntant(customer) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customer,
      automatic_payment_methods: { enabled: true },
    });

    return setupIntent;
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

async function retrievePaymentMethods(CUSTOMER_ID) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: CUSTOMER_ID,
      type: "card",
    });
    return paymentMethods.data;
  } catch (error) {
    console.error("Error retrieving payment methods:", error);
    return null;
  }
}

async function deletePaymentMethod(paymentMethodId) {
  try {
    const deletedPaymentMethod = await stripe.paymentMethods.detach(
      paymentMethodId
    );
    return deletedPaymentMethod;
  } catch (error) {
    console.error("Error deleting payment method:", error);
  }
}

async function updateDefaultCard(customerId, cardId) {
  try {
    const updatedCustomer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: cardId,
      },
    });
    return updatedCustomer;
  } catch (error) {
    console.error("Error updating default card:", error);
  }
}

async function getCustomer(customerId) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    return error;
  }
}

async function GetPayment(customerId, paymentCardId, amountToDeduct) {
  try {
    console.log(customerId, paymentCardId, amountToDeduct);
    payment_intent = await stripe.paymentIntents.create({
      amount: +amountToDeduct * 100,
      currency: "usd",
      customer: customerId,
      payment_method: paymentCardId,
      confirm: true,
    });

    if (payment_intent.status == "succeeded") {
      console.log("Payment processed successfully.");
    } else {
      console.log("Payment failed.");
    }
  } catch (error) {
    return error;
  }
}

module.exports = {
  createCustomer,
  SetUpIntant,
  retrievePaymentMethods,
  deletePaymentMethod,
  updateDefaultCard,
  getCustomer,
  GetPayment,
};
