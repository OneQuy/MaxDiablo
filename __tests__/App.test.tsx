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

// BONEBREAKER OF RETRIBUTION

test('text 5', () => {
  const text = 'BONEBREAKER OF\nRETRIBUTION\nAncestral Legendary Two-\nHanded Mace\n820+25 Item Power\n◆ Upgrades: 5/5\n2,741 Damage Per Second\n→ [2,436 - 3,654] Damage per Hit\n0.90 Attacks per Second (Slow\nWeapon)\n+94.5% Overpower Damage [94.5]%\n+42.0% Vulnerable Damage [21.0 -\n42.0]%\n+ +52.5% Critical Strike Damage [31.5 -\n52.5]%\n+156 Strength [114-156]\n+84 All Stats [60 - 84]\n★ Distant enemies have a 8% chance to\nbe Stunned for 2 seconds when they\nhit you. You deal 40%[x] [20-40]%\nincreased damage to Stunned\nenemies.\nAsnert unlocked by completing'
  const expected = '{"slotName":"Two-Handed Mace","itemPower":820,"stats":[{"name":"Overpower Damage","min":94.5,"max":94.5,"isPercent":true,"value":94.5},{"name":"Vulnerable Damage","min":21,"max":42,"isPercent":true,"value":42},{"name":"Critical Strike Damage","min":31.5,"max":52.5,"isPercent":true,"value":52.5},{"name":"Strength","min":114,"max":156,"isPercent":false,"value":156},{"name":"All Stats","min":60,"max":84,"isPercent":false,"value":84}]}'

  const card = ExtractSlotCard(text)

  expect(JSON.stringify(card)).toBe(expected);
});

// HAVOC VOW

test('text 6', () => {
  const text = 'HAVOC VOW\nAncestral Rare Ring\n774 Itern Power\n*\n+\n24.8% Cold Resistance [24.8]%\n24.8% Lightning Resistance [24.81%\n+613 Maximum Life [306-664]\n+16.5% Critical Strike Damage [10.5\n17.5]%\n+20.0% Damage to Close Enemies [16.5 -\n23.5]%\n+10.0% Barrier Generation [7.0- 14.0]%\nEmpty Devious malignant socket\nTake\n+Link\nSHIFT Compare\n-\nRequires Level 80\nSell Value: 23,852'
  const expected = '{"slotName":"Ring","itemPower":774,"stats":[{"name":"Cold Resistance","min":24.8,"max":24.8,"isPercent":true,"value":24.8},{"name":"Lightning Resistance","min":24.8,"max":24.8,"isPercent":true,"value":24.8},{"name":"Maximum Life","min":306,"max":664,"isPercent":false,"value":613},{"name":"Critical Strike Damage","min":10.5,"max":17.5,"isPercent":true,"value":16.5},{"name":"Damage to Close Enemies","min":16.5,"max":23.5,"isPercent":true,"value":20},{"name":"Barrier Generation","min":7,"max":14,"isPercent":true,"value":10}]}'

  const card = ExtractSlotCard(text)

  expect(JSON.stringify(card)).toBe(expected);
});