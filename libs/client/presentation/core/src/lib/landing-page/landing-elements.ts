import { ILandingSection } from "./landing-section/landing-section.component";

const defaultContent = 'Lorem, ipsum dolor sit amet consectetur adipisicing, elit. Necessitatibus corrupti dolores, numquam sunt impedit eos, quos quaerat amet sit saepe facilis. Repellat labore amet et, aliquid magnam sit iure minima! Error modi dolor quibusdam quod consequatur totam dicta, voluptatem, porro harum ut omnis veniam nihil, deserunt eligendi quasi mollitia rerum. ';

export const LANDING_ELEMENTS: Array<ILandingSection> = [
    {
      title: 'La Compétition',
      imageUrl: 'assets/images/eiffel-rings.avif',
      imageAlt: 'Anneaux olympiques sur une place parisienne.',
      content: defaultContent,
    },
    {
      title: 'Pour Tous',
      imageUrl: 'assets/images/rings.avif',
      imageAlt: 'La tour Eiffel décorée des anneaux olympiques',
      content: defaultContent,
    },
    {
      title: 'Et encore plus',
      imageUrl: 'assets/images/eiffel-rings-sunset.avif',
      imageAlt: 'Coucher de soleil sur la tour Eiffel décorée des anneaux olympiques',
      content: defaultContent,
    }
  ]