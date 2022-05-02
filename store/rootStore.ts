import userStore, { IUserStore } from './userStore';
import commonStore, { ICommonStore } from './commonStore';

export interface IStore {
  user: IUserStore;
  common: ICommonStore
}

export default function createStore(initialValue: any): () => IStore {
  return () => {
    return {
      user: { ...userStore(), ...initialValue?.user }, // 这里的...initialValue会对userStore的一些默认key进行覆盖更新
      common: { ...commonStore(), ...initialValue?.common }
    };
  };
}

 