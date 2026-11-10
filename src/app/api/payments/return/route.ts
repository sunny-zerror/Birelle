// Redirect and form-post payment apps (PayU, Cashfree redirects) come back here;
// the kit sends the shopper on to /checkout/payment-return
export { paymentReturnHandler as GET, paymentReturnHandler as POST } from "@zcom/storefront-kit/server";
