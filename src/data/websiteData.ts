export interface ServiceOption {
  id: string;
  name: string;
  tagline: string;
  description: string;
  startingPrice: string;
  features: string[];
  iconName: string;
  popular?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  popular?: boolean;
  features: string[];
  localEligible: boolean;
  outstationEligible: boolean;
  commission: string;
}

export interface Review {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  serviceUsed: string;
  comment: string;
  date: string;
}

export interface VehicleOption {
  type: string;
  description: string;
  multiplier: number;
  examples: string;
}

export const vehicleTypes: VehicleOption[] = [
  { type: 'Hatchback', description: 'Swift, i20, WagonR, Tiago', multiplier: 1.0, examples: 'Compact & ideal for quick city errands' },
  { type: 'Sedan', description: 'Dzire, City, Verna, Ciaz', multiplier: 1.15, examples: 'Comfortable sedan for corporate & airport travel' },
  { type: 'SUV / MUV', description: 'XUV700, Creta, Innova, Harrier', multiplier: 1.3, examples: 'Spacious for family outings & heavy luggage' },
  { type: 'Luxury / Premium', description: 'Camry, Fortuner, Mercedes, BMW', multiplier: 1.6, examples: 'Premium luxury vehicles & high-end automatics' },
];

export const servicesData: ServiceOption[] = [
  {
    id: 'local',
    name: 'Hourly Local Acting Driver',
    tagline: 'Professional verified drivers for city travel',
    description: 'Rent a professional acting driver by the hour for shopping, office commutes, night outs, or medical appointments in your own vehicle.',
    startingPrice: '₹400 / 2 Hours',
    iconName: 'Car',
    popular: true,
    features: [
      '24/7 On-demand dispatching within 15-25 mins',
      'Thoroughly background-checked & uniform clad',
      'Flexible hourly extensions (₹150/hr)',
      'Real-time GPS ride tracking & SOS support',
      'Night-time driving assistance & parking safety',
    ],
  },
  {
    id: 'outstation',
    name: 'Outstation Highway Driver',
    tagline: 'Experienced long-distance highway chauffeurs',
    description: 'Planning a road trip or weekend getaway? Hire our vetted outstation expert drivers to handle highway traffic and long drives safely.',
    startingPrice: '₹1,000 / 6 Hours',
    iconName: 'Navigation',
    popular: false,
    features: [
      'Experienced with high-speed highways & hilly terrains',
      'Transparent hourly rates (₹150/extra hr) + allowances',
      'Zero fatigue driving for family vacation peace-of-mind',
      'Night-drive qualified with 5+ years experience',
      'Covers multi-day round trips across state borders',
    ],
  },
  {
    id: 'valet',
    name: 'Luxury Event Valet Parking',
    tagline: 'End-to-end valet management for weddings & events',
    description: 'Impress your guests with uniformed, courteous, and highly trained valet personnel for weddings, corporate summits, and private galas.',
    startingPrice: '₹150 / Staff / Hr',
    iconName: 'Crown',
    popular: false,
    features: [
      'Trained uniformed staff with professional etiquette',
      'Key tag management & secure key storage system',
      'Dedicated Event Supervisor on-site',
      'Customized directional signage & parking assistance',
      '100% vehicle safety guarantee with insurance coverage',
    ],
  },
];

export const driverSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-monthly-pass',
    name: 'Driver Monthly Pass',
    price: 999,
    period: 'per month',
    description: 'Unlimited booking requests with 0% platform commission surcharge on completed rides.',
    popular: true,
    localEligible: true,
    outstationEligible: true,
    commission: '0% Surcharge',
    features: [
      'Unlimited Local & Outstation Ride Dispatches',
      'Instant Priority Dispatch Matching in high-demand zones',
      'Zero Commission Surcharge on completed trips',
      'Dedicated 24/7 Driver Support & Emergency Helpline',
      'Free Uniform & Digital Driver Badge Verification',
    ],
  },
];

export const customerReviews: Review[] = [
  {
    id: 'rev-1',
    name: 'Aarav Sharma',
    role: 'Tech Lead, Indiranagar',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    serviceUsed: 'Local Hourly Driver',
    comment: 'Booked a driver for a late-night dinner in Koramangala. The driver Vikram arrived 10 mins early, was polite, and drove my Mahindra XUV700 smoothly. Excellent service!',
    date: 'Yesterday',
  },
  {
    id: 'rev-2',
    name: 'Priya Sundaram',
    role: 'Corporate VP, Whitefield',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    serviceUsed: 'Outstation Highway Driver',
    comment: 'Hired Suresh for a 3-day family weekend trip to Coorg. He handled mountain roads effortlessly and was super courteous. Zero fatigue for us!',
    date: '3 days ago',
  },
  {
    id: 'rev-3',
    name: 'Event Management Team',
    role: 'The Leela Palace Events',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    serviceUsed: 'Luxury Event Valet',
    comment: 'We contracted 10 valet staff from DrivePulse for a grand wedding reception with 500+ guests. Parking execution was flawless with zero delays. Highly recommended!',
    date: '1 week ago',
  },
];

export const faqsList = [
  {
    question: 'How quickly can a driver arrive after I book?',
    answer: 'For Local Hourly bookings in Bangalore metro areas (Indiranagar, Koramangala, Whitefield, MG Road, etc.), drivers typically arrive at your pickup location within 15 to 25 minutes of booking.',
  },
  {
    question: 'Are all your drivers background checked and verified?',
    answer: 'Yes! Every driver undergoes a strict 5-point verification process including Aadhaar authentication, Commercial Driving License check, police background verification, address validation, and driving skill assessment.',
  },
  {
    question: 'How are outstation charges calculated?',
    answer: 'Outstation trips start at a base rate of ₹1,000 for the first 6 hours (plus ₹150 per additional hour) + driver food allowance of ₹300 per 12 hours. For overnight trips, a night stay allowance of ₹400 applies.',
  },
  {
    question: 'Can I hire valet staff for private events or weddings?',
    answer: 'Absolutely! Our Valet Management service supplies trained, uniformed valets with an on-site supervisor, key-tag tracking system, and full insurance coverage. You can request a custom quote or calculate pricing instantly on our site.',
  },
  {
    question: 'How do drivers join the DrivePulse platform?',
    answer: 'Drivers can sign up through our Driver Onboarding portal, submit required ID & DL documents, choose a zero-commission subscription pass (e.g. ₹999/mo), and get approved by our admin team within 24 hours.',
  },
];

export const pricingConfigAdmin = {
  local: {
    basePrice: 400,
    minDurationHours: 2,
    additionalHourPrice: 150,
    nightCharge: 250,
    taxPercent: 18,
  },
  outstation: {
    basePrice: 2000,
    perDayRate: 1800,
    driverFoodAllowancePerDay: 300,
    nightAllowancePerNight: 400,
    taxPercent: 18,
  },
  valet: {
    pricePerStaffPerHour: 150,
    minStaffRequirement: 2,
    minDurationHours: 3,
    taxPercent: 18,
  },
};
