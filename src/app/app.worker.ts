import { Collaboration } from 'arlas-web-core';
/// <reference lib='webworker' />
const ports = new Set<MessagePort>();

let collaborations;
let pwithinraw;
let pwithin;
let crossSort;
addEventListener('connect', (connectEvent: any) => {
  const port = (connectEvent as MessageEvent).ports[0];
  ports.add(port);
  port.onmessage = (messageEvent: any) => {
    const broadcastedMessage = messageEvent.data;
    switch (broadcastedMessage.type) {
      case 'message':
        ports.forEach((connection) => {
          if (port !== connection) {
            connection.postMessage(broadcastedMessage);
          }
        });
        break;
      case 'init':
        if (broadcastedMessage.payload.name === 'list') {
          if (pwithin && pwithinraw && broadcastedMessage.payload.data === 'map-moveend') {
            port.postMessage({
              type: 'init',
              payload: {
                name: 'map-moveend',
                data: {
                  pwithin,
                  pwithinraw
                }
              }
            });
          }

          if (crossSort && broadcastedMessage.payload.data === 'sort-columns') {
            port.postMessage({
              type: 'init',
              payload: {
                name: 'sort-columns',
                data: crossSort
              }
            });
          }
        }
        break;
      case 'terminate':
        port.close();
        ports.delete(port);
        break;
    }
    if (broadcastedMessage.type === 'message' && broadcastedMessage.payload) {
      if (broadcastedMessage.payload.name === 'collaborations') {
        collaborations = broadcastedMessage.payload.data;
      }
      if (broadcastedMessage.payload.name === 'map-moveend') {
        pwithin = broadcastedMessage.payload.data.pwithin;
        pwithinraw = broadcastedMessage.payload.data.pwithinraw;
      }
      if (broadcastedMessage.payload.name === 'sort-columns') {
        crossSort = {
          listContributorId: broadcastedMessage.payload.data.listContributorId,
          column: broadcastedMessage.payload.data.column
        };
      }
    }
  };
  if (collaborations) {
    port.postMessage({
      type: 'message',
      payload: {
        name: 'collaborations',
        data: collaborations
      }
    });
  }
});
