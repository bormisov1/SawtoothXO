/* 
This code was written by Bormisov Vlad @bormisov.
 */

'use strict'

const $ = require('jquery')

// Add select option which may be set to selected
const addOption = (parent, value, selected = false) => {
  const selectTag = selected ? ' selected' : ''
  $(parent).append(`<option value="${value}"${selectTag}>${value}</option>`)
}

// Add a new table
const addTable = (parent, rows, gameName) => {
  rows = rows.map(row => {
    return `<td>${row.join('</td><td>')}</td>`.replace(/-/g, ' ');
  });
  const tbody = `<tr>${rows.join('</tr><tr>')}</tr>`;
  $(parent).append(`<table class="table table-hover">
                      <thead><h3>${gameName}</h3></thead>
                      <tbody data-game-name="${gameName}">${tbody}</tbody
                    </table>`);
}

// Add div with accept/reject buttons
const addAction = (parent, label, action) => {
  $(parent).append(`<div>
  <span>${label}</span>
  <input class="accept btn btn-primary" type="button" value="Accept">
  <input class="reject btn btn-caution" type="button" value="Reject">
</div>`)
}

module.exports = {
  addOption,
  addTable,
  addAction
}
