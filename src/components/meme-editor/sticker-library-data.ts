export type StickerCard = {
  id: string;
  label: string;
  emoji: string;
  src: string;
};

function emojiToOpenMojiSrc(emoji: string) {
  const codepoints = Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16).toUpperCase())
    .filter((value): value is string => Boolean(value))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji/color/svg/${codepoints}.svg`;
}

const OPENMOJI_EMOJIS: Array<[string, string]> = [
  ["smile", "😀"], ["grin", "😁"], ["joy", "😂"], ["laugh", "🤣"], ["slight-smile", "🙂"], ["upside-down", "🙃"],
  ["wink", "😉"], ["smirk", "😏"], ["cool", "😎"], ["love", "😍"], ["kiss", "😘"], ["hug", "🤗"],
  ["party", "🥳"], ["nerd", "🤓"], ["sunglasses", "🕶️"], ["thinking", "🤔"], ["mindblown", "🤯"], ["sleepy", "😴"],
  ["sad", "😢"], ["cry", "😭"], ["angry", "😡"], ["rage", "🤬"], ["shocked", "😱"], ["clown", "🤡"],
  ["skull", "💀"], ["ghost", "👻"], ["alien", "👽"], ["robot", "🤖"], ["poop", "💩"], ["melt", "🫠"],
  ["thumbs-up", "👍"], ["thumbs-down", "👎"], ["ok", "👌"], ["clap", "👏"], ["muscle", "💪"], ["pray", "🙏"],
  ["wave", "👋"], ["point-up", "☝️"], ["eyes", "👀"], ["brain", "🧠"], ["idea", "💡"], ["rocket", "🚀"],
  ["zap", "⚡"], ["fire", "🔥"], ["sparkles", "✨"], ["star", "⭐"], ["100", "💯"], ["check", "✅"],
  ["cross", "❌"], ["warning", "⚠️"], ["heart", "❤️"], ["broken-heart", "💔"], ["gift", "🎁"], ["party-popper", "🎉"],
  ["tada", "🎊"], ["balloon", "🎈"], ["cake", "🎂"], ["coffee", "☕"], ["pizza", "🍕"], ["burger", "🍔"],
  ["fries", "🍟"], ["taco", "🌮"], ["sushi", "🍣"], ["ice-cream", "🍦"], ["donut", "🍩"], ["cookie", "🍪"],
  ["apple", "🍎"], ["banana", "🍌"], ["grapes", "🍇"], ["cherries", "🍒"], ["watermelon", "🍉"], ["lemon", "🍋"],
  ["cat", "🐱"], ["dog", "🐶"], ["frog", "🐸"], ["panda", "🐼"], ["unicorn", "🦄"], ["lion", "🦁"],
  ["penguin", "🐧"], ["monkey", "🐵"], ["turtle", "🐢"], ["snail", "🐌"], ["bird", "🐦"], ["fish", "🐟"],
  ["flower", "🌸"], ["rose", "🌹"], ["sun", "☀️"], ["moon", "🌙"], ["cloud", "☁️"], ["rainbow", "🌈"],
];

export const OPENMOJI_STICKERS: StickerCard[] = OPENMOJI_EMOJIS.map(([id, emoji]) => ({
  id,
  label: id.replace(/-/g, " "),
  emoji,
  src: emojiToOpenMojiSrc(emoji),
}));
