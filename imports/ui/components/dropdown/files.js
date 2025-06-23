import './files.html';

Template.formatDropdown.onRendered(function () {
	this.$('#formats').dropdown();
});
