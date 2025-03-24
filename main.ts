import axios from 'axios';
import { parseHomePage, getMenu, getBrand } from './homepage';
import { getIndexPage } from './indexPages';
import { getContentPage } from './contentPage';
import { ActuIntro, Homepage, Menu, News, Teaser } from './models';
import { getActuPage, getMenuActu } from './actu-conseil';
import * as fs from 'node:fs/promises';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

const config = [
  {
    dir: './geodis',
    url: 'https://www.geodis-energies.fr/'
  },
  {
    dir: './chauffage-du-nord',
    url: 'https://www.chauffage-du-nord.fr/'
  },
  {
    dir: './lepretre',
    url: 'https://www.lepretre-energies.fr/'
  },
  {
    dir: './concept-habitat',
    url: 'https://www.concept-habitat-normandie.fr/'
  },
  {
    dir: './id-energies',
    url: 'https://www.id-energies.com/'
  },
  {
    dir: './jcmconfort',
    url: 'https://www.jcmconfort.fr/'
  },
  {
    dir: './smt',
    url: 'https://www.smt-energies.fr/'
  },
  {
    dir: './vbgaz',
    url: 'https://www.vbgaz.fr/'
  }
];

const valueConfig = 5;

const MainDir = config[valueConfig].dir;
const MainUrl = config[valueConfig].url;

//const Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6ImRpZ2l0YWwtYWNxdWlzaXRpb24tNGMxMjQzOTQtYjJjZC00M2M2LTk5NTItNTc4MGYyYWU0NGJkXzUiLCJkYXRlIjoxNzM4MTQ0NTgxLCJkb21haW4iOiJkaWdpdGFsLWFjcXVpc2l0aW9uIiwiYXBwTmFtZSI6Im1pZ3JhdGlvbiIsImlhdCI6MTczODE0NDU4MX0.RRLEpcdAKXTzXgVmtOUIOwn4QwL7dxxyoKqGs-Bdxm4';
//const repository = 'digital-acquisition';

// Fonction pour récupérer la page d'accueil
async function fetchUrl(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(url);
    throw new Error(`Impossible de récupérer la page ${url}`);
  }
}

// Fonction pour sauvegarder un objet JSON dans un fichier
async function saveFile(obj: any, filePath: string): Promise<void> {
  const result: string = JSON.stringify(obj, null, 2); // Formater pour une meilleure lisibilité

  // Chemin complet pour le fichier
  const fullPath = path.join(MainDir, filePath);

  // S'assurer que le répertoire existe
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  // Écrire le fichier
  try {
    await fs.writeFile(fullPath, result);
  } catch (error) {
    console.log('Erreur lors de l\'écriture du fichier :', fullPath, result);
  }
  console.log(`Fichier enregistré avec succès à : ${fullPath}`);
}

function getLink(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }

  return `${MainUrl}${url}`;
}

function getPath(string: string): string {
  string = string.replace(MainUrl, '');
  if (string.startsWith('/')) {
    return string.slice(1);
  }

  return string;
}

import * as cheerio from 'cheerio';
import { getCityTown } from './getCityPage';
import { getAboutUsMenu, getAboutUsPage } from './aboutUs';

// Exemple d'utilisation
(async () => {

    // Récupérer le contenu de la page
    const content = await fetchUrl(MainUrl);

    // Parser et sauvegarder la page d'accueil
    const homepage: Homepage = parseHomePage(content);
    const brand =  getBrand(content);
    await saveFile(brand, 'brand.json'); 
    await saveFile(homepage, 'index.json');

    // Parser et sauvegarder le menu
    const menu = getMenu(content);
    await saveFile(menu, 'menu.json');

    menu.map(async (menu: Menu) => {
      const dir: string = menu.link.href.replace(MainUrl, '');
      let indexPage = getIndexPage(await fetchUrl(menu.link.href));
      await saveFile(indexPage, dir+'/index.json');
      menu.subMenu.map(async (sub: { href: string }) => {
        const url: string = getLink(sub.href);
        let contentPage = getContentPage(await fetchUrl(url), url);
        await saveFile(contentPage, `/${getPath(url)}.json`);
      });
    });
    

    //Blog

    const actuList: string = await fetchUrl(`${MainUrl}conseils-et-actualites`);

    const actuMenu:ActuIntro = getMenuActu(actuList);
    await saveFile(actuMenu, 'menu-actu.json');

    actuMenu.news.map(async (news: News) => {
      const actuPageUrl = news.url.href;
      const actuPage = await fetchUrl(actuPageUrl);
      const url = news.url.href;
      const parts = url.split("/"); 
      const slug = (parts.pop() || "no-name") + '.json'; 
      await saveFile(getActuPage(actuPage), 'actu/'+slug);
    })

  // Town
  const xmlString: string = await fetchUrl(`${MainUrl}sitemap.local_pages.xml`);
  const parser = new XMLParser();
  const jsonObj = parser.parse(xmlString);

  jsonObj.urlset.url.map(async (url: { loc: string }) => {
    if(url.loc.match(/\/chauffage-/)) {
      const urlContent = await fetchUrl(url.loc);
      const path = getPath(url.loc);
      const contentPage = getCityTown(urlContent);
      await saveFile(contentPage, `town/${path}.json`);
    }

  });

  //About Us
  const aboutUsMenu = getAboutUsMenu(content);
  await saveFile(aboutUsMenu, 'menu-about-us.json');

  aboutUsMenu.map(async (link) => {
    const aboutContent = await fetchUrl(link.href);
    const path = getPath(link.href);
    const savePath = (path: string) => {
      if (path === 'qui-sommes-nous') {
        return 'index';
      }

      return path.replace('qui-sommes-nous/', '');
    }
    const Aboutpage = getAboutUsPage(aboutContent);
    await saveFile(Aboutpage, `aboutus/${savePath(path)}.json`);
  })

})();