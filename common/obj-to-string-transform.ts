import { Transform, TransformCallback } from "stream";

export class ObjectToStringTransform extends Transform {
   constructor() {
      super({
         writableObjectMode: true,
      })
   }
    _transform(chunk: object, _: string, callback: TransformCallback) {
       callback(null, JSON.stringify(chunk));
    }
  }