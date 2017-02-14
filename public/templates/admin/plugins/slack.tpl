<div class="row">
	<div class="col-lg-9">
		<div class="panel panel-default">
			<div class="panel-heading"><i class="fa fa-slack"></i> Slack notifications</div>
			<div class="panel-body">
				<p>
					Setup a <a href="http://slack.com" target="_blank">Slack</a> account and configure an Incoming WebHook from the Integrations section.
				</p>
				<form class="slack-settings">
					<div class="form-group col-xs-12">
						<label for="webhookURL">Webhook URL</label>
						<input type="text" name="webhookURL" title="webhookURL" class="form-control" placeholder="Webhook URL">
					</div>
					<div class="form-group col-xs-6">
						<label for="channel">Channel (include #)</label>
						<input type="text" name="channel" title="Channel" class="form-control" placeholder="Slack channel name. eg. #general">
					</div>
					<div class="form-group col-xs-6">
						<label for="postlength">Notification maximum characters</label>
						<input type="number" name="post:maxlength" title="Max length of posts before trimming." class="form-control" placeholder="Leave blank to send full post.">
					</div>
					<div class="form-group col-xs-12">
 						<label for="categories">Categories</label>
 						<select name="slack:categories" title="Categories" class="form-control slack-category" multiple>
                         </select>
 					</div>
 					<div class="form-group col-xs-12">
						<label for="topicsOnly">Notify for new topics only</label>
						<input type="checkbox" name="topicsOnly" title="topicsOnly">
					</div>
				</form>
			</div>
		</div>
	</div>
	<div class="col-lg-3">
		<div class="panel panel-default">
			<div class="panel-heading">Slack Control Panel</div>
			<div class="panel-body">
				<button class="btn btn-primary" id="save">Save Settings</button>
			</div>
		</div>
	</div>
</div>

<script>

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

	require(['settings'], function(Settings) {
		Settings.load('slack', $('.slack-settings'));

		$('#save').on('click', function() {
			Settings.save('slack', $('.slack-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'slack-saved',
					title: 'Settings Saved',
					message: 'Please reload your NodeBB to apply these settings',
					clickfn: function() {
						socket.emit('admin.reload');
					}
				});
			});
		});
	});
</script>