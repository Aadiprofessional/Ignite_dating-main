export interface Profile {
  id: string;
  name: string;
  username?: string;
  age: number;
  distance: number;
  bio: string;
  photos: string[];
  interests: string[];
  compatibility: number;
  job: string;
  education: string;
  city?: string;
  country?: string;
  universityName?: string;
  likedYou?: boolean;
  likedYouAt?: string;
  unlockedByMe?: boolean;
  verificationStatus?: string;
  unlockedVerification?: {
    userId?: string;
    universityId?: string;
    customUniversityName?: string | null;
    phoneNumber?: string;
    passingYear?: number;
    nickName?: string;
    instagramLink?: string;
    wechatLink?: string | null;
    xiaohongshuLink?: string | null;
  };
}

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 24,
    distance: 3,
    bio: "Adventure seeker & coffee enthusiast. Looking for someone to explore the city with. If you can make me laugh, you're already halfway there! ☕️✨",
    photos: [
      'https://randomuser.me/api/portraits/women/1.jpg',
      'https://randomuser.me/api/portraits/women/2.jpg',
      'https://randomuser.me/api/portraits/women/3.jpg'
    ],
    interests: ['Travel', 'Coffee', 'Photography'],
    compatibility: 92,
    job: 'Graphic Designer',
    education: 'Parsons School of Design'
  },
  {
    id: '2',
    name: 'Michael',
    age: 27,
    distance: 5,
    bio: "Tech founder by day, musician by night. love hiking and good conversations. Let's grab a drink and see where it goes. 🎸🏔️",
    photos: [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/men/2.jpg',
      'https://randomuser.me/api/portraits/men/3.jpg'
    ],
    interests: ['Music', 'Tech', 'Hiking'],
    compatibility: 88,
    job: 'Software Engineer',
    education: 'MIT'
  },
  {
    id: '3',
    name: 'Jessica',
    age: 23,
    distance: 2,
    bio: "Art lover and foodie. Always down for trying new restaurants. Swipe right if you like dogs! 🐶🎨",
    photos: [
      'https://randomuser.me/api/portraits/women/4.jpg',
      'https://randomuser.me/api/portraits/women/5.jpg',
      'https://randomuser.me/api/portraits/women/6.jpg'
    ],
    interests: ['Art', 'Foodie', 'Dogs'],
    compatibility: 95,
    job: 'Marketing Manager',
    education: 'NYU'
  },
  {
    id: '4',
    name: 'David',
    age: 29,
    distance: 8,
    bio: "Fitness junkie and travel addict. Been to 20 countries and counting. Looking for a travel buddy. ✈️💪",
    photos: [
      'https://randomuser.me/api/portraits/men/4.jpg',
      'https://randomuser.me/api/portraits/men/5.jpg',
      'https://randomuser.me/api/portraits/men/6.jpg'
    ],
    interests: ['Fitness', 'Travel', 'Cooking'],
    compatibility: 85,
    job: 'Personal Trainer',
    education: 'UCLA'
  },
  {
    id: '5',
    name: 'Emily',
    age: 25,
    distance: 4,
    bio: "Bookworm and nature lover. I spend my weekends hiking or reading in a cozy cafe. 📚🌿",
    photos: [
      'https://randomuser.me/api/portraits/women/7.jpg',
      'https://randomuser.me/api/portraits/women/8.jpg',
      'https://randomuser.me/api/portraits/women/9.jpg'
    ],
    interests: ['Reading', 'Nature', 'Yoga'],
    compatibility: 90,
    job: 'Editor',
    education: 'Columbia University'
  },
  {
    id: '6',
    name: 'James',
    age: 28,
    distance: 6,
    bio: "Chef and food critic. I make the best pasta you'll ever taste. Let's cook something together. 🍝🍷",
    photos: [
      'https://randomuser.me/api/portraits/men/7.jpg',
      'https://randomuser.me/api/portraits/men/8.jpg',
      'https://randomuser.me/api/portraits/men/9.jpg'
    ],
    interests: ['Cooking', 'Wine', 'Movies'],
    compatibility: 87,
    job: 'Chef',
    education: 'Culinary Institute of America'
  },
  {
    id: '7',
    name: 'Olivia',
    age: 22,
    distance: 1,
    bio: "Fashion student and aspiring designer. I love vintage shopping and rooftop bars. 👗🍸",
    photos: [
      'https://randomuser.me/api/portraits/women/10.jpg',
      'https://randomuser.me/api/portraits/women/11.jpg',
      'https://randomuser.me/api/portraits/women/12.jpg'
    ],
    interests: ['Fashion', 'Shopping', 'Nightlife'],
    compatibility: 93,
    job: 'Student',
    education: 'FIT'
  },
  {
    id: '8',
    name: 'Daniel',
    age: 30,
    distance: 10,
    bio: "Architect and urban explorer. I see beauty in the details. Looking for someone with a creative soul. 🏙️✏️",
    photos: [
      'https://randomuser.me/api/portraits/men/10.jpg',
      'https://randomuser.me/api/portraits/men/11.jpg',
      'https://randomuser.me/api/portraits/men/12.jpg'
    ],
    interests: ['Architecture', 'Design', 'Photography'],
    compatibility: 89,
    job: 'Architect',
    education: 'Cornell University'
  },
  {
    id: '9',
    name: 'Sophia',
    age: 26,
    distance: 7,
    bio: "Nurse and adrenaline junkie. I save lives by day and jump out of planes by weekend. 👩‍⚕️🪂",
    photos: [
      'https://randomuser.me/api/portraits/women/13.jpg',
      'https://randomuser.me/api/portraits/women/14.jpg',
      'https://randomuser.me/api/portraits/women/15.jpg'
    ],
    interests: ['Skydiving', 'Hiking', 'Medicine'],
    compatibility: 91,
    job: 'Nurse',
    education: 'Johns Hopkins'
  },
  {
    id: '10',
    name: 'William',
    age: 27,
    distance: 9,
    bio: "Financial analyst and amateur surfer. Work hard, play hard. Catch me at the beach on weekends. 🏄‍♂️💼",
    photos: [
      'https://randomuser.me/api/portraits/men/13.jpg',
      'https://randomuser.me/api/portraits/men/14.jpg',
      'https://randomuser.me/api/portraits/men/15.jpg'
    ],
    interests: ['Surfing', 'Finance', 'Beach'],
    compatibility: 86,
    job: 'Financial Analyst',
    education: 'Wharton'
  },
  {
    id: '11',
    name: 'Isabella',
    age: 24,
    distance: 3,
    bio: "Dancer and pilates instructor. Movement is my life. Looking for a partner who can keep up. 💃🧘‍♀️",
    photos: [
      'https://randomuser.me/api/portraits/women/16.jpg',
      'https://randomuser.me/api/portraits/women/17.jpg',
      'https://randomuser.me/api/portraits/women/18.jpg'
    ],
    interests: ['Dance', 'Pilates', 'Music'],
    compatibility: 94,
    job: 'Pilates Instructor',
    education: 'Juilliard'
  },
  {
    id: '12',
    name: 'Alexander',
    age: 29,
    distance: 12,
    bio: "Lawyer and history buff. I love a good debate and a fine whiskey. ⚖️🥃",
    photos: [
      'https://randomuser.me/api/portraits/men/16.jpg',
      'https://randomuser.me/api/portraits/men/17.jpg',
      'https://randomuser.me/api/portraits/men/18.jpg'
    ],
    interests: ['History', 'Debate', 'Whiskey'],
    compatibility: 84,
    job: 'Lawyer',
    education: 'Harvard Law'
  },
  {
    id: '13',
    name: 'Mia',
    age: 23,
    distance: 2,
    bio: "Photographer and dreamer. Capturing moments one click at a time. Let's make memories. 📷✨",
    photos: [
      'https://randomuser.me/api/portraits/women/19.jpg',
      'https://randomuser.me/api/portraits/women/20.jpg',
      'https://randomuser.me/api/portraits/women/21.jpg'
    ],
    interests: ['Photography', 'Travel', 'Art'],
    compatibility: 96,
    job: 'Photographer',
    education: 'RISD'
  },
  {
    id: '14',
    name: 'Lucas',
    age: 26,
    distance: 6,
    bio: "Engineer and gamer. Building the future and conquering virtual worlds. 🎮🔧",
    photos: [
      'https://randomuser.me/api/portraits/men/19.jpg',
      'https://randomuser.me/api/portraits/men/20.jpg',
      'https://randomuser.me/api/portraits/men/21.jpg'
    ],
    interests: ['Gaming', 'Coding', 'Sci-Fi'],
    compatibility: 88,
    job: 'Software Engineer',
    education: 'Stanford'
  },
  {
    id: '15',
    name: 'Charlotte',
    age: 25,
    distance: 4,
    bio: "Teacher and volunteer. I believe in kindness and making a difference. 🍎❤️",
    photos: [
      'https://randomuser.me/api/portraits/women/22.jpg',
      'https://randomuser.me/api/portraits/women/23.jpg',
      'https://randomuser.me/api/portraits/women/24.jpg'
    ],
    interests: ['Volunteering', 'Teaching', 'Reading'],
    compatibility: 91,
    job: 'Teacher',
    education: 'Vanderbilt'
  },
  {
    id: '16',
    name: 'Benjamin',
    age: 28,
    distance: 8,
    bio: "Doctor and pianist. Healing bodies and soothing souls. 🎹🩺",
    photos: [
      'https://randomuser.me/api/portraits/men/22.jpg',
      'https://randomuser.me/api/portraits/men/23.jpg',
      'https://randomuser.me/api/portraits/men/24.jpg'
    ],
    interests: ['Piano', 'Medicine', 'Classical Music'],
    compatibility: 89,
    job: 'Doctor',
    education: 'Yale Med'
  },
  {
    id: '17',
    name: 'Amelia',
    age: 24,
    distance: 5,
    bio: "Journalist and storyteller. Curious about everything and everyone. What's your story? 📰🎤",
    photos: [
      'https://randomuser.me/api/portraits/women/25.jpg',
      'https://randomuser.me/api/portraits/women/26.jpg',
      'https://randomuser.me/api/portraits/women/27.jpg'
    ],
    interests: ['Writing', 'News', 'Travel'],
    compatibility: 93,
    job: 'Journalist',
    education: 'Northwestern'
  },
  {
    id: '18',
    name: 'Henry',
    age: 31,
    distance: 15,
    bio: "Entrepreneur and visionary. Building the next big thing. Looking for a partner in crime. 🚀💼",
    photos: [
      'https://randomuser.me/api/portraits/men/25.jpg',
      'https://randomuser.me/api/portraits/men/26.jpg',
      'https://randomuser.me/api/portraits/men/27.jpg'
    ],
    interests: ['Startups', 'Business', 'Innovation'],
    compatibility: 83,
    job: 'CEO',
    education: 'Stanford GSB'
  },
  {
    id: '19',
    name: 'Harper',
    age: 22,
    distance: 2,
    bio: "Musician and free spirit. Music is my religion. Let's jam. 🎸🎶",
    photos: [
      'https://randomuser.me/api/portraits/women/28.jpg',
      'https://randomuser.me/api/portraits/women/29.jpg',
      'https://randomuser.me/api/portraits/women/30.jpg'
    ],
    interests: ['Music', 'Festivals', 'Vinyl'],
    compatibility: 95,
    job: 'Musician',
    education: 'Berklee'
  },
  {
    id: '20',
    name: 'Jack',
    age: 29,
    distance: 11,
    bio: "Pilot and explorer. The sky is not the limit. Come fly with me. ✈️🌍",
    photos: [
      'https://randomuser.me/api/portraits/men/28.jpg',
      'https://randomuser.me/api/portraits/men/29.jpg',
      'https://randomuser.me/api/portraits/men/30.jpg'
    ],
    interests: ['Aviation', 'Travel', 'Adventure'],
    compatibility: 87,
    job: 'Pilot',
    education: 'Embry-Riddle'
  }
];
