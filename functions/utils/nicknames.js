exports.chooseNickname = function() {
  // Create an array of Anon names
  const selectableStrings = [
    "Dinosaur", "Primitive", "Legend", "Cultist", "Crusader", "Inquisitor",
    "Bureaucrat", "Revolutionary", "Plutocrat", "Cat", "Savage", "Cyborg",
    "Alien", "Communist", "Toy", "Utopian", "Robot",
  ];
  const randomIndex = Math.floor(Math.random() * selectableStrings.length);
  return `Anonymous ${selectableStrings[randomIndex]}`;
};
