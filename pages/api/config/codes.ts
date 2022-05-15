export const EXCEPTION_USER = {
  NOT_LOGIN: {
    code: 1001,
    msg: '未登录',
  },
  NOT_FOUND: {
    code: 1002,
    msg: '未找到用户',
  },
  NOT_AUTHORIZE: {
    code: 1003,
    msg: '黑名单用户',
  }
};

export const EXCEPTION_ARTICLE = {
  PUBLISH_FAILED: {
    code: 2001,
    msg: '发布文章失败',
  },
  UPDATE_FAILED: {
    code: 2002,
    msg: '更新文章失败',
  },
  NOT_FOUND: {
    code: 2003,
    msg: '未找到文章',
  },
  THUMB_REPEAT: {
    code: 2004,
    msg: '已点赞',
  },
  SEATCH_FAILED: {
    code: 2005,
    msg: '搜索错误',
  },
};

export const EXCEPTION_TAG = {
  FOLLOW_FAILED: {
    code: 3001,
    msg: '关注/取关操作失败',
  },
};

export const EXCEPTION_COMMENT = {
  PUBLISH_FAILED: {
    code: 4001,
    msg: '发表失败',
  },
};

export const EXCEPTION_FOLLOW = {
  PUBLISH_FAILED: {
    code: 5001,
    msg: '关注失败',
  },
};

export const EXCEPTION_COMMON = {
  ADDVIEW_FAILED: {
    code: 6001,
    msg: '增加访问量失败',
  },
};

export const EXCEPTION_NOTIFICATION = {
  NOT_FOUND: {
    code: 7001,
    msg: '未找到该通知',
  },
  UPDATE_FAILED: {
    code: 7002,
    msg: '更新通知失败',
  },
  CREATE_FAILED: {
    code: 7003,
    msg: '发布通知失败',
  }
};