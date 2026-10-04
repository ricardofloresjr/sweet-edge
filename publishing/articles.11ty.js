export default class {
  data() {
    return {
      pagination: { data: 'articlePages', size: 1, alias: 'article' },
      permalink: data => `/news/${data.article.lang === 'en' ? '' : data.article.lang + '/'}${data.article.post.slug}/index.html`,
      layout: 'article.njk'
    };
  }
  render() { return ''; }
}
