// Ad definitions per creative set. Copy is the source of truth for both the
// image text (imageHeadline) and the Meta ad fields (see content/02-term1-ad-set-1.md).
export const sets = {
  'term1-set1': [
    { id: 'a1-terug-skool', mock: 'testCard',
      headline: 'Nuwe kwartaal. Kalmer toetse.',
      imageHeadline: 'Nuwe kwartaal.<br>Kalmer toetse.' },
    { id: 'a5-geen-tyd', mock: 'notification',
      headline: 'Geen tyd om elke aand vrae te vra nie?',
      imageHeadline: 'Geen tyd om elke aand vrae te vra nie?' },
    { id: 'a6-ek-het-geleer', mock: 'readiness',
      headline: '“Ek het geleer, Ma.” Maar weet jy regtig?',
      imageHeadline: 'Maar weet jy regtig?' },
    { id: 'a7-nie-eksaminator', mock: 'feedback',
      headline: 'Wees weer net Ma, nie die eksaminator nie.',
      imageHeadline: 'Wees weer net Ma, nie die eksaminator nie.' },
  ],
};
