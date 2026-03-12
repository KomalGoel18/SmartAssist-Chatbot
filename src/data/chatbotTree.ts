export const chatbotTree = {
  start: {
    message: "Hello! How can I help you today?",
    options: [
      { label: "Services", next: "services" },
      { label: "Pricing", next: "pricing" },
      { label: "Contact Support", next: "support" },
      { label: "Book a Demo", next: "calendly" },
    ],
  },

  services: {
    message: "Choose a service you are interested in:",
    options: [
      { label: "Web Development", next: "web" },
      { label: "Mobile App Development", next: "mobile" },
      { label: "UI/UX Design", next: "design" },
      { label: "Maintenance", next: "maintenance" },
      { label: "Back", next: "start" },
    ],
  },

  web: {
    message: "We build responsive business websites, dashboards, and scalable web apps.",
    options: [
      { label: "Pricing", next: "pricing" },
      { label: "Book Demo", next: "calendly" },
      { label: "Back", next: "services" },
    ],
  },

  mobile: {
    message: "We develop Android, iOS, and cross-platform mobile applications.",
    options: [
      { label: "Pricing", next: "pricing" },
      { label: "Book Demo", next: "calendly" },
      { label: "Back", next: "services" },
    ],
  },

  design: {
    message: "We create modern UI/UX systems, prototypes, and product interfaces.",
    options: [
      { label: "Pricing", next: "pricing" },
      { label: "Book Demo", next: "calendly" },
      { label: "Back", next: "services" },
    ],
  },

  maintenance: {
    message: "We offer bug fixing, upgrades, monitoring, and technical maintenance.",
    options: [
      { label: "Pricing", next: "pricing" },
      { label: "Back", next: "services" },
    ],
  },

  pricing: {
    message: "Choose pricing category:",
    options: [
      { label: "Basic Plan", next: "basic" },
      { label: "Professional Plan", next: "pro" },
      { label: "Enterprise Plan", next: "enterprise" },
      { label: "Back", next: "start" },
    ],
  },

  basic: {
    message: "Basic Plan starts at ₹15,000 for starter projects.",
    options: [
      { label: "Book Demo", next: "calendly" },
      { label: "Back", next: "pricing" },
    ],
  },

  pro: {
    message: "Professional Plan starts at ₹50,000 for advanced projects.",
    options: [
      { label: "Book Demo", next: "calendly" },
      { label: "Back", next: "pricing" },
    ],
  },

  enterprise: {
    message: "Enterprise pricing is customized based on requirements.",
    options: [
      { label: "Book Demo", next: "calendly" },
      { label: "Back", next: "pricing" },
    ],
  },

  support: {
    message: "Choose support type:",
    options: [
      { label: "Technical Issue", next: "technical" },
      { label: "Sales Inquiry", next: "sales" },
      { label: "WhatsApp Support", next: "whatsapp" },
      { label: "Back", next: "start" },
    ],
  },

  technical: {
    message: "Our technical team usually responds within 24 hours.",
    options: [
      { label: "Back", next: "support" },
    ],
  },

  sales: {
    message: "Our sales team can guide you through service selection.",
    options: [
      { label: "Book Demo", next: "calendly" },
      { label: "Back", next: "support" },
    ],
  },

  whatsapp: {
    message: "WhatsApp support can be integrated here later.",
    options: [
      { label: "Back", next: "support" },
    ],
  },

  calendly: {
    message: "Opening booking calendar for your appointment.",
    options: [
      { label: "Back", next: "start" },
    ],
  },
};
