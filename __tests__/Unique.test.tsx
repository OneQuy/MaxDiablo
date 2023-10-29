
// WRAITH BOON

import { GetSuitBuildsForUnique } from "../scr/OCRUtils";

import uniqueBuilds from '../assets/UniqueBuilds.json'

test('d4-ancestral-harlequin-crest', () => {
  const text = "\r\n\r\nHARLEQUIN CREST Ancestral Unique Helm 820 Item Power\r\n1,025 Armor\r\n• +1,000 Maximum Life [732 - 1,359] • 9.6% Cooldown Reduction [4.4- 10.0]%\r\n⚫ 11.5% Resource Generation [5.0- 12.01%\r\n• +20 All Stats +[20-28]\r\nGain 20.0% [10.0-20.01% Damage Reduction.\r\nIn addition, gain +4 Ranks to all Skills. \"This headdress was once worn by an assassin disguised as a court mage. Her treachery was unveiled, but not before she used its magic to curse the king's entire lineage.\"\r\n-The Fall of House Aston\r\nRequires Level 100 Account Bound Unique Equipped\r\nSell Value: 145,130 Durability: 100/100"
  const expected = '[\"Build Rapid Fire Rogue\",\"Build Barrage Rogue\",\"Build Penetrating Shot Rogue\"]'

  const arr = GetSuitBuildsForUnique(text, uniqueBuilds)

  expect(JSON.stringify(arr)).toBe(expected);
});