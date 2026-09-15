import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase.js';

gsap.registerPlugin(CustomEase);

CustomEase.create('spring', '0.16, 1, 0.3, 1');
CustomEase.create('cockpitSpring', '0.16, 1, 0.3, 1');

const springEase = gsap.parseEase('spring');
const cockpitSpringEase = gsap.parseEase('cockpitSpring');

console.log('gsap.parseEase("spring"):', typeof springEase, springEase.toString ? springEase.name || '[Function: ease]' : springEase);
console.log('gsap.parseEase("cockpitSpring"):', typeof cockpitSpringEase, cockpitSpringEase.toString ? cockpitSpringEase.name || '[Function: ease]' : cockpitSpringEase);
