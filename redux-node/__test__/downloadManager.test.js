import sagaTester from "../sagaTester";
import {downloadManager } from '../saga'
import { EventEmitter2 } from "eventemitter2";


describe('downloadManager',()=>{
  it('下载进度测试',(done)=>{
    const eventbus = new EventEmitter2();
    eventbus.onAny(action=>{
      // 在这里进行测试
      expect(error.message).not.toBe()
      done()
    })
    sagaTester({
      eventbus
    },
    downloadManager,
    fn,
    500
    )
  
  })
})
