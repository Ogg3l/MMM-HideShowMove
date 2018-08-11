'use strict';
/* global Module */

/* Magic Mirror
 * Module: MMM-SnipsHideShow
 *
 * By Max Bachmann
 * MIT Licensed.
 */

Module.register('MMM-SnipsHideShow', {

  defaults: {
    mqttServer: '',
    interval: 300000,
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.updateMqtt(this);
  },

  updateMqtt: function(self) {
    self.sendSocketNotification('MQTT_SERVER', { mqttServer: self.config.mqttServer});
    setTimeout(self.updateMqtt, self.config.interval, self);
  },


  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_DATA') {
      const topic = 'hermes/external/MagicMirror2/';
      const data = JSON.parse(payload.data.toString());
      if (payload.topic.toString() === topic + 'MM_Hide' || payload.topic.toString() === topic + 'MM_Show'){
          this.sendNotification(data.message);
      }else if (payload.topic.toString() === topic + 'MM_Move'){
        const modulename = data.module;
        const targetRegion = data.position;
        MM.getModules().enumerate((module) => {
          if (module.name === modulename) {
	          const instance = document.getElementById(module.identifier);
	          const region = document.querySelector(`div.region.${targetRegion} div.container`);
            region.insertBefore(instance, region.childNodes[0])
            region.style.display = 'block';
          }
        });
      }
      this.loaded = true;
    }

    if (notification === 'ERROR') {
      this.sendNotification('SHOW_ALERT', payload);
    }
  },
});