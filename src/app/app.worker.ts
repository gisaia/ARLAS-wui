/// <reference lib='webworker' />
import {Collaboration} from 'arlas-web-core';
const ports = new Set<MessagePort>();

let collaborations;

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
      case 'terminate':
        port.close();
        ports.delete(port);
        console.log('terminating', port);
        break;
    }
    if (broadcastedMessage.type === 'message' && broadcastedMessage.payload && broadcastedMessage.payload.name === 'collaborations') {
      console.log(collaborations); 
      collaborations = broadcastedMessage.payload.data;
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
