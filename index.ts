import * as http from 'http'
import * as fs from 'fs'
import * as p from 'path'
import * as url from 'url'
import { IncomingMessage, ServerResponse } from 'http'

const server = http.createServer()
const publicDir = p.resolve(__dirname, 'public')
const cacheage = 365 * 24 * 3600
server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    // console.log('request.method')
    // console.log(request.method)
    // console.log('request.headers')
    // console.log(request.headers)
    // console.log('request.url')
    // console.log(request.url)
    // response.end('hi')
    // const array: any = []
    // request.on('data', (chunk) => {
    //     array.push(chunk)
    // })
    // request.on('end', () => {
    //     const body = Buffer.concat(array).toString()
    //     console.log(body)
    // })
    const { method, url: path, headers } = request
    if (method !== 'GET') {
        response.statusCode = 405
        response.end()
    }
    const { pathname, search } = url.parse(path as string)//使用url.parse得到基本路径和查询字符串
    let filename = pathname?.substring(1)
    if (filename === '') {
        filename = 'index.html'
    }
    console.log(publicDir)
    console.log(filename)
    fs.readFile(p.resolve(publicDir, filename as string), (error, data) => {
        console.log(error)
        if (error) {
            if (error.errno === -4058) {
                response.statusCode = 404
                fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
                    response.end(data)
                })
            }
            else if (error.errno === -4068) {
                response.statusCode = 403
                response.end('无权限访问')
            } else {
                response.statusCode = 500
                response.end('服务器繁忙，请稍后再试')
            }
        } else {
            response.setHeader('Cache-Control', `public , max-age=${cacheage}`)//设置浏览器缓存 请求相同的内容不会在请求服务器
            response.end(data)//不需要将data.toString因为data作为buffer的形式  end可以展示其中的图片内容
        }
    });

}
)

server.listen('8888')
//监听端口