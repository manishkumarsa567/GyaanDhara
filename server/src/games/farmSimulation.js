export const FARM_SIMULATION = {
  intro: 'Build a resilient farm by balancing water, soil health, and crop health. Every decision changes the next season.',
  rounds: [
    {
      story: 'The dry season is starting. You have limited water for a field with hardy millet and a small vegetable plot.',
      q: 'How will you prepare the irrigation plan?',
      options: [
        { label: 'Check soil moisture and water the crops that need it most', points: 3, effects: { water: -8, soil: 2, crops: 8 }, feedback: 'Checking moisture and prioritising crops avoids waste while protecting growth.' },
        { label: 'Flood every plot at midday', points: 0, effects: { water: -30, soil: -5, crops: 1 }, feedback: 'Flooding at the hottest time wastes water and can damage soil.' },
        { label: 'Stop all watering for the whole season', points: 1, effects: { water: 5, soil: 0, crops: -18 }, feedback: 'Saving water matters, but crops still need water. Use a measured schedule.' },
      ],
    },
    {
      story: 'After harvest, the topsoil is exposed and afternoon winds are carrying it away.',
      q: 'What is the best way to protect the soil?',
      options: [
        { label: 'Keep suitable crop residue as mulch and add compost', points: 3, effects: { water: 5, soil: 18, crops: 6 }, feedback: 'Mulch reduces evaporation and erosion; compost adds organic matter.' },
        { label: 'Burn all the residue and leave the field bare', points: 0, effects: { water: -8, soil: -20, crops: -3 }, feedback: 'Bare soil is more exposed to erosion, and burning removes useful organic matter.' },
        { label: 'Compact the field with repeated heavy vehicle trips', points: 0, effects: { water: -5, soil: -15, crops: -8 }, feedback: 'Compaction can restrict roots and reduce water entering the soil.' },
      ],
    },
    {
      story: 'A few leaves show insect damage, but most plants look healthy and helpful insects are present.',
      q: 'How will you respond to the possible pest problem?',
      options: [
        { label: 'Inspect the plants, identify the pest, and monitor the damage', points: 3, effects: { water: 0, soil: 4, crops: 10 }, feedback: 'Monitoring first helps target a response and protects helpful insects.' },
        { label: 'Spray an unknown pesticide across the entire field', points: 0, effects: { water: 0, soil: -12, crops: -4 }, feedback: 'Unknown chemicals can harm people, helpful insects, soil, and water.' },
        { label: 'Ignore the field until every crop is damaged', points: 0, effects: { water: 0, soil: 0, crops: -20 }, feedback: 'Regular checks help catch problems before they spread.' },
      ],
    },
    {
      story: 'The next crop needs a choice. The field has improving soil and rainfall is expected to be moderate.',
      q: 'Which plan supports both the farm and the soil?',
      options: [
        { label: 'Rotate crops and include a suitable legume', points: 3, effects: { water: 1, soil: 14, crops: 10 }, feedback: 'Crop rotation can support soil fertility and interrupt some pest cycles.' },
        { label: 'Plant the same crop in every field each season', points: 0, effects: { water: -3, soil: -12, crops: -6 }, feedback: 'Repeatedly growing one crop can increase some pest and soil-nutrient problems.' },
        { label: 'Choose a water-intensive crop without checking supply', points: 0, effects: { water: -24, soil: -2, crops: 2 }, feedback: 'Crop choice should match local conditions and available water.' },
      ],
    },
    {
      story: 'The field is producing well, and you want to decide when to harvest and how to plan the next season.',
      q: 'Which decision makes the farm more resilient?',
      options: [
        { label: 'Harvest at maturity and record yield, water use, and costs', points: 3, effects: { water: 3, soil: 3, crops: 12 }, feedback: 'Timely harvest protects yield; records help improve next season’s decisions.' },
        { label: 'Harvest everything early and keep no records', points: 1, effects: { water: 0, soil: 0, crops: -8 }, feedback: 'Early harvest may reduce yield, and records are useful for planning.' },
        { label: 'Leave ripe crops in the field until they spoil', points: 0, effects: { water: 0, soil: 0, crops: -18 }, feedback: 'Timely harvesting reduces avoidable crop loss.' },
      ],
    },
    {
      story: 'A rain shower has filled a small storage pond. Some water may be needed during a later dry spell.',
      q: 'How should you use this resource?',
      options: [
        { label: 'Check the pond safely and schedule stored water for dry periods', points: 3, effects: { water: 16, soil: 2, crops: 5 }, feedback: 'Safe storage and planned use can make water available when crops need it.' },
        { label: 'Drain it immediately without checking the field needs', points: 0, effects: { water: -20, soil: 0, crops: -2 }, feedback: 'Unplanned drainage loses water that could support crops later.' },
        { label: 'Use all the water on one plot whether it needs it or not', points: 1, effects: { water: -12, soil: -2, crops: 2 }, feedback: 'Match irrigation to crop and soil needs so water is shared effectively.' },
      ],
    },
  ],
};
