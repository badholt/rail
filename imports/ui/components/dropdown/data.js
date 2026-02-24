import './data.html';

export const dataTemplates = [
    { group: 'yellow', id: 'mqtt', name: 'Network (MQTT)' },
    { group: 'orange', id: 'optogenetics', name: 'Optogenetics' },
    { group: 'yellow', id: 'responses', name: 'Responses' },
    { group: 'orange', id: 'sensor', name: 'Sensor - IR' },
    { group: 'yellow', id: 'settings', name: 'Settings' },
    { group: 'purple', id: 'shaping1', name: 'Shaping 1' },
    { group: 'purple', id: 'shaping2', name: 'Shaping 2' },
    { group: 'purple', id: 'shaping2b', name: 'Shaping 2b' },
    { group: 'purple', id: 'shaping4', name: 'Shaping 4' },
    { group: 'purple', id: 'shaping4v', name: 'Shaping 4 (Vertical)' },
    { group: 'purple', id: 'shaping6', name: 'Shaping 6' },
    { group: 'purple', id: 'shaping6v', name: 'Shaping 6 (Vertical)' },
    { group: 'purple', id: 'shaping8v', name: 'Shaping 8 (Vertical)' },
    { group: 'yellow', id: 'indices', name: 'Trials Repeated' },
    { group: 'teal', id: 'reward', name: 'Water Rewarded' }
];

Template.dataDropdown.onRendered(function () {
    const dataTemplate = Template.currentData().value;
    this.$('#templates').dropdown({ onChange: (value) => dataTemplate.set(value) });
});

Template.dataDropdown.helpers({
    'templates'() {
        return dataTemplates;
    }
});
