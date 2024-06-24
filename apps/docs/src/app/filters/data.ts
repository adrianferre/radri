import { faker } from "@faker-js/faker";

faker.seed(1234);

export const animalsTypes = [
  "bear",
  "bird",
  "cat",
  "cetacean",
  "cow",
  // cspell:disable-next-line
  "crocodilia",
  "dog",
  "fish",
  "horse",
  "insect",
  "lion",
  "rabbit",
  "rodent",
  "snake",
];

export const animals = animalsTypes.reduce<
  {
    id: string;
    type: string;
    name: string;
  }[]
>((acc, animalType) => {
  acc.push(
    ...Array.from({ length: 10 }, () => ({
      id: faker.string.uuid(),
      type: animalType,
      name:
        (animalType in faker.animal &&
          typeof faker.animal[animalType] === "function" &&
          faker.animal[animalType]?.()) ??
        "",
    }))
  );

  return acc;
}, []);
