import { io } from "../index.js";

export const emitUserEvent = (event, data) => {
  io.emit(event, data);
};

export const emitPostEvent = (event, data) => {
  io.emit(event, data);
};

export const emitSaveEvent = (event, data) => {
  io.emit(event, data);
};

export const emitContactEvent = (event, data) => {
  io.emit(event, data);
};
