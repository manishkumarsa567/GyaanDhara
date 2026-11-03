export const RURAL_MISSIONS = {
  'sustainable-farming-sim': {
    mode: 'farming',
    intro: 'Plan a healthy farm by caring for soil, choosing suitable crops, using water wisely, and managing pests safely.',
    rounds: [
      { story: 'The field has sandy soil and little rain this week. Which crop is a sensible choice?', q: 'Choose a crop suited to dry conditions.', options: ['Pearl millet (bajra)', 'Paddy rice without irrigation', 'Water spinach in a dry field', 'Keep the field empty all season'], answer: 0, feedback: 'Bajra is a hardy crop that can grow with less water than paddy.' },
      { story: 'The topsoil is drying under the afternoon sun. You have straw left after harvest.', q: 'How can straw help the field?', options: ['Use it as mulch to reduce evaporation', 'Burn it on the soil every day', 'Remove all soil around each plant', 'Pour soapy water over the crop'], answer: 0, feedback: 'Mulch shades the soil, slows water loss, and can add organic matter as it breaks down.' },
      { story: 'A neighbour notices that the same crop has been planted in this plot for many seasons.', q: 'What is a useful next-season plan?', options: ['Rotate crops, including a legume where suitable', 'Plant the same crop forever', 'Leave harvested roots exposed to sun', 'Remove every insect, including pollinators'], answer: 0, feedback: 'Crop rotation can help soil health and interrupt some pest cycles.' },
      { story: 'You see a few leaves with insect damage, but most plants look healthy.', q: 'What is a careful first response?', options: ['Inspect plants and identify the pest before acting', 'Spray an unknown chemical on the whole village', 'Double every pesticide dose', 'Pour fuel on the plants'], answer: 0, feedback: 'Correct identification and monitoring help avoid unnecessary pesticide use.' },
      { story: 'The soil is hard and water runs off quickly after irrigation.', q: 'Which practice can improve soil structure over time?', options: ['Add suitable compost or organic matter', 'Compact the field with repeated heavy traffic', 'Remove all crop residues and roots', 'Irrigate during the hottest hour every day'], answer: 0, feedback: 'Organic matter supports soil structure and helps the soil hold water.' },
      { story: 'A field has both pest-eating birds and a small pest outbreak.', q: 'Which approach supports balanced pest management?', options: ['Protect helpful wildlife and monitor pest levels', 'Destroy every bird nest', 'Apply every available spray together', 'Ignore crop health for the whole season'], answer: 0, feedback: 'Integrated pest management combines observation and targeted, safer actions.' },
    ],
  },
  'village-market': {
    mode: 'market',
    intro: 'Help the market stall keep fair accounts: calculate change, compare costs and selling prices, and find profit or loss.',
    rounds: [
      { story: 'A customer buys vegetables for ₹68 and pays with a ₹100 note.', q: 'How much change should the customer receive?', options: ['₹32', '₹38', '₹42', '₹168'], answer: 0, feedback: '₹100 − ₹68 = ₹32 change.' },
      { story: 'You buy 5 notebooks at ₹12 each and sell each for ₹15.', q: 'What is the total profit before other expenses?', options: ['₹15', '₹60', '₹75', '₹3'], answer: 0, feedback: 'Cost is ₹60; sales are ₹75; profit is ₹75 − ₹60 = ₹15.' },
      { story: 'A basket of mangoes costs ₹240. You sell it for ₹210.', q: 'Is it profit or loss, and by how much?', options: ['₹30 loss', '₹30 profit', '₹210 profit', 'No loss or profit'], answer: 0, feedback: 'Selling for less than the cost gives a loss of ₹240 − ₹210 = ₹30.' },
      { story: 'A customer buys rice worth ₹126 and oil worth ₹74, then pays ₹250.', q: 'How much change is due?', options: ['₹50', '₹60', '₹74', '₹200'], answer: 0, feedback: 'The total is ₹200, so ₹250 − ₹200 = ₹50 change.' },
      { story: 'A shopkeeper pays ₹400 for 20 kg of grain.', q: 'What is the cost per kilogram?', options: ['₹20', '₹40', '₹200', '₹380'], answer: 0, feedback: '₹400 divided by 20 kg is ₹20 per kilogram.' },
      { story: 'A packet costs ₹80 to prepare and sells for ₹95.', q: 'What is the profit on one packet?', options: ['₹15', '₹95', '₹80', '₹175'], answer: 0, feedback: 'Profit is selling price minus cost: ₹95 − ₹80 = ₹15.' },
    ],
  },
  'panchayat-governance': {
    mode: 'panchayat',
    intro: 'As a village council member, listen to community needs and make fair, transparent choices about shared resources.',
    rounds: [
      { story: 'In a dry month, one neighbourhood has water while another has none.', q: 'What is the fairest first step?', options: ['Listen to both areas and publish a fair water schedule', 'Give all water to the loudest group', 'Hide the supply records', 'Allow one family to block the public tap'], answer: 0, feedback: 'A transparent schedule and community input help distribute a shared resource fairly.' },
      { story: 'A road is damaged, but the school roof also leaks before monsoon.', q: 'How should the council decide what to fund first?', options: ['Assess safety and urgency with residents, then share the budget openly', 'Choose a project only for friends', 'Spend everything without a record', 'Ignore both problems'], answer: 0, feedback: 'Assessing risk and discussing priorities openly supports accountable decisions.' },
      { story: 'A public meeting is planned about a new village facility.', q: 'How can more residents participate?', options: ['Announce the meeting accessibly and invite different groups', 'Tell only a few selected people', 'Hold it secretly', 'Refuse questions from residents'], answer: 0, feedback: 'Open notice and inclusive participation make local decisions more representative.' },
      { story: 'The council receives funds for a drinking-water repair.', q: 'What builds public trust?', options: ['Record spending and share receipts and progress', 'Keep all spending private', 'Use the fund for a personal purchase', 'Remove the repair from the meeting notes'], answer: 0, feedback: 'Clear records and public reporting support accountability.' },
      { story: 'A proposed road would help many homes but affect a small group of farmers.', q: 'What is a responsible next step?', options: ['Hear affected residents and review safe alternatives', 'Ignore the affected families', 'Start work without explaining the plan', 'Ask only the contractor to decide'], answer: 0, feedback: 'Consulting affected residents and considering alternatives is part of responsible planning.' },
      { story: 'Residents disagree about whether a school needs a library or a repaired classroom first.', q: 'How can the council reach a sound decision?', options: ['Check safety and learning needs, then discuss priorities publicly', 'Choose by rumour alone', 'Let one person decide without evidence', 'Cancel the school budget'], answer: 0, feedback: 'Evidence, urgency, and public discussion help set useful priorities.' },
    ],
  },
  'water-conservation-quest': {
    mode: 'water',
    intro: 'Inspect the village irrigation line, spot waste, and choose practical repairs that protect clean water.',
    rounds: [
      { story: 'At the first field junction, water sprays from a crack even when the channel gate is closed.', q: 'What should you identify?', options: ['A leaking joint that needs repair', 'A healthy drip line', 'A water-level marker', 'A rain gauge'], answer: 0, feedback: 'Water spraying from a closed line is a clear sign of a leak.' },
      { story: 'The channel reaches one field, but water keeps flowing past the plants into an empty ditch.', q: 'Which action saves the most water?', options: ['Close or redirect the channel when the field has enough', 'Leave the flow running overnight', 'Dig a deeper ditch away from crops', 'Open every gate at once'], answer: 0, feedback: 'Stopping or redirecting flow when it is no longer needed prevents waste.' },
      { story: 'A tap near the storage tank drips all day after it is turned off.', q: 'What is the best repair choice?', options: ['Report and repair the worn washer or tap safely', 'Hit the tap harder each hour', 'Cover the drip with soil', 'Ignore it for a month'], answer: 0, feedback: 'A worn washer or fitting can often be repaired to stop a steady leak.' },
      { story: 'A pipe is buried under a patch of unusually wet soil while nearby ground is dry.', q: 'What should the team check?', options: ['Inspect the pipe beneath the wet patch for a leak', 'Pour more water over the whole path', 'Assume the sun caused it', 'Block the nearest household supply'], answer: 0, feedback: 'A persistent wet patch can point to an underground leak and should be checked.' },
      { story: 'Rainwater runs off the school roof into the street.', q: 'What could help collect some of it?', options: ['A maintained rainwater harvesting system', 'A pipe that sends it into a drain faster', 'Leave every gutter blocked', 'Mix it with waste water'], answer: 0, feedback: 'A properly maintained harvesting system can collect rainwater for suitable uses.' },
      { story: 'The irrigation schedule waters every plot at midday, when evaporation is high.', q: 'What is a practical improvement?', options: ['Use a suitable cooler-time schedule and check soil moisture', 'Water longer at noon', 'Flood all fields regardless of need', 'Remove the soil around the crop'], answer: 0, feedback: 'Scheduling based on crop and soil needs can reduce water loss.' },
    ],
  },
  'digital-safety-detective': {
    mode: 'safety',
    intro: 'Investigate a mock village message feed. Spot suspicious links, false claims, and requests for private information.',
    rounds: [
      { story: 'A message says: “Your bank account will close today! Send your OTP to this number now.”', q: 'What should the detective do?', options: ['Do not share the OTP; verify using the bank’s official channel', 'Reply with the OTP quickly', 'Forward the message to every contact', 'Share a password so the sender can help'], answer: 0, feedback: 'Never share an OTP. Contact the bank using a trusted official number or app.' },
      { story: 'A familiar-looking message asks you to open a shortened link to claim a free phone.', q: 'What is the safest choice?', options: ['Do not open it; verify the offer from the official website', 'Enter your password on the linked page', 'Download whatever it offers', 'Send the link to children in the group'], answer: 0, feedback: 'Unexpected prize links may be phishing. Verify independently before acting.' },
      { story: 'A viral post claims that a local water source is poisoned, but shows no date or reliable source.', q: 'How should you check the claim?', options: ['Look for a dated notice from trusted local health or water officials', 'Forward it as confirmed news', 'Add a scarier headline', 'Trust it because it has many emojis'], answer: 0, feedback: 'Check the date and confirm with a reliable official or local source before sharing.' },
      { story: 'A stranger in a game asks for your home address and school name.', q: 'What is the safe response?', options: ['Do not share personal details; tell a trusted adult', 'Send the details privately', 'Post them in the group chat', 'Ask the stranger to keep it secret'], answer: 0, feedback: 'Keep personal information private and ask a trusted adult for help.' },
      { story: 'A social post uses an old flood photo but says it happened in your village today.', q: 'What should you check before sharing?', options: ['Check the image date and compare with trusted local updates', 'Share immediately because it looks dramatic', 'Change the village name and repost', 'Assume every photo is current'], answer: 0, feedback: 'Old images can mislead. Verify the date and location using reliable updates.' },
      { story: 'A caller says they are support staff and needs your screen-sharing code to fix a payment.', q: 'What is the safest move?', options: ['End the call and contact the service through its official channel', 'Read out the code', 'Share your banking PIN', 'Install an app they send without checking'], answer: 0, feedback: 'Do not share access codes or PINs with unexpected callers. Verify independently.' },
    ],
  },
  'language-bridge': {
    mode: 'language',
    intro: 'Build a bridge between familiar household words in English, Hindi, and Bengali. Match all three names for each object.',
    rounds: [
      { story: 'At home you pour water into a glass.', q: 'Choose the matching word trio for “water”.', options: ['Water · पानी (pānī) · জল (jol)', 'Milk · दूध (dūdh) · দুধ (dudh)', 'House · घर (ghar) · বাড়ি (bāṛi)', 'Book · किताब (kitāb) · বই (boi)'], answer: 0, feedback: 'Water is पानी (pānī) in Hindi and জল (jol) in Bengali.' },
      { story: 'You open a book to read a story.', q: 'Choose the matching word trio for “book”.', options: ['Book · किताब (kitāb) · বই (boi)', 'Rice · चावल (chāval) · চাল (chāl)', 'Door · दरवाज़ा (darvāzā) · দরজা (darjā)', 'Light · रोशनी (roshnī) · আলো (ālō)'], answer: 0, feedback: 'Book is किताब (kitāb) in Hindi and বই (boi) in Bengali.' },
      { story: 'The family sits down to eat rice with lunch.', q: 'Choose the matching word trio for “rice”.', options: ['Rice · चावल (chāval) · চাল (chāl)', 'Water · पानी (pānī) · জল (jol)', 'Key · चाबी (chābī) · চাবি (chābi)', 'House · घर (ghar) · বাড়ি (bāṛi)'], answer: 0, feedback: 'Rice is चावल (chāval) in Hindi and চাল (chāl) in Bengali.' },
      { story: 'You turn on a light when evening comes.', q: 'Choose the matching word trio for “light”.', options: ['Light · रोशनी (roshnī) · আলো (ālō)', 'Milk · दूध (dūdh) · দুধ (dudh)', 'Book · किताब (kitāb) · বই (boi)', 'Door · दरवाज़ा (darvāzā) · দরজা (darjā)'], answer: 0, feedback: 'Light is रोशनी (roshnī) in Hindi and আলো (ālō) in Bengali.' },
      { story: 'You use a key to unlock the front door.', q: 'Choose the matching word trio for “key”.', options: ['Key · चाबी (chābī) · চাবি (chābi)', 'Rice · चावल (chāval) · চাল (chāl)', 'Water · पानी (pānī) · জল (jol)', 'Light · रोशनी (roshnī) · আলো (ālō)'], answer: 0, feedback: 'Key is चाबी (chābī) in Hindi and চাবি (chābi) in Bengali.' },
      { story: 'The family returns to its home after a day outside.', q: 'Choose the matching word trio for “house”.', options: ['House · घर (ghar) · বাড়ি (bāṛi)', 'Book · किताब (kitāb) · বই (boi)', 'Milk · दूध (dūdh) · দুধ (dudh)', 'Door · दरवाज़ा (darvāzā) · দরজা (darjā)'], answer: 0, feedback: 'House is घर (ghar) in Hindi and বাড়ি (bāṛi) in Bengali.' },
    ],
  },
};
