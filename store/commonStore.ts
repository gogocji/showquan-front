export type ICommonInfo = {
  isShowDrawer?: boolean
};

export interface ICommonStore {
  commonInfo: ICommonInfo;
  // eslint-disable-next-line no-unused-vars
  setCommonInfo: (value: ICommonInfo) => void;
}

const commonStore = (): ICommonStore => {
  return {
    commonInfo: {},
    setCommonInfo: function (value) {
      this.commonInfo = value;
    },
  };
};

export default commonStore;
