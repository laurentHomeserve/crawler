import { parseHomePage, getMenu, getBrand } from './homepage';
import { getIndexPage } from './indexPages';
import { getContentPage } from './contentPage';
import { ActuIntro, Category, Homepage, Link, Menu, News, Teaser } from './models';
import { getActuPage, getMenuActu } from './actu-conseil';
import { XMLParser } from 'fast-xml-parser';
import { fetchUrl, saveFile, getLink, getPath } from './utils';
import { config, valueConfig } from './config';

const MainDir = config[valueConfig].dir;
const MainUrl = config[valueConfig].url;

import * as cheerio from 'cheerio';
import { getCityTown } from './getCityPage';
import { getAboutUsMenu, getAboutUsPage } from './aboutUs';

(async () => {
    const content = await fetchUrl(MainUrl);

    const homepage: Homepage = parseHomePage(content);
    const brand = getBrand(content);
    await saveFile(brand, 'brand.json', MainDir); 
    await saveFile(homepage, 'index.json', MainDir);

    // Parser et sauvegarder le menu
    const menu = getMenu(content);
    await saveFile(menu, 'menu.json', MainDir);

    menu.map(async (menu: Menu) => {
      const dir: string = menu.link.href.replace(MainUrl, '');
      let indexPage = getIndexPage(await fetchUrl(menu.link.href));
      await saveFile(indexPage, dir+'/index.json', MainDir);
      menu.categories.map(async (category: Category) => {
        if (category.link) {
          const url: string = getLink(category.link.href, MainUrl);
          let contentPage = getContentPage(await fetchUrl(url), url);
          await saveFile(contentPage, `/${getPath(url, MainUrl)}.json`, MainDir);
        }

        category.subLinks?.map(async (link: Link) => {
          const url: string = getLink(link.href, MainUrl);
          let contentPage = getContentPage(await fetchUrl(url), url);
          await saveFile(contentPage, `/${getPath(url, MainUrl)}.json`, MainDir);         
        });

      });
    });
    
    //Blog
    const actuList: string = await fetchUrl(`${MainUrl}conseils-et-actualites`);
    const actuMenu:ActuIntro = getMenuActu(actuList);
    await saveFile(actuMenu, 'menu-actu.json', MainDir);

    actuMenu.news.map(async (news: News) => {
      const actuPageUrl = news.url.href;
      const actuPage = await fetchUrl(actuPageUrl);
      const url = news.url.href;
      const parts = url.split("/"); 
      const slug = (parts.pop() || "no-name") + '.json'; 
      await saveFile(getActuPage(actuPage), 'actu/'+slug, MainDir);
    });

    // Town
    const xmlString: string = await fetchUrl(`${MainUrl}sitemap.local_pages.xml`);
    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlString);

    jsonObj.urlset.url.map(async (url: { loc: string }) => {
      if(url.loc.match(/\/chauffage-/)) {
        const urlContent = await fetchUrl(url.loc);
        const path = getPath(url.loc, MainUrl);
        const contentPage = getCityTown(urlContent);
        await saveFile(contentPage, `town/${path}.json`, MainDir);
      }
    });

    //About Us
    const aboutUsMenu = getAboutUsMenu(content);
    await saveFile(aboutUsMenu, 'menu-about-us.json', MainDir);

    aboutUsMenu.map(async (link) => {
      const aboutContent = await fetchUrl(link.href);
      const path = getPath(link.href, MainUrl);
      const savePath = (path: string) => {
        if (path === 'qui-sommes-nous') {
          return 'index';
        }
        return path.replace('qui-sommes-nous/', '');
      }
      const Aboutpage = getAboutUsPage(aboutContent);
      await saveFile(Aboutpage, `aboutus/${savePath(path)}.json`, MainDir);
    });
})();