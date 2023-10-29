import uniqueBuilds from '../assets/UniqueBuilds.json'
import { GetSuitBuildsForUnique } from '../scr/AppUtils';

test('d4-ancestral-harlequin-crest', () => {
  const text = "\r\n\r\nHARLEQUIN CREST Ancestral Unique Helm 820 Item Power\r\n1,025 Armor\r\n• +1,000 Maximum Life [732 - 1,359] • 9.6% Cooldown Reduction [4.4- 10.0]%\r\n⚫ 11.5% Resource Generation [5.0- 12.01%\r\n• +20 All Stats +[20-28]\r\nGain 20.0% [10.0-20.01% Damage Reduction.\r\nIn addition, gain +4 Ranks to all Skills. \"This headdress was once worn by an assassin disguised as a court mage. Her treachery was unveiled, but not before she used its magic to curse the king's entire lineage.\"\r\n-The Fall of House Aston\r\nRequires Level 100 Account Bound Unique Equipped\r\nSell Value: 145,130 Durability: 100/100"
  const expected = '[\"Build Rapid Fire Rogue\",\"Build Barrage Rogue\",\"Build Penetrating Shot Rogue\"]'

  const arr = GetSuitBuildsForUnique(text, uniqueBuilds)

  expect(JSON.stringify(arr)).toBe(expected);
});

test('TIBAULTS WILL', () => {
  const text = "\r\n\r\nTIBAULT'S WILL\r\nAncestral Unique Pants\r\n925+25 Item Power\r\nUpgrades: 5/5\r\n950 Armor\r\nWhile Injured, Your Potion Also Restores 30% Resource [30]%\r\nPACTS GRANTED (4/4):\r\n2\r\n2\r\nB\r\nB\r\n+21.0% Damage [15.8-26.2]%\r\n+3 Potion Capacity [3-4]\r\n+18 Maximum Resource [8-20]"
  const expected = "[\"Build Death Trap Rogue\",\"Build Twisting Blades Rogue\",\"Build Ball Lightning Sorc\",\"Build Double Swing Barb\",\"Build Rapid Fire Rogue\",\"Build Barrage Rogue\",\"Build Penetrating Shot Rogue\",\"Build Blizzard Sorc\",\"Build Ice Shards Sorc\",\"Build HotA Barb\",\"Build Walking Arsenal Barb\",\"Build Whirlwind Barb\",\"Build Flurry Rogue\",\"Build Fireball Sorc\",\"Build Arc Lash Sorc\"]"

  const arr = GetSuitBuildsForUnique(text, uniqueBuilds)

  expect(JSON.stringify(arr)).toBe(expected);
});

test('TUSKHELM OF JORITZ THE MIGHTY', () => {
  const text = "\r\n\r\nTUSKHELM OF JORITZ THE MIGHTY\r\nAncestral Unique Helm\r\n832+25 Item Power\r\n♦ Upgrades: 5/5\r\n1,071 Armor\r\nPACTS GRANTED (3/3):\r\nY 3\r\n• +12.0% Attack Speed\r\n⚫ +14.2% Damage while Berserking • +14 Maximum Fury\r\n⚫ +3 Ranks of the Aggressive Resistance Passive (Barbarian Only)\r\nWhen you gain Berserking while already Berserk, you have a 50% chance to become more enraged granting 15% increased damage, 2 Fury per second, and 10% Cooldown Reduction.\r\n4.0% Maximum Life\r\nAs he fought with side by side with Raekor to liberate the labor camp, Joritz claimed this dented helm from a fallen foe. As his legend grew, its unique shape became synonymous with his great deeds."
  const expected = "[\"Build Whirlwind Barb\"]"

  const arr = GetSuitBuildsForUnique(text, uniqueBuilds)

  expect(JSON.stringify(arr)).toBe(expected);
});


test('TUSKHELM OF JORITZ THE MIGHTY 2', () => {
  const text = "\r\n\r\nTUSKHELM OF\r\nJORITZ THE MIGHTY\r\nAncestral Unique Helm\r\n832+25 Item Power\r\n♦ Upgrades: 5/5\r\n1,071 Armor\r\nPACTS GRANTED (3/3):\r\nY 3\r\n• +12.0% Attack Speed\r\n⚫ +14.2% Damage while Berserking • +14 Maximum Fury\r\n⚫ +3 Ranks of the Aggressive Resistance Passive (Barbarian Only)\r\nWhen you gain Berserking while already Berserk, you have a 50% chance to become more enraged granting 15% increased damage, 2 Fury per second, and 10% Cooldown Reduction.\r\n4.0% Maximum Life\r\nAs he fought with side by side with Raekor to liberate the labor camp, Joritz claimed this dented helm from a fallen foe. As his legend grew, its unique shape became synonymous with his great deeds."
  const expected = "[\"Build Whirlwind Barb\"]"

  const arr = GetSuitBuildsForUnique(text, uniqueBuilds)

  expect(JSON.stringify(arr)).toBe(expected);
});