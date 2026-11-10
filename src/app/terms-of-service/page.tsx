// The Zcom go-live check expects /terms-of-service; it shows the same terms as /terms
// (whose metadata keeps /terms as the canonical address)
export { default, generateMetadata } from "../terms/page";
