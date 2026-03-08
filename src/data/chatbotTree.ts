import { ChatTree } from "@/src/types/chatbot";

export const chatbotTree: ChatTree = {
  start: {
    message: "Hello! How can I help you today?",
    options: [
      { label: "Services", next: "services" },
      { label: "Pricing", next: "pricing" },
      { label: "Contact Support", next: "support" },
      { label: "Book a Demo", next: "demo" }
    ]
  },

  services: {
    message: "Please choose a service category:",
    options: [
      { label: "Web Development", next: "web" },
      { label: "Mobile App Development", next: "mobile" },
      { label: "Consulting", next: "consulting" },
      { label: "Back", next: "start" }
    ]
  },

  pricing: {
    message: "Pricing depends on project requirements and scope.",
    options: [
      { label: "Request Quote", next: "support" },
      { label: "Back", next: "start" }
    ]
  },

  support: {
    message: "Please email support@smartassist.com",
    options: [
      { label: "Back", next: "start" }
    ]
  },

  demo: {
    message: "Our team will contact you to schedule a demo.",
    options: [
      { label: "Back", next: "start" }
    ]
  },

  web: {
    message: "We build responsive websites using modern technologies.",
    options: [
      { label: "Back", next: "services" }
    ]
  },

  mobile: {
    message: "We develop Android and iOS applications.",
    options: [
      { label: "Back", next: "services" }
    ]
  },

  consulting: {
    message: "We provide technical consulting and digital solutions.",
    options: [
      { label: "Back", next: "services" }
    ]
  }
};
