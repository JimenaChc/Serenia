import checkoutNodeJssdk from "@paypal/checkout-server-sdk";

const Environment =
  process.env.PAYPAL_MODE === "live"
    ? checkoutNodeJssdk.core.LiveEnvironment
    : checkoutNodeJssdk.core.SandboxEnvironment;

const environment = new Environment(
  process.env.PAYPAL_API_CLIENT,
  process.env.PAYPAL_API_SECRET
);

const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);

export default client;
