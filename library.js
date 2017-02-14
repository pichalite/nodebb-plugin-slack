(function(module) {
    'use strict';

    var User = module.parent.require('./user');
    var Topics = module.parent.require('./topics');
    var Categories = module.parent.require('./categories');
    var meta = module.parent.require('./meta');
    var nconf = module.parent.require('nconf');
    var async = module.parent.require('async');
    var SlackClient = require('slack-node');
    var slack = null;

    var constants = Object.freeze({
            name : 'slack',
            admin: {
                icon  : 'fa-slack',
                route : '/plugins/slack',
                label : 'Slack'
            }
        });
    
    var Slack = {
            config: {
                'webhookURL': '',
                'channel': '',
                'post:maxlength': '',
                'slack:categories': '',
                'topicsOnly': ''
            }
        };

    Slack.init = function(params, callback) {
        function render(req, res, next) {
            res.render('admin/plugins/slack', {});
        }
    
        params.router.get('/admin/plugins/slack', params.middleware.admin.buildHeader, render);
        params.router.get('/api/admin/plugins/slack', render);

        meta.settings.get('slack', function(err, settings) {
            for(var prop in Slack.config) {
                if (settings.hasOwnProperty(prop)) {
                    Slack.config[prop] = settings[prop];
                }
            }

            slack = new SlackClient();
            slack.setWebhook(Slack.config['webhookURL']);
        });

        callback();
    },

    Slack.postSave = function(post) {
        var topicsOnly = Slack.config['topicsOnly'] || 'off';
        
        if (topicsOnly === 'off' || (topicsOnly === 'on' && post.isMain)) {
            var content = post.content;
            
            async.parallel({
                user: function(callback) {
                    User.getUserFields(post.uid, ['username', 'picture'], callback);  
                },
                topic: function(callback) {
                    Topics.getTopicFields(post.tid, ['title', 'slug'], callback);
                },
                category: function(callback) {
                    Categories.getCategoryFields(post.cid, ['name'], callback);
                }
            }, function(err, data) {
                var categories = JSON.parse(Slack.config['slack:categories']);
                
                if (!categories || categories.indexOf(String(post.cid)) >= 0) {
                    // trim message based on config option
                    var maxContentLength = Slack.config['post:maxlength'] || false;
                    if (maxContentLength && content.length > maxContentLength) { content = content.substring(0, maxContentLength) + '...'; }
                    // message format: <username> posted [<categoryname> : <topicname>]\n <message>
                    var message = '<' + nconf.get('url') + '/topic/' + data.topic.slug + '|[' + data.category.name + ': ' + data.topic.title + ']>\n' + content;
                    
                    slack.webhook({
                        'text'     : message,
                        'channel'  : (Slack.config['channel'] || '#general'),
                        'username' : data.user.username,
                        'icon_url' : data.user.picture.match(/^\/\//) ? 'http:' + data.user.picture : data.user.picture
                    }, function(err, response) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        }
    },

    Slack.adminMenu = function(headers, callback) {
        headers.plugins.push({
            'route' : constants.admin.route,
            'icon'  : constants.admin.icon,
            'name'  : constants.admin.label
        });
        callback(null, headers);
    }

    module.exports = Slack;
    
}(module));
