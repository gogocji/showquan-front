import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { IncomingForm } from 'formidable'
import { promises as fs } from 'fs'
import OSS from 'ali-oss'
import path from 'path'

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: 'oss-cn-guangzhou',
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: 'LTAI4G1uDx13XfG7juuihyVG',
  accessKeySecret: 'PZkwIp20kNFqldgnM5MqTBbnkAbOws',
  // 填写Bucket名称。关于Bucket名称命名规范的更多信息，请参见Bucket。
  bucket: 'gogocj-blog',
});

export const config = {
  api: {
    bodyParser: false,
  }
};

export default withIronSessionApiRoute(upload, ironOptions);

async function upload(req: NextApiRequest, res: NextApiResponse) {
  // parse form with a Promise wrapper
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm()
    
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
  const nowDate = new Date()
  const year = nowDate.getFullYear()
  const month = nowDate.getMonth()
  const day = nowDate.getDay()
  const nameFront = year + '/' + month + '/' + day + '/'
  const nameBack =  new Date().getTime() + '_';
  const resultUrl = await put(nameFront + nameBack + data.files.file.originalFilename, data?.files?.file?.filepath)
  res?.status(200)?.json({
    code: 0,
    msg: '',
    data: {
      url: resultUrl
    }
  });
}

async function put (fileName, filePath) {
  try {
    // 填写OSS文件完整路径和本地文件的完整路径。OSS文件完整路径中不能包含Bucket名称。
    // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
    const result = await client.put(fileName, path.normalize(filePath));
    // const result = await client.put('exampleobject.txt', path.normalize('D:\\localpath\\examplefile.txt'), { headers });   
    if (result?.res?.status == 200) {
      return result.url
    }
  } catch (e) {
    console.log(e);
  }
}