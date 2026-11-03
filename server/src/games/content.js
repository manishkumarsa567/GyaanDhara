import { RURAL_MISSIONS } from './ruralMissions.js';
import { FARM_SIMULATION } from './farmSimulation.js';
import { generateMathSpeedQuestions } from './mathSpeed.js';

/**
 * Educational game content for GyaanDhara's shared-engine catalog.
 * Shuffles options dynamically so answers are uniformly distributed across A, B, C, D (no 'B' bias).
 */

/** Fisher-Yates option shuffle to randomize option positions and update answer index */
export function shuffleQuestionOptions(item) {
  if (!item || !Array.isArray(item.options) || item.options.length <= 1) return item;
  const correctText = item.options[item.answer];
  const indexed = item.options.map((opt, i) => ({ opt, isCorrect: i === item.answer }));

  // Fisher-Yates shuffle
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }

  const newAnswer = indexed.findIndex((x) => x.isCorrect);
  return {
    ...item,
    options: indexed.map((x) => x.opt),
    answer: newAnswer >= 0 ? newAnswer : 0,
  };
}

const CONTENT = {
  quiz: {
    default: [
      { q: 'What is 7 × 8?', options: ['54', '56', '58', '64'], answer: 1 },
      { q: 'What is the capital of India?', options: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'], answer: 0 },
      { q: 'Which is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], answer: 2 },
      { q: 'What is 2 + 2 × 3?', options: ['12', '8', '10', '6'], answer: 1 },
      { q: 'Chemical formula of water is?', options: ['CO2', 'NaCl', 'O2', 'H2O'], answer: 3 },
      { q: 'How many continents are there on Earth?', options: ['5', '6', '7', '8'], answer: 2 },
      { q: 'Which gas do plants absorb during photosynthesis?', options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], answer: 0 },
      { q: 'What is 15% of 200?', options: ['25', '30', '35', '40'], answer: 1 },
      { q: 'Which organ pumps blood in human body?', options: ['Lungs', 'Brain', 'Heart', 'Kidney'], answer: 2 },
      { q: 'Light travels fastest through which medium?', options: ['Vacuum', 'Water', 'Glass', 'Air'], answer: 0 },
      { q: 'What is 144 ÷ 12?', options: ['11', '12', '13', '14'], answer: 1 },
      { q: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 2 },
    ],
    'quick-quiz-blitz': [
      { q: 'What is 9 × 9?', options: ['72', '81', '89', '90'], answer: 1 },
      { q: 'Which animal is known as the Ship of the Desert?', options: ['Horse', 'Camel', 'Elephant', 'Bullock'], answer: 1 },
      { q: 'How many days are there in a leap year?', options: ['364', '365', '366', '367'], answer: 2 },
      { q: 'What is the square root of 64?', options: ['6', '7', '8', '9'], answer: 2 },
      { q: 'Which state in India is known as the Tea Garden?', options: ['Punjab', 'Assam', 'Rajasthan', 'Gujarat'], answer: 1 },
      { q: 'What is 250 + 175?', options: ['425', '415', '435', '405'], answer: 0 },
      { q: 'Boiling point of pure water at sea level is?', options: ['90°C', '95°C', '100°C', '110°C'], answer: 2 },
      { q: 'Who wrote the Indian National Anthem?', options: ['Rabindranath Tagore', 'Bankim Chandra', 'Sarojini Naidu', 'Subhash Chandra Bose'], answer: 0 },
      { q: 'What is 1000 - 365?', options: ['645', '635', '625', '655'], answer: 1 },
      { q: 'Which sense organ helps us balance our body?', options: ['Eyes', 'Ear', 'Nose', 'Tongue'], answer: 1 },
    ],
    'fraction-compare': [
      { q: 'Which fraction is larger: 3/4 or 2/3?', options: ['3/4', '2/3', 'They are equal', 'Cannot determine'], answer: 0 },
      { q: 'What is 1/2 + 1/4?', options: ['2/6', '3/4', '1/3', '2/4'], answer: 1 },
      { q: 'Which fraction is equivalent to 2/5?', options: ['4/10', '3/10', '4/15', '5/2'], answer: 0 },
      { q: 'Which is smaller: 1/8 or 1/6?', options: ['1/6', '1/8', 'Equal', 'Neither'], answer: 1 },
      { q: 'Simplify the fraction 12/16:', options: ['2/3', '3/4', '4/5', '1/2'], answer: 1 },
      { q: 'What is 3/5 - 1/5?', options: ['2/5', '2/10', '4/5', '1/5'], answer: 0 },
      { q: 'Which fraction represents half a dozen out of 24?', options: ['6/24 or 1/4', '12/24 or 1/2', '8/24 or 1/3', '3/24 or 1/8'], answer: 0 },
      { q: 'What is 1/3 × 3/4?', options: ['1/4', '4/7', '3/12', '1/2'], answer: 0 },
    ],
    'geometry-shapes': [
      { q: 'How many sides does a hexagon have?', options: ['5', '6', '7', '8'], answer: 1 },
      { q: 'What is the sum of interior angles in a triangle?', options: ['90°', '180°', '360°', '270°'], answer: 1 },
      { q: 'A polygon with 8 sides is called a?', options: ['Pentagon', 'Heptagon', 'Octagon', 'Decagon'], answer: 2 },
      { q: 'How many right angles are in a rectangle?', options: ['2', '3', '4', '1'], answer: 2 },
      { q: 'A triangle with all 3 sides equal is called?', options: ['Isosceles', 'Scalene', 'Equilateral', 'Right-angled'], answer: 2 },
      { q: 'Perimeter of a square of side 5 cm is?', options: ['20 cm', '25 cm', '15 cm', '10 cm'], answer: 0 },
      { q: 'Area of a rectangle of length 8 m and width 4 m is?', options: ['24 m²', '32 m²', '16 m²', '12 m²'], answer: 1 },
      { q: 'A circle has how many corners (vertices)?', options: ['0', '1', '2', 'Infinite'], answer: 0 },
    ],
    'measurement-convert': [
      { q: 'How many meters are in 1 kilometer?', options: ['100 m', '500 m', '1000 m', '10000 m'], answer: 2 },
      { q: 'How many grams are in 2.5 kilograms?', options: ['250 g', '2500 g', '25000 g', '25 g'], answer: 1 },
      { q: 'How many milliliters are in 1 liter?', options: ['10 ml', '100 ml', '1000 ml', '500 ml'], answer: 2 },
      { q: 'How many centimeters are in 3 meters?', options: ['30 cm', '300 cm', '3000 cm', '3 cm'], answer: 1 },
      { q: 'How many minutes are in 2 hours and 30 minutes?', options: ['120 min', '150 min', '180 min', '230 min'], answer: 1 },
      { q: '1 Quintal is equal to how many kilograms in Indian agriculture?', options: ['50 kg', '100 kg', '500 kg', '1000 kg'], answer: 1 },
    ],
    'clock-reading': [
      { q: 'When both hands point at 12, what time is it?', options: ['12:00', '6:00', '12:30', '1:00'], answer: 0 },
      { q: 'If hour hand is on 3 and minute hand is on 6, time is?', options: ['3:00', '3:30', '3:15', '3:45'], answer: 1 },
      { q: 'How many degrees does the minute hand turn in 15 minutes?', options: ['45°', '60°', '90°', '180°'], answer: 2 },
      { q: 'Quarter past 4 in digital format is?', options: ['4:15', '4:30', '4:45', '4:25'], answer: 0 },
      { q: 'How many seconds are in 5 minutes?', options: ['250 s', '300 s', '360 s', '500 s'], answer: 1 },
    ],
    'odd-one-out': [
      { q: 'Find the odd one out: 2, 4, 6, 9, 10', options: ['4', '6', '9', '10'], answer: 2 },
      { q: 'Find the odd one out: Square, Circle, Rectangle, Rhombus', options: ['Square', 'Circle', 'Rectangle', 'Rhombus'], answer: 1 },
      { q: 'Find the odd one out: Wheat, Rice, Cotton, Maize', options: ['Wheat', 'Rice', 'Cotton (cash crop)', 'Maize'], answer: 2 },
      { q: 'Find the odd one out: Dog, Cat, Cow, Tiger', options: ['Dog', 'Cat', 'Cow', 'Tiger (wild)'], answer: 3 },
      { q: 'Find the odd one out: Monitor, Keyboard, Mouse, Scanner', options: ['Monitor (output)', 'Keyboard', 'Mouse', 'Scanner'], answer: 0 },
    ],
    'estimation-challenge': [
      { q: 'Estimate 49 × 21 by rounding to nearest tens:', options: ['800', '1000', '1200', '1500'], answer: 1 },
      { q: 'Estimate 487 + 312 to nearest hundred:', options: ['700', '800', '900', '1000'], answer: 1 },
      { q: 'If a cow gives 8.8 liters of milk daily, estimate for 7 days:', options: ['40 L', '63 L', '80 L', '100 L'], answer: 1 },
      { q: 'Estimate 995 ÷ 52 to nearest ten:', options: ['10', '20', '30', '50'], answer: 1 },
    ],
    'internet-safety': [
      { q: 'Should you share your login passwords or OTP with strangers or friends?', options: ['Yes, if they ask politely', 'No, never share passwords or OTP', 'Only share on weekends', 'Share if they claim to be from bank'], answer: 1 },
      { q: 'Before clicking unknown links in SMS or WhatsApp, what should you do?', options: ['Click immediately', 'Verify sender and do not click suspicious links', 'Forward to everyone', 'Download any attached files'], answer: 1 },
      { q: 'What makes a strong password?', options: ['Your name and 123', 'A mix of letters, numbers, and symbols', 'Your birthday', 'Password123'], answer: 1 },
      { q: 'What should you do after using a public or shared computer in a cyber cafe or school?', options: ['Just close the window', 'Log out of all accounts and clear history', 'Leave account open for next student', 'Save your password in the browser'], answer: 1 },
      { q: 'Someone online offers free phone recharges in exchange for your Aadhaar details. What do you do?', options: ['Send Aadhaar details immediately', 'Ignore and report the scam; never share personal IDs', 'Share family members details too', 'Pay a small fee to claim it'], answer: 1 },
      { q: 'Which website address indicator shows a secure encrypted connection?', options: ['http://', 'https:// with padlock icon', 'www.only', 'ftp://'], answer: 1 },
    ],
    'village-panchayat-quiz': [
      { q: 'Who is the constitutional head of the Gram Panchayat?', options: ['Sarpanch / Pradhan', 'District Collector', 'City Mayor', 'Tehsildar'], answer: 0 },
      { q: 'Who are the members of the Gram Sabha in a village?', options: ['Only village elders', 'All adult registered voters of the village', 'Only school teachers', 'Only landowners'], answer: 1 },
      { q: 'What is the minimum voting age for Panchayat elections in India?', options: ['16 years', '18 years', '21 years', '25 years'], answer: 1 },
      { q: 'Which constitutional amendment established the Panchayati Raj System in India?', options: ['42nd Amendment', '44th Amendment', '73rd Amendment', '86th Amendment'], answer: 2 },
      { q: 'What is the main responsibility of the Gram Panchayat?', options: ['Collecting national income tax', 'Village development, water, sanitation, and streetlights', 'Conducting military drills', 'Issuing passports'], answer: 1 },
      { q: 'What is the tenure of an elected Gram Panchayat in India?', options: ['3 years', '4 years', '5 years', '6 years'], answer: 2 },
      { q: 'How many tiers are there in the Panchayati Raj System in India?', options: ['Two-tier', 'Three-tier (Gram, Block, Zilla)', 'Four-tier', 'Single-tier'], answer: 1 },
    ],
    'agriculture-quiz': [
      { q: 'Which season is the Kharif crop sown in India?', options: ['Winter (Nov-Dec)', 'Onset of Monsoon (June-July)', 'Spring (Feb-Mar)', 'Peak Summer'], answer: 1 },
      { q: 'Which of the following is a Rabi crop in India?', options: ['Rice', 'Cotton', 'Wheat', 'Jowar'], answer: 2 },
      { q: 'Drip irrigation is most effective because it?', options: ['Uses floodwater', 'Delivers water directly to plant roots saving up to 60% water', 'Requires no pipes', 'Works only in rain'], answer: 1 },
      { q: 'Which micro-organism in legume root nodules fixes atmospheric nitrogen?', options: ['Rhizobium', 'Yeast', 'Penicillium', 'Amoeba'], answer: 0 },
      { q: 'What is crop rotation and why is it beneficial?', options: ['Planting same crop always', 'Alternating different crops to maintain soil fertility', 'Harvesting crops only at night', 'Rotating tractors in field'], answer: 1 },
      { q: 'Vermicompost is prepared using which organisms?', options: ['Earthworms', 'Honeybees', 'Frogs', 'Locusts'], answer: 0 },
    ],
    'environment-champions': [
      { q: 'What are the 3 R’s of environmental protection?', options: ['Run, Read, Rest', 'Reduce, Reuse, Recycle', 'Repair, Rebuild, React', 'Rain, River, Reservoir'], answer: 1 },
      { q: 'Which gas in the atmosphere protects Earth from harmful ultraviolet (UV) rays?', options: ['Oxygen', 'Carbon Dioxide', 'Ozone', 'Methane'], answer: 2 },
      { q: 'Which renewable energy source uses flowing river water to produce electricity?', options: ['Hydroelectric energy', 'Solar energy', 'Nuclear energy', 'Coal thermal'], answer: 0 },
      { q: 'Chipko Movement in India was started to protect which natural resource?', options: ['Rivers', 'Forests and trees', 'Coal mines', 'Ocean corals'], answer: 1 },
      { q: 'Which energy source generates zero carbon emissions during power generation?', options: ['Coal', 'Diesel generators', 'Solar panels', 'Kerosene lamps'], answer: 2 },
    ],
    'freedom-fighters': [
      { q: 'Who is revered as the "Father of the Nation" in India?', options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Sardar Patel', 'Bhagat Singh'], answer: 0 },
      { q: 'Who gave the famous slogan "Give me blood, and I will give you freedom!"?', options: ['Subhas Chandra Bose', 'Chandrashekhar Azad', 'Lala Lajpat Rai', 'Bal Gangadhar Tilak'], answer: 0 },
      { q: 'Who was known as the "Iron Man of India"?', options: ['Sardar Vallabhbhai Patel', 'B.R. Ambedkar', 'Bhagat Singh', 'Rajendra Prasad'], answer: 0 },
      { q: 'Who was the chief architect and chairman of the Constitution Drafting Committee?', options: ['Dr. B.R. Ambedkar', 'Dr. Rajendra Prasad', 'Sarojini Naidu', 'Maulana Azad'], answer: 0 },
      { q: 'In which year did India gain independence from British rule?', options: ['1942', '1947', '1950', '1952'], answer: 1 },
    ],
    'map-skills': [
      { q: 'Which ocean lies to the south of India?', options: ['Atlantic Ocean', 'Pacific Ocean', 'Indian Ocean', 'Arctic Ocean'], answer: 2 },
      { q: 'The Tropic of Cancer passes through how many Indian states?', options: ['6', '7', '8', '9'], answer: 2 },
      { q: 'Which mountain range guards the northern border of India?', options: ['Aravalli', 'Western Ghats', 'Himalayas', 'Vindhyas'], answer: 2 },
      { q: 'Which sea lies to the west of peninsular India?', options: ['Bay of Bengal', 'Arabian Sea', 'Red Sea', 'Caspian Sea'], answer: 1 },
    ],
    'health-hygiene': [
      { q: 'Proper handwashing with soap should last at least how many seconds?', options: ['5 seconds', '20 seconds', '60 seconds', '2 minutes'], answer: 1 },
      { q: 'Which vitamin is synthesized by our skin in morning sunlight?', options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], answer: 3 },
      { q: 'Stagnant water near houses should be cleared to prevent breeding of?', options: ['Butterflies', 'Mosquitoes (Malaria/Dengue)', 'House sparrows', 'Earthworms'], answer: 1 },
      { q: 'Which mineral is essential for strong bones and teeth?', options: ['Iron', 'Calcium', 'Iodine', 'Sodium'], answer: 1 },
    ],
    'riddle-master': [
      { q: 'I have keys but open no locks. I have space but no room. You can enter but cannot go outside. What am I?', options: ['A piano', 'A computer keyboard', 'A locked chest', 'A spaceship'], answer: 1 },
      { q: 'What gets wetter the more it dries?', options: ['A sponge', 'A towel', 'A water cloud', 'A rain puddle'], answer: 1 },
      { q: 'What has a head and a tail, but no body?', options: ['A coin', 'A snake', 'A book', 'A pin'], answer: 0 },
      { q: 'What has hands but cannot clap?', options: ['A clock', 'A glove', 'A robot', 'A statue'], answer: 0 },
      { q: 'What runs all around a backyard yet never moves?', options: ['A garden fence', 'A dog', 'A hose pipe', 'A lawn mower'], answer: 0 },
    ],
    'brain-riddles': [
      { q: 'What comes once in a minute, twice in a moment, but never in a thousand years?', options: ['The letter M', 'A breath', 'A second', 'The letter O'], answer: 0 },
      { q: 'Forward I am heavy, but backward I am not. What am I?', options: ['The word TON', 'A boulder', 'A truck', 'A magnet'], answer: 0 },
      { q: 'If you have it, you want to share it. If you share it, you do not have it. What is it?', options: ['A secret', 'Money', 'Food', 'A book'], answer: 0 },
      { q: 'What has words but never speaks?', options: ['A book', 'A mirror', 'A television', 'A river'], answer: 0 },
    ],
    'listening-comprehension': [
      { q: 'In the sentence "The diligent farmer irrigated his crops before sunrise", who is performing the action?', options: ['The crops', 'The sunrise', 'The farmer', 'The water'], answer: 2 },
      { q: 'Choose the sentence with correct punctuation and capitalization:', options: ['where is the school library.', 'Where is the school library?', 'where Is the school Library!', 'Where is the school library.'], answer: 1 },
      { q: 'What is the main purpose of an index in a textbook?', options: ['To show author photo', 'To list topics alphabetically with page numbers', 'To list school holidays', 'To provide quiz answers'], answer: 1 },
    ],
    'monsoon-irrigation-quest': [
      { q: 'Which irrigation system delivers water directly to the plant roots, saving up to 60% water?', options: ['Flood irrigation', 'Drip irrigation', 'Open canal flooding', 'Rain gun flooding'], answer: 1 },
      { q: 'What is a Check Dam built across small seasonal streams primarily used for?', options: ['To stop fish swimming', 'To harvest rainwater and recharge groundwater', 'To dump village waste', 'To block village roads'], answer: 1 },
      { q: 'Which time of day is best for watering crops to minimize evaporation losses?', options: ['Early morning or late evening', 'Mid-day at 12 PM', 'When sun is hottest at 2 PM', 'Midnight only'], answer: 0 },
      { q: 'Rooftop rainwater harvesting in rural schools directly recharges which water resource?', options: ['Sea water', 'Local aquifer / borewell table', 'Glaciers', 'Distant dams'], answer: 1 },
      { q: 'What does a Tensiometer measure in agricultural fields?', options: ['Soil moisture tension', 'Air pollution', 'Wind speed', 'Crop height'], answer: 0 },
    ],
    'harvest-market-math': [
      { q: 'If a farmer harvests 40 bags of wheat, each weighing 50 kg, what is the total harvest in quintals? (1 quintal = 100 kg)', options: ['10 quintals', '20 quintals', '25 quintals', '40 quintals'], answer: 1 },
      { q: 'A seed packet recommends 25 kg of seed per acre. How many kg are needed for a 4-acre field?', options: ['75 kg', '100 kg', '125 kg', '150 kg'], answer: 1 },
      { q: 'A farmer sells 15 quintals of mustard at the MSP of ₹5,650 per quintal. What is the gross revenue?', options: ['₹78,450', '₹84,750', '₹92,100', '₹85,000'], answer: 1 },
      { q: 'A tractor trolley carries 60 bags of potatoes of 50 kg each. What is the total load in metric tonnes? (1 tonne = 1,000 kg)', options: ['2 tonnes', '3 tonnes', '4 tonnes', '5 tonnes'], answer: 1 },
      { q: 'If storing grain in a metal silo reduces post-harvest loss from 15% to 3% on a 100-quintal harvest, how many quintals are saved?', options: ['5 quintals', '8 quintals', '12 quintals', '18 quintals'], answer: 2 },
    ],
    'kisan-credit-card-math': [
      { q: 'What is the subsidized interest rate on a Kisan Credit Card (KCC) crop loan with prompt repayment?', options: ['4% per annum', '7% per annum', '12% per annum', '18% per annum'], answer: 0 },
      { q: 'A farmer avails a KCC loan of ₹50,000. With prompt repayment at 4% annual interest, how much interest is paid after 1 year?', options: ['₹1,500', '₹2,000', '₹2,500', '₹4,000'], answer: 1 },
      { q: 'KCC loans protect farmers by avoiding the exorbitant interest of informal moneylenders, which often exceeds what rate?', options: ['5% - 8%', '24% - 36% or more', '1% - 2%', '0%'], answer: 1 },
      { q: 'Under KCC guidelines, what maximum collateral-free agricultural loan limit is granted to small farmers?', options: ['₹50,000', '₹1,00,000', '₹1,60,000', '₹5,00,000'], answer: 2 },
      { q: 'Which official document is required by banks to verify land ownership for KCC loan limits?', options: ['Ration card', 'Land Patta / Khasra-Khatauni record', 'Train ticket', 'Electricity bill'], answer: 1 },
    ],
    'shg-savings-circle': [
      { q: 'A Self-Help Group (SHG / Mahila Bachat Gat) typically consists of how many neighborhood members?', options: ['2 to 3 members', '10 to 20 members', '100 to 200 members', '500 members'], answer: 1 },
      { q: 'If 15 SHG members each contribute ₹100 every month, what is the pooled monthly group savings?', options: ['₹1,000', '₹1,500', '₹2,000', '₹3,000'], answer: 1 },
      { q: 'What is the primary advantage of internal lending within an SHG for family medical or school needs?', options: ['Low interest set democratically without collateral', 'No repayment ever required', 'Given only to bank officers', 'Requires mortgaging house'], answer: 0 },
      { q: 'Under the Deendayal Antyodaya Yojana - NRLM, what support helps SHGs scale micro-enterprises?', options: ['Revolving Fund and Bank Credit Linkage', 'Free lottery tickets', 'Gambling tokens', 'Stock market day trading'], answer: 0 },
      { q: 'Which record-keeping tool must be maintained transparently at every SHG meeting?', options: ['Meeting Register and Member Passbooks', 'Private hidden diary', 'Old newspaper', 'Television guide'], answer: 0 },
    ],
    'simple-interest-haat': [
      { q: 'Calculate Simple Interest: Principal = ₹2,000, Rate = 5% per year, Time = 2 years. (SI = P × R × T / 100)', options: ['₹100', '₹200', '₹300', '₹400'], answer: 1 },
      { q: 'A village potter borrows ₹5,000 for raw clay at 6% simple interest for 1 year. What is the total repayment (P + SI)?', options: ['₹5,100', '₹5,300', '₹5,600', '₹6,000'], answer: 1 },
      { q: 'If ₹1,000 earns ₹80 simple interest in 1 year, what is the annual interest rate?', options: ['4%', '6%', '8%', '10%'], answer: 2 },
      { q: 'A vegetable vendor repays ₹3,360 on a ₹3,000 loan taken for 2 years. What was the simple interest paid?', options: ['₹180', '₹360', '₹400', '₹600'], answer: 1 },
      { q: 'Which formula calculates the total amount to be repaid on a simple interest loan?', options: ['Amount = Principal + Interest', 'Amount = Principal − Interest', 'Amount = Interest ÷ Principal', 'Amount = Rate × Time'], answer: 0 },
    ],
    'bardoli-farmers-revolt': [
      { q: 'The historic Bardoli Satyagraha of 1928 took place in which Indian state?', options: ['Punjab', 'Gujarat', 'Bihar', 'Maharashtra'], answer: 1 },
      { q: 'Who led the Bardoli peasant struggle against unjust 22% British land tax increases?', options: ['Sardar Vallabhbhai Patel', 'Bal Gangadhar Tilak', 'Bhagat Singh', 'Subhash Chandra Bose'], answer: 0 },
      { q: 'Who conferred the revered title of "Sardar" (Leader) upon Vallabhbhai Patel during the Bardoli movement?', options: ['The British Governor', 'The peasant women of Bardoli', 'The Viceroy', 'The London Parliament'], answer: 1 },
      { q: 'How did the farmers of Bardoli peacefully protest against the British tax hike?', options: ['Non-violent refusal to pay tax despite land forfeiture threats', 'Attacking government buildings', 'Abandoning their villages permanently', 'Refusing to eat food'], answer: 0 },
      { q: 'What was the historic victory outcome of the Bardoli Satyagraha?', options: ['Taxes were increased further', 'The government rolled back the hike and reduced tax to 6.03%', 'Farmers lost all their lands', 'The movement collapsed'], answer: 1 },
    ],
  },
  true_false: {
    default: [
      { q: 'The Sun is a star at the center of our solar system.', answer: true },
      { q: 'Sound travels faster through air than through solid steel.', answer: false },
      { q: 'There are 8 recognized planets in our solar system.', answer: true },
      { q: 'All birds are capable of flying.', answer: false },
      { q: 'Water expands when it freezes into ice.', answer: true },
      { q: 'Humans have 4 chambers in their heart.', answer: true },
      { q: 'Plants produce oxygen during photosynthesis in sunlight.', answer: true },
      { q: 'A light year is a measure of time, not distance.', answer: false },
      { q: 'The Great Wall of China is visible from the Moon with the naked eye.', answer: false },
      { q: 'A leap year has 366 days.', answer: true },
    ],
    'true-false-science': [
      { q: 'Water boils at 100°C at normal sea-level atmospheric pressure.', answer: true },
      { q: 'Lightning is hotter than the surface of the Sun.', answer: true },
      { q: 'Pure distilled water is an excellent conductor of electricity.', answer: false },
      { q: 'Sound cannot travel through a vacuum.', answer: true },
      { q: 'The Moon has its own light source like the Sun.', answer: false },
      { q: 'Photosynthesis occurs in the chloroplasts of plant cells.', answer: true },
      { q: 'Heavy objects fall noticeably faster than light objects in a vacuum.', answer: false },
      { q: 'Earth revolves around the Sun once approximately every 365.25 days.', answer: true },
    ],
    'rural-india-facts': [
      { q: 'DigiLocker is an official Government platform to store documents digitally.', answer: true },
      { q: 'Gram Panchayats are only found in urban cities.', answer: false },
      { q: 'Kisan Credit Card (KCC) helps farmers access timely credit for agricultural needs.', answer: true },
      { q: 'Solar-powered pumps cannot be used for irrigation in rural farms.', answer: false },
      { q: 'Panchayat elections in India are held every 5 years.', answer: true },
      { q: 'The PM Kisan Samman Nidhi provides financial support to landholding farmers.', answer: true },
    ],
    'water-conservation': [
      { q: 'Rainwater harvesting helps replenish the groundwater table.', answer: true },
      { q: 'Leaving water taps running while brushing teeth saves clean water.', answer: false },
      { q: 'Drip irrigation uses less water compared to traditional flood irrigation.', answer: true },
      { q: 'Check dams built across seasonal streams help conserve monsoon runoff.', answer: true },
      { q: 'Greywater from washing vegetables can be safely reused for garden plants.', answer: true },
      { q: 'Contaminated wastewater can be poured directly into village drinking ponds.', answer: false },
    ],
    'organic-farming-guide': [
      { q: 'Compost and cow dung enrich soil naturally without harmful chemicals.', answer: true },
      { q: 'Earthworms are pests that destroy soil quality for crops.', answer: false },
      { q: 'Crop rotation helps prevent nutrient depletion and breaks pest cycles.', answer: true },
      { q: 'Neem kernel extract acts as a natural insect and pest repellent.', answer: true },
      { q: 'Burning crop stubble in the open field increases long-term soil fertility.', answer: false },
      { q: 'Mulching with dry leaves or straw helps retain soil moisture.', answer: true },
    ],
    'digital-banking-safety': [
      { q: 'You need to enter your UPI PIN only when sending money, never when receiving.', answer: true },
      { q: 'It is safe to share your 6-digit OTP or bank PIN over phone calls.', answer: false },
      { q: 'Always verify the recipient name on the screen before entering your UPI PIN.', answer: true },
      { q: 'Scanning a QR code sent by an unknown person can credit free money into your account.', answer: false },
      { q: 'Bank officials will never call asking for your ATM CVV number or password.', answer: true },
      { q: 'Using public charging ports with unknown cables can carry data theft risks (Juice Jacking).', answer: true },
    ],
    'cyber-true-false': [
      { q: 'Using "123456" or your birth year as a password is safe from hackers.', answer: false },
      { q: 'Two-factor authentication (2FA) provides extra security for online accounts.', answer: true },
      { q: 'Clicking random links claiming you won a lottery prize is always safe.', answer: false },
      { q: 'Backing up study notes on a pendrive or cloud protects against data loss.', answer: true },
      { q: 'Antivirus software helps detect and block malicious software.', answer: true },
    ],
    'constitution-facts': [
      { q: 'The Indian Constitution is the longest written national constitution in the world.', answer: true },
      { q: 'India celebrates Republic Day on 15th August each year.', answer: false },
      { q: 'Fundamental Rights are guaranteed to all citizens under the Indian Constitution.', answer: true },
      { q: 'The voting age in India was reduced from 21 to 18 years by the 61st Amendment.', answer: true },
      { q: 'The President of India is the Supreme Commander of the Indian Armed Forces.', answer: true },
    ],
    'coding-logic': [
      { q: 'In logic, TRUE AND FALSE results in TRUE.', answer: false },
      { q: 'In logic, TRUE OR FALSE results in TRUE.', answer: true },
      { q: 'A loop in computer programming allows repeating a set of instructions.', answer: true },
      { q: 'An "if-else" statement is used for making conditional decisions in code.', answer: true },
      { q: 'A computer bug is a biological insect inside the screen.', answer: false },
    ],
    'logic-grid': [
      { q: 'If all roses are flowers and some flowers fade quickly, all roses must fade quickly.', answer: false },
      { q: 'If Arun is taller than Bala, and Bala is taller than Chetan, Arun is taller than Chetan.', answer: true },
      { q: 'A prime number has exactly two distinct factors: 1 and itself.', answer: true },
      { q: 'Zero is a positive integer.', answer: false },
    ],
    'natural-pest-defense': [
      { q: 'Neem seed kernel extract (NSKE) acts as a natural insect repellent without harming beneficial bees.', answer: true },
      { q: 'Ladybird beetles and spiders are pests that farmers should kill with chemical spray.', answer: false },
      { q: 'Planting yellow marigold flowers along border rows acts as a trap crop for tomato fruit borers.', answer: true },
      { q: 'Pheromone traps attract male moths using scent to monitor pest outbreaks safely.', answer: true },
      { q: 'Pouring toxic chemical pesticide into village ponds is an approved way to eliminate mosquitoes.', answer: false },
      { q: 'Erecting wooden T-shaped bird perches in paddy fields encourages predatory birds to eat insect larvae.', answer: true },
      { q: 'Excessive synthetic chemical pesticides kill the friendly insects that naturally control crop pests.', answer: true },
    ],
    'crop-insurance-safety': [
      { q: 'Under PM Fasal Bima Yojana (PMFBY), the farmer premium for food & oilseed crops in Kharif is only 2%.', answer: true },
      { q: 'Only farmers with large landholdings can enroll in Pradhan Mantri Fasal Bima Yojana.', answer: false },
      { q: 'Localized disasters like hailstorms, landslides, and inundation are covered under crop insurance.', answer: true },
      { q: 'Crop damage from localized perils should be reported within 72 hours via the Crop Insurance App.', answer: true },
      { q: 'Post-harvest losses occurring up to 14 days after harvest due to cyclonic rains are covered under PMFBY.', answer: true },
      { q: 'Crop insurance guarantees payout even if a farmer never planted any crop seeds in that season.', answer: false },
      { q: 'Both loanee and non-loanee farmers have equal rights to avail subsidized PMFBY coverage.', answer: true },
    ],
    'chipko-forest-guardians': [
      { q: 'The Chipko Movement originated in the early 1970s in the Garhwal Himalayas (Uttarakhand).', answer: true },
      { q: 'Gaura Devi and village women hugged ash trees in Reni village in 1974 to prevent commercial logging.', answer: true },
      { q: 'Deforestation on mountain slopes causes severe soil erosion, flash floods, and dry natural springs.', answer: true },
      { q: 'The Chipko movement relied on violent armed resistance to stop commercial contractors.', answer: false },
      { q: 'Sunderlal Bahuguna spread the Chipko eco-philosophy: "Ecology is permanent economy".', answer: true },
      { q: 'Traditional village communities protect Sacred Groves (Devrais / Orans) as community biodiversity reserves.', answer: true },
      { q: 'Cutting down village catchment forests increases the clean water yield in village wells.', answer: false },
    ],
  },
  memory: {
    default: [
      { term: '2 × 6', match: '12' },
      { term: '5 × 5', match: '25' },
      { term: '9 × 3', match: '27' },
      { term: '4 × 7', match: '28' },
      { term: '8 × 8', match: '64' },
      { term: '7 × 6', match: '42' },
      { term: '12 × 4', match: '48' },
      { term: '11 × 11', match: '121' },
    ],
    'memory-math-facts': [
      { term: '√49', match: '7' },
      { term: '3³', match: '27' },
      { term: '15 × 4', match: '60' },
      { term: '100 ÷ 4', match: '25' },
      { term: '2⁵', match: '32' },
      { term: '9 × 8', match: '72' },
    ],
    'memory-science-terms': [
      { term: 'H2O', match: 'Water' },
      { term: 'O2', match: 'Oxygen' },
      { term: 'CO2', match: 'Carbon Dioxide' },
      { term: 'NaCl', match: 'Table Salt' },
      { term: 'Chlorophyll', match: 'Green Leaves' },
      { term: 'Sun', match: 'Star' },
    ],
  },
  scramble: {
    default: [
      { word: 'SCHOOL', hint: 'Place of learning' },
      { word: 'TEACHER', hint: 'Guiding mentor in class' },
      { word: 'SCIENCE', hint: 'Study of nature and experiments' },
      { word: 'FRACTION', hint: 'A part of a whole number' },
      { word: 'FARMER', hint: 'Grows food for the nation' },
      { word: 'SOLAR', hint: 'Energy from the Sun' },
      { word: 'COMPUTER', hint: 'Electronic device for learning' },
      { word: 'LIBRARY', hint: 'Room filled with books' },
      { word: 'OXYGEN', hint: 'Gas we breathe to live' },
      { word: 'PANCHAYAT', hint: 'Village self-governing council' },
    ],
    'word-scramble-english': [
      { word: 'STUDENT', hint: 'One who learns at school' },
      { word: 'HARVEST', hint: 'Gathering ripe crops from fields' },
      { word: 'GARDEN', hint: 'Plot of ground with plants & flowers' },
      { word: 'PENCIL', hint: 'Writing tool with graphite' },
      { word: 'VILLAGE', hint: 'Rural community settlement' },
      { word: 'MONSOON', hint: 'Seasonal rain-bearing winds' },
    ],
    'sentence-scramble': [
      { answer: 'Plants need sunlight and water.', hint: 'What helps a garden grow?', kind: 'words' },
      { answer: 'The farmer saves rainwater.', hint: 'A sentence about conserving water.', kind: 'words' },
      { answer: 'A triangle has three sides.', hint: 'Remember the shape with three corners.', kind: 'words' },
      { answer: 'We share books at the village library.', hint: 'A sentence about learning together.', kind: 'words' },
      { answer: 'Bees carry pollen between flowers.', hint: 'A sentence about helpful pollinators.', kind: 'words' },
      { answer: 'The Earth moves around the Sun.', hint: 'A sentence about our solar system.', kind: 'words' },
    ],
    'indian-states-scramble': [
      { answer: 'Assam', hint: 'A north-eastern state known for tea gardens.', kind: 'letters' },
      { answer: 'Bihar', hint: 'A state with the ancient learning centre Nalanda.', kind: 'letters' },
      { answer: 'Gujarat', hint: 'A western state with a long Arabian Sea coastline.', kind: 'letters' },
      { answer: 'Kerala', hint: 'A south-western state known for backwaters.', kind: 'letters' },
      { answer: 'Odisha', hint: 'A state on India’s eastern coast.', kind: 'letters' },
      { answer: 'Punjab', hint: 'A north-western state known for fertile fields.', kind: 'letters' },
      { answer: 'Rajasthan', hint: 'India’s largest state by area.', kind: 'letters' },
      { answer: 'Sikkim', hint: 'A Himalayan state with Kanchenjunga.', kind: 'letters' },
      { answer: 'Goa', hint: 'A small state on India’s western coast.', kind: 'letters' },
      { answer: 'Manipur', hint: 'A north-eastern state with Loktak Lake.', kind: 'letters' },
    ],
  },
  fill_blank: {
    default: [
      { text: 'The ___ gives us natural heat and sunlight.', answer: 'sun' },
      { text: 'Green plants make food through ___.', answer: 'photosynthesis' },
      { text: 'A polygon with 3 sides and 3 angles is a ___.', answer: 'triangle' },
      { text: 'Water freezes into ice at ___ degrees Celsius.', answer: '0' },
      { text: 'The capital of India is New ___.', answer: 'delhi' },
      { text: 'Earth completes one rotation on its axis in ___ hours.', answer: '24' },
      { text: 'The process of seeds growing into seedlings is called ___.', answer: 'germination' },
    ],
    'fill-blank-grammar': [
      { text: 'She ___ to school every morning. (go / goes)', answer: 'goes' },
      { text: 'The sun ___ in the east. (rise / rises)', answer: 'rises' },
      { text: 'They ___ playing football in the field. (is / are)', answer: 'are' },
      { text: 'An elephant is ___ than a horse. (bigger / biggest)', answer: 'bigger' },
      { text: 'Honesty is the ___ policy. (best / good)', answer: 'best' },
    ],
    'photosynthesis-puzzle': [
      { text: 'Plants absorb water from soil through their ___.', answer: 'roots' },
      { text: 'The green pigment in leaves that traps sunlight is ___.', answer: 'chlorophyll' },
      { text: 'During photosynthesis, plants release ___ gas into the air.', answer: 'oxygen' },
      { text: 'Carbon dioxide enters plant leaves through tiny pores called ___.', answer: 'stomata' },
    ],
  },
  typing: {
    default: [
      { prompt: 'Type: education', answer: 'education' },
      { prompt: 'Type: gyaandhara', answer: 'gyaandhara' },
      { prompt: 'Type: learning', answer: 'learning' },
      { prompt: 'Type: knowledge', answer: 'knowledge' },
      { prompt: 'Type: village', answer: 'village' },
      { prompt: 'Type: student', answer: 'student' },
    ],
    'spelling-bee': [
      { prompt: 'Spell the gas we breathe: oxygen', answer: 'oxygen' },
      { prompt: 'Spell the word: mathematics', answer: 'mathematics' },
      { prompt: 'Spell the natural cycle: photosynthesis', answer: 'photosynthesis' },
      { prompt: 'Spell the unit: kilometer', answer: 'kilometer' },
      { prompt: 'Spell the village council: panchayat', answer: 'panchayat' },
    ],
  },
  sequence: {
    default: [
      { items: ['2', '4', '6', '8'], correct: ['2', '4', '6', '8'] },
      { items: ['10', '20', '30', '40'], correct: ['10', '20', '30', '40'] },
      { items: ['1', '3', '5', '7'], correct: ['1', '3', '5', '7'] },
      { items: ['5', '10', '15', '20'], correct: ['5', '10', '15', '20'] },
    ],
    'solar-system-order': {
      items: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter'],
      correct: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter'],
    },
    'alphabet-order': {
      items: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
      correct: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
    },
    'timeline-order': {
      items: ['Ancient Harappa', 'Mauryan Empire', 'Mughal Period', 'British Raj', 'Independent India'],
      correct: ['Ancient Harappa', 'Mauryan Empire', 'Mughal Period', 'British Raj', 'Independent India'],
    },
    'pattern-recognition': {
      items: ['Circle', 'Square', 'Triangle', 'Hexagon', 'Octagon'],
      correct: ['Circle', 'Square', 'Triangle', 'Hexagon', 'Octagon'],
    },
    'crop-rotation-master': {
      items: [
        'Legume / Pulses (Nitrogen Fixation)',
        'Leafy Greens / Cereal (Heavy Feeder)',
        'Root Crop / Tuber (Soil Aeration)',
        'Cover Crop / Green Manure (Soil Rest)',
      ],
      correct: [
        'Legume / Pulses (Nitrogen Fixation)',
        'Leafy Greens / Cereal (Heavy Feeder)',
        'Root Crop / Tuber (Soil Aeration)',
        'Cover Crop / Green Manure (Soil Rest)',
      ],
    },
    'champaran-indigo-history': {
      items: [
        'Tinkathia System Forces Farmers to Grow Indigo on 3/20th Land',
        'Raj Kumar Shukla Persuades Gandhiji to Visit Champaran',
        'Gandhiji Arrives in Motihari & Records Peasant Testimonies',
        'British Government Appoints Champaran Agrarian Committee',
        'Tinkathia Law Abolished & Illegal Plant Tax Partially Refunded',
      ],
      correct: [
        'Tinkathia System Forces Farmers to Grow Indigo on 3/20th Land',
        'Raj Kumar Shukla Persuades Gandhiji to Visit Champaran',
        'Gandhiji Arrives in Motihari & Records Peasant Testimonies',
        'British Government Appoints Champaran Agrarian Committee',
        'Tinkathia Law Abolished & Illegal Plant Tax Partially Refunded',
      ],
    },
  },
  flashcard: {
    default: [
      { front: 'What is photosynthesis?', back: 'The process by which plants make food using sunlight, CO2, and water.' },
      { front: 'What is the capital of India?', back: 'New Delhi' },
      { front: 'What is the largest ocean on Earth?', back: 'The Pacific Ocean' },
      { front: 'Who is known as the Father of the Nation in India?', back: 'Mahatma Gandhi' },
      { front: 'What is the boiling point of pure water?', back: '100 degrees Celsius at sea level.' },
      { front: 'What is an angle of 90 degrees called?', back: 'A Right Angle' },
    ],
    'science-flash-master': [
      { front: 'What organ pumps blood throughout the human body?', back: 'The Heart' },
      { front: 'Which gas do plants release during photosynthesis?', back: 'Oxygen (O2)' },
      { front: 'What is the hardest natural mineral on Earth?', back: 'Diamond' },
      { front: 'What is the center of an atom called?', back: 'The Nucleus' },
    ],
    'vocabulary-builder': [
      { front: 'Word: DILIGENT', back: 'Hardworking, attentive, and persistent.' },
      { front: 'Word: ABUNDANT', back: 'Existing or available in large quantities; plentiful.' },
      { front: 'Word: COURTEOUS', back: 'Polite, respectful, and considerate of others.' },
      { front: 'Word: INNOVATE', back: 'To introduce new methods, ideas, or products.' },
    ],
    'first-aid-basics': [
      { front: 'First step for a minor burn?', back: 'Hold under cool running water for at least 10 minutes.' },
      { front: 'Emergency ambulance phone number in India?', back: '108 or 112' },
      { front: 'How to clean a small scrape or cut?', back: 'Wash gently with clean water and mild soap, then cover with clean bandage.' },
    ],
    'millet-mission-india': [
      { front: 'Why are Millets called "Shree Anna" or Supergrains?', back: 'Powerhouse grains packed with calcium, iron, protein, and dietary fiber, needing minimal water.' },
      { front: 'Which millet is Ragi (Finger Millet) famous for?', back: 'Richest cereal source of natural Calcium (over 340 mg/100g), vital for bone strength and kids.' },
      { front: 'Which hardy millet is Bajra (Pearl Millet)?', back: 'Drought-tolerant millet rich in Iron and zinc, celebrated in winter rotis across Rajasthan and Gujarat.' },
      { front: 'What is Jowar (Sorghum)?', back: 'Gluten-free grain high in dietary fiber and polyphenols that stabilize blood sugar and cholesterol.' },
      { front: 'Why are millets climate-smart crops for Indian farmers?', back: 'They thrive in dry, poor soils with ~70% less irrigation than rice and mature quickly.' },
      { front: 'Why did the UN declare 2023 the International Year of Millets?', back: 'Championed by India to promote global food security, resilient farming, and nutrition.' },
    ],
    'mandi-price-bargain': [
      { front: 'What is Minimum Support Price (MSP)?', back: 'An assured purchase price benchmark set by the Government to protect farmers from market crashes.' },
      { front: 'What is the e-NAM (National Agriculture Market) platform?', back: 'A transparent pan-India online trading portal connecting physical APMC mandis for competitive bidding.' },
      { front: 'What is an APMC Mandi?', back: 'Agricultural Produce Market Committee — a regulated yard where licensed commission agents and traders buy farm produce.' },
      { front: 'Why is Moisture Content measured at the Mandi?', back: 'Ensures grain is sufficiently dried (e.g. 12-14% for wheat) to avoid mold and earn the highest fair grade rate.' },
      { front: 'What is a Weighbridge Slip (Tola Parchi)?', back: 'An authentic digital weight printout verifying total weight of tractor/cart and net produce weight before payment.' },
      { front: 'What is Direct Benefit Transfer (DBT) in crop procurement?', back: 'Direct electronic transfer of crop payment straight into the farmer’s bank account within 24 to 48 hours.' },
    ],
  },
  match_pairs: {
    default: [
      { left: 'Hot', right: 'Cold' },
      { left: 'Day', right: 'Night' },
      { left: 'Up', right: 'Down' },
      { left: 'Happy', right: 'Sad' },
      { left: 'Big', right: 'Small' },
      { left: 'Fast', right: 'Slow' },
    ],
    'capital-cities': [
      { left: 'India', right: 'New Delhi' },
      { left: 'France', right: 'Paris' },
      { left: 'Japan', right: 'Tokyo' },
      { left: 'United Kingdom', right: 'London' },
      { left: 'Australia', right: 'Canberra' },
      { left: 'Nepal', right: 'Kathmandu' },
    ],
    'animal-habitat': [
      { left: 'Fish', right: 'Pond & River' },
      { left: 'Camel', right: 'Thar Desert' },
      { left: 'Penguin', right: 'Antarctica' },
      { left: 'Tiger', right: 'Dense Forest' },
      { left: 'Eagle', right: 'High Mountains' },
    ],
    'matter-states': [
      { left: 'Ice', right: 'Solid' },
      { left: 'Water', right: 'Liquid' },
      { left: 'Steam', right: 'Gas' },
      { left: 'Lightning', right: 'Plasma' },
    ],
    'renewable-energy': [
      { left: 'Solar Energy', right: 'Sunlight' },
      { left: 'Wind Energy', right: 'Windmills' },
      { left: 'Hydroelectric', right: 'Dam Water Flow' },
      { left: 'Biogas', right: 'Cow Dung & Waste' },
    ],
    'festivals-match': [
      { left: 'Diwali', right: 'Festival of Lights' },
      { left: 'Holi', right: 'Festival of Colors' },
      { left: 'Pongal / Bihu', right: 'Harvest Celebrations' },
      { left: 'Eid', right: 'Festival of Brotherhood' },
      { left: 'Christmas', right: '25th of December' },
    ],
    'digital-match': [
      { left: 'CPU', right: 'Brain of Computer' },
      { left: 'Monitor', right: 'Display Screen' },
      { left: 'Keyboard', right: 'Typing Device' },
      { left: 'Mouse', right: 'Pointing Device' },
      { left: 'Printer', right: 'Paper Output' },
    ],
    'soil-nutrient-match': [
      { left: 'Nitrogen (N)', right: 'Vibrant Green Foliage & Leaf Growth' },
      { left: 'Phosphorus (P)', right: 'Strong Root Depth & Flower Formation' },
      { left: 'Potassium (K)', right: 'Drought Resistance & Disease Defense' },
      { left: 'Zinc (Zn)', right: 'Enzyme Action & Leaf Size Formation' },
      { left: 'Soil Organic Carbon', right: 'Earthworm Activity & Water Retention' },
      { left: 'Soil pH 6.5 to 7.5', right: 'Optimal Neutral Soil for Most Crops' },
    ],
    'village-bank-passbook': [
      { left: 'Credit (CR)', right: 'Money Deposited into Bank Account (+)' },
      { left: 'Debit (DR)', right: 'Money Withdrawn or Spent (-)' },
      { left: 'IFSC Code', right: '11-Character Unique Bank Branch Identifier' },
      { left: 'Account Number', right: 'Unique Customer Account Identifier' },
      { left: 'Available Balance', right: 'Total Net Funds Accessible in Account' },
      { left: 'Cheque Clearing', right: 'Verification & Interbank Fund Transfer' },
    ],
    'ancient-stepwells-tanks': [
      { left: 'Baoli / Vav', right: 'Multi-Tier Subterranean Stepwell (Gujarat & Rajasthan)' },
      { left: 'Johad', right: 'Traditional Earthen Check-Dam for Rain Infiltration' },
      { left: 'Ahar-Pyne', right: 'Inundation Canal & Floodwater Embankment (Bihar)' },
      { left: 'Kuhl', right: 'Glacial Surface Water Channel Network (Himachal)' },
      { left: 'Eri Cascade', right: 'Interconnected Village Tank Irrigation (Tamil Nadu)' },
      { left: 'Kund / Kundi', right: 'Circular Underground Cistern for Pure Drinking Water' },
    ],
    'rural-artisans-handicrafts': [
      { left: 'Madhubani Painting', right: 'Natural Dye Folk Art on Handmade Paper (Bihar)' },
      { left: 'Pashmina & Chanderi', right: 'World-Renowned Fine Shawls & Handloom Sarees' },
      { left: 'Terracotta Pottery', right: 'Artistic Baked Clay Pots & Terracotta Horses' },
      { left: 'Bidriware Metalcraft', right: 'Silver Inlay on Blackened Zinc-Copper Alloy' },
      { left: 'Dhokra Casting', right: 'Ancient Lost-Wax Bell Metal Craft (Tribal India)' },
      { left: 'Kalamkari Fabric', right: 'Freehand Bamboo Pen Painting with Natural Dyes' },
    ],
  },
};

export function getGameContent(game, level = 1) {
  const engine = game.engine;
  if (engine === 'farm_sim') {
    const roundCount = Math.min(3 + level, FARM_SIMULATION.rounds.length);
    return {
      engine,
      intro: FARM_SIMULATION.intro,
      data: FARM_SIMULATION.rounds.slice(0, roundCount),
      level,
    };
  }

  if (engine === 'math_speed') {
    return {
      engine,
      data: generateMathSpeedQuestions(game.slug, level),
      level,
    };
  }

  const mission = RURAL_MISSIONS[game.slug];
  if (engine === 'rural_mission' && mission) {
    const shuffledRounds = [...mission.rounds].sort(() => Math.random() - 0.5);
    const roundCount = Math.min(3 + level, shuffledRounds.length);
    const rounds = shuffledRounds
      .slice(0, roundCount)
      .map((round) => shuffleQuestionOptions({ ...round }));
    return {
      engine,
      mode: mission.mode,
      intro: mission.intro,
      data: rounds,
      level,
    };
  }

  const slugContent = CONTENT[engine]?.[game.slug];
  const engineContent = CONTENT[engine];

  if (engine === 'sequence' && slugContent?.items) {
    return {
      engine,
      data: {
        type: 'order',
        items: [...slugContent.items].sort(() => Math.random() - 0.5),
        correct: slugContent.correct || slugContent.items,
      },
      level,
    };
  }

  const pool = slugContent || engineContent?.default || CONTENT.quiz.default;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const countByLevel = { 1: 5, 2: 6, 3: 7 }[level] || 5;
  const sliceCount = Math.min(countByLevel, shuffled.length);

  if (engine === 'quiz') {
    // Dynamic option shuffle for each question: guarantees uniform distribution across A, B, C, D
    const questions = shuffled.slice(0, sliceCount).map(shuffleQuestionOptions);
    return { engine, data: questions, level };
  }

  if (engine === 'true_false') {
    return { engine, data: shuffled.slice(0, sliceCount), level };
  }

  if (engine === 'memory') {
    const pairs = Math.min(3 + level, shuffled.length);
    return { engine, data: shuffled.slice(0, pairs), level };
  }

  if (engine === 'match_pairs') {
    return { engine, data: shuffled.slice(0, Math.min(3 + level, shuffled.length)), level };
  }

  if (engine === 'scramble') {
    const items = shuffled.slice(0, Math.min(3 + level, shuffled.length)).map((item) => ({
      answer: item.answer || item.word,
      hint: item.hint,
      kind: item.kind || 'letters',
    }));
    return { engine, data: items, level };
  }

  if (engine === 'flashcard') {
    return { engine, data: shuffled.slice(0, sliceCount), level };
  }

  if (engine === 'sequence') {
    const item = shuffled[0];
    return {
      engine,
      data: {
        type: 'order',
        items: [...item.items].sort(() => Math.random() - 0.5),
        correct: item.correct || item.items,
      },
      level,
    };
  }

  return { engine, data: shuffled.slice(0, sliceCount), level };
}
