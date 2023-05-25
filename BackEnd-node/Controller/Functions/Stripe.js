const stripe = require("stripe")(
  "sk_test_51N93JqGPole4IExICnz9ZdhWYJVFis60b1B1R83OibSPoWksuWHuRGlep1Sd3eAzWrqagpaJVRzDTWRgNOvzOauP00IK98cVhT"
);

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
        default_payment_method: cardId
      }
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

module.exports = {
  createCustomer,
  SetUpIntant,
  retrievePaymentMethods,
  deletePaymentMethod,
  updateDefaultCard,
  getCustomer
};
