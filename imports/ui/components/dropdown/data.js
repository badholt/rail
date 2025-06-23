import './data.html';

Template.dataDropdown.onRendered(function () {
	const dataTemplate = Template.currentData().value;
	this.$('#templates').dropdown({ onChange: (value) => dataTemplate.set(value) });
});
