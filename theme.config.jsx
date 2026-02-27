import React from 'react'

export default {
  logo: <span>Makinari API</span>,
  project: {
    link: 'https://github.com/makinari/api',
  },
  docsRepositoryBase: 'https://github.com/makinari/api/tree/main',
  footer: {
    text: `© ${new Date().getFullYear()} Makinari.`,
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    autoCollapse: false,
  },
  navigation: {
    prev: true,
    next: true,
  },
  toc: {
    float: true,
    title: "En esta página",
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system'
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Makinari API'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Makinari API Documentation" />
      <meta property="og:description" content="Complete API documentation for Makinari platform" />
    </>
  )
} 