import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Rati Logs',
  tagline: '배운걸 자꾸 까먹길래 만들었습니다.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://rati-logs.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'rati-logs', // Usually your GitHub org/user name.
  projectName: 'rati-logs.github.io', // Usually your repo name.

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        blog: {
          showReadingTime: true,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/ratilogs-social-card.png',
    navbar: {
      title: 'Rati Logs',
      logo: {
        alt: 'Rati Logs Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Logs',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Go to page',
          items: [
            {
              label: 'Logs',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: 'https://sscoderati.github.io',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/sscoderati',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Changgi Hong. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
