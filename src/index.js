/* global document, window, $ */
'use strict'

window.$ = require('jquery')
const moment = require('moment')

const POST_INDEX = require('json!./postIndex.json').posts
const BODY = $('#site-body')
// const Prism = require('./vendor/prism.js')

function renderDate (date) {
  //return moment(date).fromNow() + ' - ' + moment(date).calendar()
  return moment(date).calendar()
}
function renderTitle (title) {
  return title.replace(/\_/g, ' ')
}

function siteContentGenerator (rawQuery) {
  const query = rawQuery.substr(1).split('/')[0]
  // RESUME PAGE
  if (query === 'resume') {
    $.get('/posts/_resume.html', function (data) {
      BODY.html(data)
      window.history.pushState({
        'html': data,
        'pageTitle': query
      }, '', rawQuery)
    })
  // } else if (query === 'contact') {
  //   const CONTACT_PAGE_HTML = '' +
  //     '<div class="page-container">\n' +
  //     '  <div class="title">Contact</div>\n' +
  //     '  <div class="subtitle">Contact me here</div>\n' +
  //     '</div>'
  //   BODY.html(CONTACT_PAGE_HTML)
  //   window.history.pushState({
  //     'html': CONTACT_PAGE_HTML,
  //     'pageTitle': query
  //   }, '', rawQuery)


  // HOME PAGE / INDEX
  } else if (query === '' || query === undefined) {
    var POST_LIST_HTML = '' +
      '<div class="blog-index-container">' +
      '<img src="/assets/me.png" width="93px" height="93px" />'
    // Most recent...
    POST_INDEX.sort(function (a, b) {
      return b.date - a.date
    })
    for (var i = 0; i < POST_INDEX.length; i++) {
      POST_LIST_HTML += '' +
         '<div class="blog-content-container">\n' +
         '  <div class="blog-content blog">\n' +
         '  <a href="/' + POST_INDEX[i].file + '" class="local-link title">' +
              renderTitle(POST_INDEX[i].file) + '</a>\n' +
         '  <div class="date">' + renderDate(POST_INDEX[i].date) + '</div>\n'
      if (POST_INDEX[i].preview !== undefined) {
        POST_LIST_HTML += '' +
          '  <div class="blog-content-item"><div class="preview">' +
               POST_INDEX[i].preview +
          '  </div></div>\n'
      }
      POST_LIST_HTML += '  </div>\n</div>\n'
    }
    POST_LIST_HTML += '</div>\n'
    BODY.html(POST_LIST_HTML)
    window.history.pushState({
      'html': POST_LIST_HTML,
      'pageTitle': query
    }, '', rawQuery)
  // SOME OTHER QUERY - SEARCH FOR POSTS
  } else {
    $.ajax({
      url: '/posts/' + query + '.html',
      type: 'get',
      error: function (err) {
        const ERROR_PAGE_HTML = '' +
          '<div class="title-container">\n' +
          '  <div class="title">Uh oh, something went wrong!</div>\n' +
          '  <div class="subtitle">Server said "' + err.statusText + '"</div>\n' +
          '</div>\n'
        BODY.html(ERROR_PAGE_HTML)
        window.history.pushState({
          'html': ERROR_PAGE_HTML,
          'pageTitle': query
        }, '', rawQuery)
      },
      success: function(data) {
        var thisPost = {}
        for (var j = 0; j < POST_INDEX.length; j++) {
          if (POST_INDEX[j].file === query) {
            thisPost = POST_INDEX[j]
          }
        }
        const BLOG_POST_HTML = '' +
          '<div class="blog-content-container">\n' +
          '  <div class="blog-content blog">\n' +
          '    <a href="/' + thisPost.file + '" class="local-link title">' +
                 renderTitle(thisPost.file) + '</a>\n' +
          '    <div class="date">' + renderDate(thisPost.date) + '</div>\n' +
          '    <div class="blog-content-item">' + data + '</div>\n' +
          '  </div>\n' +
          '</div>\n'
        BODY.html(BLOG_POST_HTML)
        window.history.pushState({
          'html': BLOG_POST_HTML,
          'pageTitle': query
        }, '', rawQuery)
      }
    })
  }
}

siteContentGenerator(window.location.pathname)

function localLink (event) {
  event.preventDefault()
  siteContentGenerator($(this).attr('href'))
  return false
}
$('.menu a.local-link').click(localLink)
BODY.delegate('a.local-link', 'click', localLink)

window.onpopstate = function(e){
  if(e.state){
    BODY.html(e.state.html)
    document.title = e.state.pageTitle
  }
}
