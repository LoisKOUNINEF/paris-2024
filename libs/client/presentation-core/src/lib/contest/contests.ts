export interface IContest {
  name: string;
  date: Date;
  imageUrl?: string;
  details?: string;
  isParalympic: boolean;
};

export const CONTESTS: Array<IContest> = [
  {
    name: 'Natation Artistique',
    date: new Date(2024, 6, 15),
    imageUrl: 'assets/artistic-swimming.avif',
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: false,
  },
  {
    name: 'Curling',
    date: new Date(2024, 6, 16),
    imageUrl: 'assets/curling.avif',
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: true,
  },
  {
    name: '100 mètres',
    date: new Date(2024, 7, 23),
    imageUrl: 'assets/running.avif',
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: false,
  },
  {
    name: 'Basketball',
    date: new Date(2024, 7, 22),
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: true,
  },
  {
    name: 'Saut à la perche',
    date: new Date(2024, 7, 18),
    imageUrl: 'assets/pole-vault.avif',
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: false,
  },
  {
    name: 'Escrime',
    date: new Date(2024, 7, 20),
    imageUrl: 'assets/fencing.avif',
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: true,
  },
  {
    name: 'Skateboard',
    date: new Date(2024, 7, 20),
    isParalympic: false,
  },
  {
    name: '100 mètres haie',
    date: new Date(2024, 7, 23),
    imageUrl: 'assets/running.avif',
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: false,
  },
  {
    name: 'Water Polo',
    date: new Date(2024, 7, 21),
    imageUrl: 'assets/water-polo.avif',
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: true,
  },
  {
    name: 'Basketball',
    date: new Date(2024, 7, 22),
    details: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed quis nam nemo id illum delectus incidunt laboriosam fugit et aperiam!',
    isParalympic: true,
  },
];


// import { ContestComponent } from '../contest/contest.component';
// import { CONTESTS, IContest } from '../contest/contests';

//   contests: Array<IContest> = CONTESTS;
 