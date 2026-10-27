// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var driver_pb = require('./driver_pb.js');

function serialize_driver_AllList(arg) {
  if (!(arg instanceof driver_pb.AllList)) {
    throw new Error('Expected argument of type driver.AllList');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_AllList(buffer_arg) {
  return driver_pb.AllList.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_DeleteItem(arg) {
  if (!(arg instanceof driver_pb.DeleteItem)) {
    throw new Error('Expected argument of type driver.DeleteItem');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_DeleteItem(buffer_arg) {
  return driver_pb.DeleteItem.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_DeviceList(arg) {
  if (!(arg instanceof driver_pb.DeviceList)) {
    throw new Error('Expected argument of type driver.DeviceList');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_DeviceList(buffer_arg) {
  return driver_pb.DeviceList.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_Empty(arg) {
  if (!(arg instanceof driver_pb.Empty)) {
    throw new Error('Expected argument of type driver.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_Empty(buffer_arg) {
  return driver_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_GetAll(arg) {
  if (!(arg instanceof driver_pb.GetAll)) {
    throw new Error('Expected argument of type driver.GetAll');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_GetAll(buffer_arg) {
  return driver_pb.GetAll.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_GetItem(arg) {
  if (!(arg instanceof driver_pb.GetItem)) {
    throw new Error('Expected argument of type driver.GetItem');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_GetItem(buffer_arg) {
  return driver_pb.GetItem.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_InsertDb(arg) {
  if (!(arg instanceof driver_pb.InsertDb)) {
    throw new Error('Expected argument of type driver.InsertDb');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_InsertDb(buffer_arg) {
  return driver_pb.InsertDb.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_Item(arg) {
  if (!(arg instanceof driver_pb.Item)) {
    throw new Error('Expected argument of type driver.Item');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_Item(buffer_arg) {
  return driver_pb.Item.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_MicrophoneMuteStatus(arg) {
  if (!(arg instanceof driver_pb.MicrophoneMuteStatus)) {
    throw new Error('Expected argument of type driver.MicrophoneMuteStatus');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_MicrophoneMuteStatus(buffer_arg) {
  return driver_pb.MicrophoneMuteStatus.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_MuteMicrophone(arg) {
  if (!(arg instanceof driver_pb.MuteMicrophone)) {
    throw new Error('Expected argument of type driver.MuteMicrophone');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_MuteMicrophone(buffer_arg) {
  return driver_pb.MuteMicrophone.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_OTAUpgrade(arg) {
  if (!(arg instanceof driver_pb.OTAUpgrade)) {
    throw new Error('Expected argument of type driver.OTAUpgrade');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_OTAUpgrade(buffer_arg) {
  return driver_pb.OTAUpgrade.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_Progress(arg) {
  if (!(arg instanceof driver_pb.Progress)) {
    throw new Error('Expected argument of type driver.Progress');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_Progress(buffer_arg) {
  return driver_pb.Progress.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_ReadMsg(arg) {
  if (!(arg instanceof driver_pb.ReadMsg)) {
    throw new Error('Expected argument of type driver.ReadMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_ReadMsg(buffer_arg) {
  return driver_pb.ReadMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_ResRead(arg) {
  if (!(arg instanceof driver_pb.ResRead)) {
    throw new Error('Expected argument of type driver.ResRead');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_ResRead(buffer_arg) {
  return driver_pb.ResRead.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_ResSend(arg) {
  if (!(arg instanceof driver_pb.ResSend)) {
    throw new Error('Expected argument of type driver.ResSend');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_ResSend(buffer_arg) {
  return driver_pb.ResSend.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_SendMsg(arg) {
  if (!(arg instanceof driver_pb.SendMsg)) {
    throw new Error('Expected argument of type driver.SendMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_SendMsg(buffer_arg) {
  return driver_pb.SendMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_SetLight(arg) {
  if (!(arg instanceof driver_pb.SetLight)) {
    throw new Error('Expected argument of type driver.SetLight');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_SetLight(buffer_arg) {
  return driver_pb.SetLight.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_SystemInfo(arg) {
  if (!(arg instanceof driver_pb.SystemInfo)) {
    throw new Error('Expected argument of type driver.SystemInfo');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_SystemInfo(buffer_arg) {
  return driver_pb.SystemInfo.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_VenderMsg(arg) {
  if (!(arg instanceof driver_pb.VenderMsg)) {
    throw new Error('Expected argument of type driver.VenderMsg');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_VenderMsg(buffer_arg) {
  return driver_pb.VenderMsg.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_driver_WirelessLoopStatus(arg) {
  if (!(arg instanceof driver_pb.WirelessLoopStatus)) {
    throw new Error('Expected argument of type driver.WirelessLoopStatus');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_driver_WirelessLoopStatus(buffer_arg) {
  return driver_pb.WirelessLoopStatus.deserializeBinary(new Uint8Array(buffer_arg));
}


var DriverGrpcService = exports.DriverGrpcService = {
  watchDevList: {
    path: '/driver.DriverGrpc/watchDevList',
    requestStream: false,
    responseStream: true,
    requestType: driver_pb.Empty,
    responseType: driver_pb.DeviceList,
    requestSerialize: serialize_driver_Empty,
    requestDeserialize: deserialize_driver_Empty,
    responseSerialize: serialize_driver_DeviceList,
    responseDeserialize: deserialize_driver_DeviceList,
  },
  watchVender: {
    path: '/driver.DriverGrpc/watchVender',
    requestStream: false,
    responseStream: true,
    requestType: driver_pb.Empty,
    responseType: driver_pb.VenderMsg,
    requestSerialize: serialize_driver_Empty,
    requestDeserialize: deserialize_driver_Empty,
    responseSerialize: serialize_driver_VenderMsg,
    responseDeserialize: deserialize_driver_VenderMsg,
  },
  watchSystemInfo: {
    path: '/driver.DriverGrpc/watchSystemInfo',
    requestStream: false,
    responseStream: true,
    requestType: driver_pb.Empty,
    responseType: driver_pb.SystemInfo,
    requestSerialize: serialize_driver_Empty,
    requestDeserialize: deserialize_driver_Empty,
    responseSerialize: serialize_driver_SystemInfo,
    responseDeserialize: deserialize_driver_SystemInfo,
  },
  sendMsg: {
    path: '/driver.DriverGrpc/sendMsg',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.SendMsg,
    responseType: driver_pb.ResSend,
    requestSerialize: serialize_driver_SendMsg,
    requestDeserialize: deserialize_driver_SendMsg,
    responseSerialize: serialize_driver_ResSend,
    responseDeserialize: deserialize_driver_ResSend,
  },
  readMsg: {
    path: '/driver.DriverGrpc/readMsg',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.ReadMsg,
    responseType: driver_pb.ResRead,
    requestSerialize: serialize_driver_ReadMsg,
    requestDeserialize: deserialize_driver_ReadMsg,
    responseSerialize: serialize_driver_ResRead,
    responseDeserialize: deserialize_driver_ResRead,
  },
  sendRawFeature: {
    path: '/driver.DriverGrpc/sendRawFeature',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.SendMsg,
    responseType: driver_pb.ResSend,
    requestSerialize: serialize_driver_SendMsg,
    requestDeserialize: deserialize_driver_SendMsg,
    responseSerialize: serialize_driver_ResSend,
    responseDeserialize: deserialize_driver_ResSend,
  },
  readRawFeature: {
    path: '/driver.DriverGrpc/readRawFeature',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.ReadMsg,
    responseType: driver_pb.ResRead,
    requestSerialize: serialize_driver_ReadMsg,
    requestDeserialize: deserialize_driver_ReadMsg,
    responseSerialize: serialize_driver_ResRead,
    responseDeserialize: deserialize_driver_ResRead,
  },
  setLightType: {
    path: '/driver.DriverGrpc/setLightType',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.SetLight,
    responseType: driver_pb.Empty,
    requestSerialize: serialize_driver_SetLight,
    requestDeserialize: deserialize_driver_SetLight,
    responseSerialize: serialize_driver_Empty,
    responseDeserialize: deserialize_driver_Empty,
  },
  upgradeOTAGATT: {
    path: '/driver.DriverGrpc/upgradeOTAGATT',
    requestStream: false,
    responseStream: true,
    requestType: driver_pb.OTAUpgrade,
    responseType: driver_pb.Progress,
    requestSerialize: serialize_driver_OTAUpgrade,
    requestDeserialize: deserialize_driver_OTAUpgrade,
    responseSerialize: serialize_driver_Progress,
    responseDeserialize: deserialize_driver_Progress,
  },
  muteMicrophone: {
    path: '/driver.DriverGrpc/muteMicrophone',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.MuteMicrophone,
    responseType: driver_pb.ResSend,
    requestSerialize: serialize_driver_MuteMicrophone,
    requestDeserialize: deserialize_driver_MuteMicrophone,
    responseSerialize: serialize_driver_ResSend,
    responseDeserialize: deserialize_driver_ResSend,
  },
  toggleMicrophoneMute: {
    path: '/driver.DriverGrpc/toggleMicrophoneMute',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.Empty,
    responseType: driver_pb.ResSend,
    requestSerialize: serialize_driver_Empty,
    requestDeserialize: deserialize_driver_Empty,
    responseSerialize: serialize_driver_ResSend,
    responseDeserialize: deserialize_driver_ResSend,
  },
  getMicrophoneMute: {
    path: '/driver.DriverGrpc/getMicrophoneMute',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.Empty,
    responseType: driver_pb.MicrophoneMuteStatus,
    requestSerialize: serialize_driver_Empty,
    requestDeserialize: deserialize_driver_Empty,
    responseSerialize: serialize_driver_MicrophoneMuteStatus,
    responseDeserialize: deserialize_driver_MicrophoneMuteStatus,
  },
  insertDb: {
    path: '/driver.DriverGrpc/insertDb',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.InsertDb,
    responseType: driver_pb.ResSend,
    requestSerialize: serialize_driver_InsertDb,
    requestDeserialize: deserialize_driver_InsertDb,
    responseSerialize: serialize_driver_ResSend,
    responseDeserialize: deserialize_driver_ResSend,
  },
  deleteItemFromDb: {
    path: '/driver.DriverGrpc/deleteItemFromDb',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.DeleteItem,
    responseType: driver_pb.ResSend,
    requestSerialize: serialize_driver_DeleteItem,
    requestDeserialize: deserialize_driver_DeleteItem,
    responseSerialize: serialize_driver_ResSend,
    responseDeserialize: deserialize_driver_ResSend,
  },
  getItemFromDb: {
    path: '/driver.DriverGrpc/getItemFromDb',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.GetItem,
    responseType: driver_pb.Item,
    requestSerialize: serialize_driver_GetItem,
    requestDeserialize: deserialize_driver_GetItem,
    responseSerialize: serialize_driver_Item,
    responseDeserialize: deserialize_driver_Item,
  },
  getAllKeysFromDb: {
    path: '/driver.DriverGrpc/getAllKeysFromDb',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.GetAll,
    responseType: driver_pb.AllList,
    requestSerialize: serialize_driver_GetAll,
    requestDeserialize: deserialize_driver_GetAll,
    responseSerialize: serialize_driver_AllList,
    responseDeserialize: deserialize_driver_AllList,
  },
  getAllValuesFromDb: {
    path: '/driver.DriverGrpc/getAllValuesFromDb',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.GetAll,
    responseType: driver_pb.AllList,
    requestSerialize: serialize_driver_GetAll,
    requestDeserialize: deserialize_driver_GetAll,
    responseSerialize: serialize_driver_AllList,
    responseDeserialize: deserialize_driver_AllList,
  },
  changeWirelessLoopStatus: {
    path: '/driver.DriverGrpc/changeWirelessLoopStatus',
    requestStream: false,
    responseStream: false,
    requestType: driver_pb.WirelessLoopStatus,
    responseType: driver_pb.Empty,
    requestSerialize: serialize_driver_WirelessLoopStatus,
    requestDeserialize: deserialize_driver_WirelessLoopStatus,
    responseSerialize: serialize_driver_Empty,
    responseDeserialize: deserialize_driver_Empty,
  },
};

exports.DriverGrpcClient = grpc.makeGenericClientConstructor(DriverGrpcService);
