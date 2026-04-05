export const siteConfig = {
  name: "Generic Appt",
  fullName: "Generic Appointment Services",
  description: "Structured, evidence-based care designed for lasting relief.",
  nav: [
    { id: "hero", label: "Overview" },
    { id: "book", label: "Book Now" },
    { id: "trust", label: "Provider" },
    { id: "testimonials", label: "Results" },
    { id: "logistics", label: "What to Expect" },
  ],
  author: {
    name: "Dr. Jane Doe",
    title: "Lead Practitioner",
    initials: "JD",
    bio: "Focused on restoring movement, reducing pain, and supporting long-term performance.",
    fullBio: "A dedicated professional focused on structured, evidence-informed care for people who need predictable progress — not quick fixes.",
    image: "/placeholder-practitioner.jpg",
  },
  location: {
    city: "Your City",
    address: "123 Business St, City, State 12345",
  },
  contact: {
    phone: "(555) 000-0000",
    email: "hello@example.com",
  },
  calendly: {
    url: "https://calendly.com/michael-halloranai",
  },
  theme: {
    primary: "#0066FF",
  },
  credentials: [
    "Certified Practitioner",
    "Evidence-informed approach & rehab focus",
    "Experience with a wide range of client cases",
  ],
  services: [
    {
      id: "initial",
      name: "Initial Consultation",
      focus: "Comprehensive assessment, exam, and first treatment",
      duration: "30 min",
      idealFor: "New patients · First visit",
      frequency: "Most patients start with 1–2 visits in the first month.",
      price: "Starting at $140",
      calendlyUrl: "https://calendly.com/michael-halloranai/30min",
      stripePriceId: "price_1TIVC0Ln6dyiu6dtIQZOJUkh"
    },
    {
      id: "standard",
      name: "Standard Adjustment",
      focus: "Targeted spinal and joint adjustments for ongoing care",
      duration: "20 min",
      idealFor: "Returning patients · Maintenance care",
      frequency: "Often scheduled weekly, then tapered as symptoms improve.",
      price: "Starting at $80",
      calendlyUrl: "https://calendly.com/michael-halloranai/standard-adjustment",
      stripePriceId: "price_1TIVGpLn6dyiu6dt3suYJRWS"
    },
    {
      id: "mobility",
      name: "Mobility & Movement Session",
      focus: "Guided mobility work for problem areas and performance",
      duration: "30 min",
      idealFor: "Athletes · Active professionals",
      frequency: "Typically every 2–4 weeks during training blocks.",
      price: "Starting at $95",
      calendlyUrl: "https://calendly.com/michael-halloranai/mobility-movement-session",
      stripePriceId: "price_1TIVHgLn6dyiu6dtB6znTfZE"
    },
    {
      id: "posture",
      name: "Posture & Desk Relief Visit",
      focus: "Posture-focused care with ergonomic guidance",
      duration: "30 min",
      idealFor: "Desk workers · Hybrid/remote roles",
      frequency: "Commonly every 3–6 weeks depending on workload.",
      price: "Starting at $95",
      calendlyUrl: "https://calendly.com/michael-halloranai/posture-desk-relief-visit",
      stripePriceId: "price_1TIVIHLn6dyiu6dtvUcVfGcr"
    },
  ],
  approach: [
    { 
      title: "Assessment-first", 
      text: "Every plan starts with a detailed evaluation to understand your unique needs." 
    },
    { 
      title: "Evidence-based", 
      text: "Clear, structured treatment plans focused on long-term outcomes." 
    },
    { 
      title: "Patient-centered", 
      text: "Serving busy professionals and families with respect for their time." 
    },
  ]
};
