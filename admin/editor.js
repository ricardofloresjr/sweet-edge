/* Decap is loaded only on /admin; visitors never download the editor. */
CMS.registerPreviewStyle('/style.css');
CMS.registerPreviewTemplate('posts', function PostPreview({ entry, widgetFor, getAsset }) {
  const h = window.h;
  const image = entry.getIn(['data', 'image']);
  return h('article', { className: 'article-content', style: { padding: '28px' } },
    h('p', {}, entry.getIn(['data', 'kind']) === 'event' ? 'Event' : 'News'),
    h('h1', {}, entry.getIn(['data', 'title'])),
    h('p', { className: 'lead' }, entry.getIn(['data', 'summary'])),
    entry.getIn(['data', 'event_date']) && h('p', {}, [entry.getIn(['data', 'event_date']), entry.getIn(['data', 'event_time']), entry.getIn(['data', 'event_location'])].filter(Boolean).join(' · ')),
    image && h('img', { className: 'article-cover', src: getAsset(image).toString(), alt: entry.getIn(['data', 'image_alt']) || '' }),
    h('div', { className: 'article-body' }, widgetFor('body'))
  );
});
CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    const data = entry.get('data');
    // The default locale is exposed at the root of Decap's editor entry.
    if (data.get('kind') === 'news' && !data.get('date')) throw new Error('Please add a publication date for this news item.');
    if (data.get('kind') === 'event' && !data.get('event_date')) throw new Error('Please add the event start date.');
    if (data.get('event_end_date') && data.get('event_end_date') < data.get('event_date')) throw new Error('The event end date must be on or after its start date.');
    return data;
  }
});
CMS.init();
