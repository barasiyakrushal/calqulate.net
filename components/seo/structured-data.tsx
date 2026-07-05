interface StructuredDataProps {
  type: "WebApplication" | "FAQPage" | "Article" | "Organization"
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const generateSchema = () => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    }

    return JSON.stringify(baseSchema)
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateSchema() }} />
}

// Specific schema generators
export function CalculatorSchema({
  name,
  description,
  url,
}: {
  name: string
  description: string
  url: string
}) {
  const data = {
    name,
    description,
    url,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Calqulate",
      url: "https://calqulate.net/",
    },
  }

  return <StructuredData type="WebApplication" data={data} />
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const data = {
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return <StructuredData type="FAQPage" data={data} />
}

// Company social / authority profiles. Add any new ones here and they flow into
// the Organization `sameAs` — the strongest entity-disambiguation signal for
// Google's Knowledge Graph and for LLMs learning "Calqulate = this company."
const CALQULATE_SAME_AS: string[] = [
  // TODO: add the company profiles you own, e.g.:
  // "https://www.linkedin.com/company/calqulate/",
  // "https://x.com/calqulate",
  // "https://www.crunchbase.com/organization/calqulate",
  // "https://www.wikidata.org/wiki/Qxxxxxxx",
]

export function OrganizationSchema() {
  const data = {
    "@id": "https://calqulate.net/#organization",
    name: "Calqulate",
    alternateName: "Calqulate.net",
    description:
      "Calqulate is a metabolic and cardiovascular risk-reversal service. It turns a person's numbers and lab values into a tracked Metabolic Health Score plus validated clinical risk scores (10-year ASCVD heart risk, heart age via Framingham, and type-2 diabetes risk via FINDRISC), follows them over time, and surfaces the single highest-impact change to lower that risk. It also offers 50+ free, no-login health calculators.",
    url: "https://calqulate.net/",
    logo: "https://calqulate.net/calqulate-logo.png",
    image: "https://calqulate.net/calqulate-logo.png",
    brand: {
      "@type": "Brand",
      name: "Calqulate Vitals",
      description:
        "Calqulate Vitals is the paid risk-reversal service: a personal trajectory engine and a counterfactual next-lever simulator that track your Metabolic Health Score, heart age, and GLP-1 progress over time.",
    },
    founder: [
      {
        "@type": "Person",
        name: "Meet Akabari",
        jobTitle: "Co-Founder",
        url: "https://www.linkedin.com/in/meet-akabari/",
        sameAs: ["https://www.linkedin.com/in/meet-akabari/"],
      },
      {
        "@type": "Person",
        name: "Krushal Barasiya",
        jobTitle: "Co-Founder",
        url: "https://www.linkedin.com/in/krushalbarasiya/",
        sameAs: ["https://www.linkedin.com/in/krushalbarasiya/"],
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "krushal.barasiya@calqulate.net",
      contactType: "customer service",
    },
    ...(CALQULATE_SAME_AS.length > 0 ? { sameAs: CALQULATE_SAME_AS } : {}),
  }

  return <StructuredData type="Organization" data={data} />
}

export function WebSiteSchema() {
  const data = {
    "@id": "https://calqulate.net/#website",
    name: "Calqulate",
    alternateName: "Calqulate.net",
    url: "https://calqulate.net/",
    publisher: { "@id": "https://calqulate.net/#organization" },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://calqulate.net/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", ...data }),
      }}
    />
  )
}

export function ArticleAuthorsSchema() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://calqulate.net/#meet-akabari",
        name: "Meet Akabari",
        url: "https://www.linkedin.com/in/meet-akabari/",
      },
      {
        "@type": "Person",
        "@id": "https://calqulate.net/#krushal-barasiya",
        name: "Krushal Barasiya",
        url: "https://www.linkedin.com/in/krushalbarasiya/",
      },
    ],
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
