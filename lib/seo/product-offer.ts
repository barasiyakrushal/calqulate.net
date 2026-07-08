/**
 * Shared Product/Offer structured-data fragments so every Calqulate Vitals
 * landing page emits a complete merchant listing that satisfies Google's
 * Product rich-result requirements — namely the fields Search Console flags
 * when they're absent: `offers.validFrom`, `offers.hasMerchantReturnPolicy`,
 * and `offers.shippingDetails` (plus the required `image` on the Product,
 * which each page supplies with its own screenshot).
 *
 * Calqulate Vitals is a digital subscription, so delivery is instant and
 * free (modelled as a $0 shipping rate) and the return policy mirrors the
 * real 14-day money-back guarantee documented on /refund-policy.
 */

/** Offer "valid from" date — the service has been on sale since launch. */
export const OFFER_VALID_FROM = "2025-01-01";

/** Mirrors the real 14-day money-back guarantee on /refund-policy. */
export const CALQULATE_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "US",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
  url: "https://calqulate.net/refund-policy",
} as const;

/** Digital delivery: instant and free, expressed as a $0 shipping rate. */
export const DIGITAL_SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: "0",
    currency: "USD",
  },
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "US",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
  },
} as const;

/**
 * Enrichment fields to spread into any Offer / AggregateOffer so it clears the
 * "Improve item appearance" warnings for validFrom, return policy and shipping.
 */
export const OFFER_ENRICHMENT = {
  validFrom: OFFER_VALID_FROM,
  hasMerchantReturnPolicy: CALQULATE_RETURN_POLICY,
  shippingDetails: DIGITAL_SHIPPING_DETAILS,
} as const;
