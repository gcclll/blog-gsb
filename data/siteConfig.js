module.exports = {
  siteTitle: '若叶知秋',
  siteDescription: '落叶相依浑似醉，潦倒何妨；悠悠岁月谁高歌，绝胜柳狂。',
  authorName: 'ZhiCheng Lee',
  twitterUsername: 'gccll_love',
  authorAvatar: 'avatar.jpeg', // file in content/images
  defaultLang: 'en', // show flag if lang is not default. Leave empty to enable flags in post lists
  authorDescription: `
  For the last decade, Maxence Poutord has worked with a variety of web technologies. He is currently focused on front-end development.
  On his day to day job, he is working as a senior front-end engineer at VSware. He is also an occasional tech speaker and a mentor.
  As a digital nomad, he is living where the WiFi and sun are 😎 <br>
  Do you want to know more? <a href="https://www.maxpou.fr/about" rel="noopener" target="_blank">Visit my website!</a>
  `,
  siteUrl: 'http://iblog.ii6g.com/',
  disqusSiteUrl: 'http://iblog.ii6g.com/',
  // Prefixes all links. For cases when deployed to maxpou.fr/gatsby-starter-morning-dew/
  pathPrefix: '/gccll', // Note: it must *not* have a trailing slash.
  siteCover: 'cover-baymax.jpg', // file in content/images
  googleAnalyticsId: 'UA-67868977-2',
  background_color: '#ffffff',
  theme_color: '#222222',
  display: 'standalone',
  icon: 'content/images/baymax.png',
  postsPerPage: 6,
  disqusShortname: 'maxpou',
  headerTitle: 'ZhiCheng Lee',
  headerLinksIcon: 'baymax.png', //  (leave empty to disable: '')
  headerLinks: [
    {
      label: 'Blog',
      url: '/'
    },
    {
      label: 'About',
      url: '/about-gatsby-starter-morning-dew'
    },
    {
      label: 'Installation',
      url: '/how-to-install'
    }
  ],
  // Footer information (ex: Github, Netlify...)
  websiteHost: {
    name: 'GitHub',
    url: 'https://github.com'
  },
  footerLinks: [
    {
      sectionName: 'Explore',
      links: [
        {
          label: 'Blog',
          url: '/'
        },
        {
          label: 'About',
          url: '/about-gatsby-starter-morning-dew'
        },
        {
          label: 'Installation',
          url: '/how-to-install'
        }
      ]
    },
    {
      sectionName: 'Follow the author',
      links: [
        {
          label: 'GitHub',
          url: 'https://github.com/gcclll/blog-gsb'
        },
        {
          label: 'Website',
          url: 'http://blog.ii6g.com'
        },
        {
          label: 'Twitter',
          url: 'https://twitter.com/gccll_love'
        }
      ]
    }
  ]
}
