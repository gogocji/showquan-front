export type ICommonInfo = {
  isShowDrawer?: boolean,
  defstyle?: boolean,
  showDrawer?: boolean,
  hasCloseNotification?: boolean,
  hasMessage?: boolean,
  hasComment?: boolean
};

export interface ICommonStore {
  commonInfo: ICommonInfo;
  // eslint-disable-next-line no-unused-vars
  setCommonInfo: (value: ICommonInfo) => void;
}

const commonStore = (): ICommonStore => {
  return {
    commonInfo: {
      hasComment: false
    },
    setCommonInfo: function (value) {
      this.commonInfo = value;
    },
  };
};

export default commonStore;

