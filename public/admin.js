/* globals app, $, socket, define */

'use strict';

define('admin/plugins/slack', ['settings'], function (settings) {
  var Slack = {};

  $(document).ready(function() {
    var categories = null;

    function addOptionsToAllSelects() {
      $('.form-control.slack-category').each(function(index, element) {
        addOptionsToSelect($(element));
      });
    }

    function addOptionsToSelect(select) {
      for(var i=0; i<categories.length; ++i) {
        select.append('<option value=' + categories[i].cid + '>' + categories[i].name + '</option>');
      }
    }
        
        socket.emit('categories.get', function(err, data) {
      categories = data;
      addOptionsToAllSelects();
    });
  });

  Slack.init = function () {
    settings.load('slack', $('.slack-settings'));

    $('#save').on('click', function () {
      Promise.all([
        new Promise((resolve, reject) => {
          settings.save('slack', $('.slack-settings'), err => (!err ? resolve() : reject(err)));
        }),
      ]).then(() => {
        app.alert({
          type: 'success',
          alert_id: 'slack-saved',
          title: 'Settings Saved',
          message: 'Please reload your NodeBB to apply these settings',
          clickfn: function() {
            socket.emit('admin.reload');
          }
        });
      }).catch(app.alertError);
    });
  };

  return Slack;
});
