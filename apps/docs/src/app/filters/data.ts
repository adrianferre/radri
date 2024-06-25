import { faker, type AnimalModule } from "@faker-js/faker";

faker.seed(1234);

export const animalsTypes: (keyof AnimalModule)[] = [
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
      name: faker.animal[animalType](),
    }))
  );

  return acc;
}, []);
