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

// CORRUPTION ADORNMENT

test('text 2', () => {
  const text = 'Life\nmistrelläni\nCORRUPTION\nADORNMENTS\nAncestral Rare Chest Armor\n762 Item Power\n1,334 Armor (-22)\n◆ +12.5% Shadow Damage [10.5 - 17.5]%\n13.0% Damage Reduction from Distant\nEnemies [9.5 - 16.5]%\n+\n+589 Maximum Life [294-638]\n+ +4.8% Total Armor [2.0-4.8]%\nEquip\nLink\n↑STIFT\nTSHIFT Compare\nMark as Junk\nRequires Level 80\nSell Value: 19,340\nDurability: 100/100\nAspe'
  const expected = '{"slotName":"Chest Armor","itemPower":762,"stats":[{"name":"Shadow Damage","min":10.5,"max":17.5,"isPercent":true,"value":12.5},{"name":"Damage Reduction from Distant Enemies","min":9.5,"max":16.5,"isPercent":true,"value":13},{"name":"Maximum Life","min":294,"max":638,"isPercent":false,"value":589},{"name":"Total Armor","min":2,"max":4.8,"isPercent":true,"value":4.8}]}'

  const card = ExtractSlotCard(text)

  expect(JSON.stringify(card)).toBe(expected);
});

// ETERNITY OFFER

test('text 3', () => {
  const text = 'INTENTAR\nETERNITY OFFER\nAncestral Rare Ring\n795 Item Power\n◆ 25.0% Fire Resistance [25.0]%\n◆ 25.0% Poison Resistance [25.01%\n+ +17.5% Critical Strike Damage [10.5 -\n17.5]%\n+16.0% Fortify Generation [15.0-\n22.01%\n+ +6.0% Lucky Hit Chance [3.2-6.01%\n++3.8% Critical Strike Chance [1.8-\n5.01%\nEmpty Vicious malignant socket\nTake\nTimals\nRequires Level 80\nSell Value: 24,995'
  const expected = '{"slotName":"Ring","itemPower":795,"stats":[{"name":"Fire Resistance","min":25,"max":25,"isPercent":true,"value":25},{"name":"Poison Resistance","min":25,"max":25,"isPercent":true,"value":25},{"name":"Critical Strike Damage","min":10.5,"max":17.5,"isPercent":true,"value":17.5},{"name":"Fortify Generation","min":15,"max":22,"isPercent":true,"value":16},{"name":"Lucky Hit Chance","min":3.2,"max":6,"isPercent":true,"value":6},{"name":"Critical Strike Chance","min":1.8,"max":5,"isPercent":true,"value":3.8}]}'

  const card = ExtractSlotCard(text)

  expect(JSON.stringify(card)).toBe(expected);
});

// ODD SIGNET

test('text 4', () => {
  const text = 'ODD SIGNET\nAncestral Rare Ring\n792 Item Power\n• 25.0% Cold Resistance [25.0]%\n• 25.0% Lightning Resistance [25.01%\n• +497 Maximum Life [331-718]\n+ +17.5% Critical Strike Damage [10.5 -\n17.5]%\n+ +14.0% Barrier Generation [7.0 -\n14.01%\n• Golems Inherit +4.4% of Your Thoms\n[4.2 - 7.0]%\nEmpty Vicious malignant socket\nTake\nLink\nSHIFT\nTSHIFT Compare\nRequires Level 80\nSell Value: 24,831'
  const expected = '{"slotName":"Ring","itemPower":792,"stats":[{"name":"Cold Resistance","min":25,"max":25,"isPercent":true,"value":25},{"name":"Lightning Resistance","min":25,"max":25,"isPercent":true,"value":25},{"name":"Maximum Life","min":331,"max":718,"isPercent":false,"value":497},{"name":"Critical Strike Damage","min":10.5,"max":17.5,"isPercent":true,"value":17.5},{"name":"Barrier Generation","min":7,"max":14,"isPercent":true,"value":14},{"name":"Golems Inherit","min":4.2,"max":7,"isPercent":true,"value":4.4}]}'

  const card = ExtractSlotCard(text)

  expect(JSON.stringify(card)).toBe(expected);
});