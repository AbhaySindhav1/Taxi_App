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
      customer: customer.id,
      payment_method_types: ["bancontact", "card", "ideal"],
    });
  } catch (error) {
    console.error("Error creating customer:", error);
  }
}

module.exports = {
  createCustomer,
  SetUpIntant,
};
