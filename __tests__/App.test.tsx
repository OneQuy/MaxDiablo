// /**
//  * @format
//  */

import { ExtractSlotCard } from "../scr/OCRUtils";

// import 'react-native';
// import React from 'react';
// import App from '../App';

// // Note: import explicitly to use the types shiped with jest.
// import {it} from '@jest/globals';

// // Note: test renderer must be required after react-native.
// import renderer from 'react-test-renderer';

// it('renders correctly', () => {
//   renderer.create(<App />);
// });

// WRAITH BOON

test('text 1', () => {
  const text = '809126740014&set=gm.8083606876849218idorvanity=762479998939657\nmes\n9gag\ntmp\ngoogle tools\n//////////////\ndev\nWRAITH BOON\nAncestral Rare Pants\n820 Item Power\nimobility\npages\n820 Armor (+20)\n• While Injured, Your Potion Also\nRestores 20% Resource [20]%\nKHÔNG ĐẠO ĐỨC CHẾ\n8.0% Damage Reduction from Close\nEnemies [7.0-14.0]%\n5.2% Dodge Chance [3.0-5.81%\n10.1% Damage Reduction while\nFortified [4.9-10.5]%\n• 18.5% Damage Reduction while\nInjured [17.5-31.5]%\nwarm\nRadio Garden\nRequires Level 80\nSell Value: 26,387\nDurability: 100/100\nLUNDUS'
  const expected = '{"slotName":"Pants","itemPower":820,"stats":[{"name":"Damage Reduction from Close Enemies","min":7,"max":14,"isPercent":true,"value":8},{"name":"Dodge Chance","min":3,"max":5.8,"isPercent":true,"value":5.2},{"name":"Damage Reduction while Fortified","min":4.9,"max":10.5,"isPercent":true,"value":10.1},{"name":"Damage Reduction while Injured","min":17.5,"max":31.5,"isPercent":true,"value":18.5}]}'

  const card = ExtractSlotCard(text)

  expect(JSON.stringify(card)).toBe(expected);
});