/* 
This code was written by Bormisov Vlad @bormisov.
 */
 
'use strict'

const $ = require('jquery')

const {
  getKeys,
  makeKeyPair,
  saveKeys,
  getState,
  submitUpdate,
  checkStatus
} = require('./state')
const {
  addOption,
  addTable,
  addAction
} = require('./components')

const concatNewOwners = (existing, ownerContainers) => {
  return existing.concat(ownerContainers
    .filter(({ owner }) => !existing.includes(owner))
    .map(({ owner }) => owner))
}

// Application Object
const app = { user: null, keys: [], isFinished: {} };

app.refresh = function () {
  getState((games) => {
    this.games = games;

    // Clear existing data views
    $('#data').children().slice(1).remove()
    $('[name="cellSelect"]').children().slice(1).remove()

    // Insert game data into view
    if (this.user)
      console.log(this.user.public);
    games.forEach(game => {
      if (
        this.user &&
        (
          (!game.player1Key || game.player1Key == this.user.public) ||
          (!game.player2Key || game.player2Key == this.user.public)
        ) &&
        !this.isFinished[game.name]
      ) {
        const stateSplitted = game.state.split('-');
        if (stateSplitted[1] == 'WIN') {
          this.isFinished[game.name] = true;
          alert((stateSplitted[0] == 'P1'?'x':'o') + " won");
        } else if (stateSplitted[1] == 'TIE') {
          this.isFinished[game.name] = true;
          alert("tie");
        } else {
          let cells = game.cells.split('');
          let table = [];
          while(cells.length) table.push(cells.splice(0,3));
          addTable('#data', table, game.name);
        }
      }
    });

    $('td').on('click', function () {
      let clicked = $(this);
      let col = clicked.index() + 1;
      let row = clicked.parent().index() + 1;
      app.update(clicked.parent().parent().data('gameName'), 'take', (row - 1) * 3 + col);
    });
  })
}

app.update = function (name, action, space) {
  console.log(this.user, name, action, space);
  if (this.user) {
    submitUpdate(
      [name, action, space?space:''].join(','),
      this.user.private,
      res => {
        if (!res) {
          return null;
        } else {
          checkUntilCommited(res, 0, (isCommited) => {
            if (!isCommited) {
              console.error("NOT COMMITED:", { name, action, space });
            } else {
              console.log('Commited.')
              this.refresh();
            }
          });
        }
      }
    )
  }
}

function checkUntilCommited (link, depth, callback) {
  if (depth >= 30) {
    callback(false)
  } else {
    checkStatus(link, isCommited => {
      if (!isCommited) return setTimeout(() => {
        checkUntilCommited(link, depth + 1, callback);
      }, 400)
      callback(true);
    });
  }
}

// Select User
$('[name="keySelect"]').on('change', function () {
  if (this.value === 'new') {
    app.user = makeKeyPair()
    app.keys.push(app.user)
    saveKeys(app.keys)
    addOption(this, app.user.public, true)
  } else if (this.value === 'none') {
    app.user = null
  } else {
    app.user = app.keys.find(key => key.public === this.value)
    console.log(app.keys, app.user)
    app.refresh()
  }
})

// Create Game
$('#createSubmit').on('click', function () {
  const name = $('#gameName').val();
  if (name) app.update(name, 'create');
})

/*
// Create Asset
$('#createSubmit').on('click', function () {
  const asset = $('#createName').val()
  if (asset) app.update('create', asset)
})

// Transfer Asset
$('#transferSubmit').on('click', function () {
  const asset = $('[name="assetSelect"]').val()
  const owner = $('[name="transferSelect"]').val()
  if (asset && owner) app.update('transfer', asset, owner)
})

// Accept Asset
$('#transferList').on('click', '.accept', function () {
  const asset = $(this).prev().text()
  if (asset) app.update('accept', asset)
})

$('#transferList').on('click', '.reject', function () {
  const asset = $(this).prev().prev().text()
  if (asset) app.update('reject', asset)
})
*/

// Initialize
app.keys = getKeys()
app.keys.forEach(pair => addOption('[name="keySelect"]', pair.public))
app.refresh()
